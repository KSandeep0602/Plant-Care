import cron from "node-cron";
import Reminder from "@/models/Reminder";
import mongoose from "mongoose";
import twilio from "twilio";

// Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export function startWhatsAppCron() {
  // Runs every minute
  cron.schedule("* * * * *", async () => {
    console.log("⏱️ Checking WhatsApp reminders...");

    if (mongoose.connection.readyState === 0) return;

    const now = new Date();

    const reminders = await Reminder.find({
      reminderDate: { $lte: now },
      whatsappSent: false,
    });

    for (const reminder of reminders) {
      try {
        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM!,
          to: `whatsapp:${reminder.phone}`,
          body: `🌱 Plant Reminder\nTake care of *${reminder.plantName}*\n📅 ${reminder.reminderDate.toDateString()}`,
        });

        reminder.whatsappSent = true;
        await reminder.save();

        console.log("✅ WhatsApp sent to", reminder.phone);
      } catch (err) {
        console.error("❌ WhatsApp failed:", err);
      }
    }
  });
}
