import cron from "node-cron";
import { connectDB } from "@/app/lib/mongodb";
import Reminder from "@/app/models/Reminder";
import twilio from "twilio";
import { calculateNextWatering } from "@/app/lib/smartWatering";

function normalizeWhatsAppAddress(value: string) {
  const v = String(value || "").trim();
  if (!v) return "";
  return v.startsWith("whatsapp:") ? v : `whatsapp:${v}`;
}

// Check if we already sent a reminder for this plant today
function hasReminderBeenSentToday(lastSentDate: Date | null): boolean {
  if (!lastSentDate) return false;

  const today = new Date();
  const lastSent = new Date(lastSentDate);

  return (
    today.getFullYear() === lastSent.getFullYear() &&
    today.getMonth() === lastSent.getMonth() &&
    today.getDate() === lastSent.getDate()
  );
}

let isCronRunning = false; // 🔥 Prevent multiple cron instances

export function startCron() {
  if (isCronRunning) return;
  isCronRunning = true;

  cron.schedule("* * * * *", async () => {
    console.log("⏰ Cron running: Checking WhatsApp reminders");

    try {
      const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } = process.env;
      if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
        console.error("❌ Twilio env variables missing");
        return;
      }

      await connectDB();

      const client = twilio(
        TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN
      );

      const reminders = await Reminder.find({ completed: false });

      const now = new Date();

      for (const reminder of reminders) {
        if (
          reminder.nextWateringDate &&
          now >= new Date(reminder.nextWateringDate)
        ) {
          // Check if we already sent a reminder for this plant today
          if (hasReminderBeenSentToday(reminder.lastReminderSentDate)) {
            console.log(`⏰ Skipping ${reminder.plantName} - already sent reminder today`);
            continue;
          }

          console.log(`🔔 Attempting reminder for ${reminder.plantName}`);

          const from = normalizeWhatsAppAddress(TWILIO_WHATSAPP_FROM);
          const to = normalizeWhatsAppAddress(reminder.phone);

          if (!to) {
            console.error("❌ Missing reminder phone; skipping", reminder._id);
            continue;
          }

          try {
            const message = await client.messages.create({
              from,
              to,
              body: `🌱 Time to water your ${reminder.plantName} 💧`,
            });

            console.log("✅ Message sent. SID:", message.sid);

            // 🔁 Update next watering date
            const newNextDate = calculateNextWatering(
              reminder.frequencyPerWeek || 1
            );

            reminder.nextWateringDate = newNextDate;
            reminder.whatsappSent = true;
            reminder.lastReminderSentDate = new Date();
            await reminder.save();

          } catch (twilioError: any) {
            console.error("❌ Twilio Error:", twilioError.message);
          }
        }
      }

    } catch (error: any) {
      console.error("❌ Cron Error:", error.message);
    }
  });
}