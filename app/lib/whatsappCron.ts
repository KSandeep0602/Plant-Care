import cron from "node-cron";
import { connectDB } from "./mongodb";
import Reminder from "@/app/models/Reminder";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// 🕘 Runs EVERY MINUTE (for testing)
cron.schedule("* * * * *", async () => {
  console.log("⏱️ Cron running...");

  await connectDB();

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const reminders = await Reminder.find({
    reminderDate: today,
    whatsappSent: false,
    phone: { $exists: true },
  });

  for (const r of reminders) {
    try {
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM!,
        to: `whatsapp:${r.phone}`,
        body: `🌱 Plant Reminder\n\nTake care of *${r.plantName}* today 🌿`,
      });

      r.whatsappSent = true;
      r.whatsappSentAt = new Date();
      await r.save();

      console.log("✅ WhatsApp sent to", r.phone);
    } catch (err) {
      console.error("❌ WhatsApp failed", err);
    }
  }
});
