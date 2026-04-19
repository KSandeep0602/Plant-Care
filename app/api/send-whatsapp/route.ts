export const runtime = "nodejs";

import { NextResponse } from "next/server";
import twilio from "twilio";
import { connectDB } from "@/app/lib/mongodb";
import Reminder from "@/app/models/Reminder";
import { calculateNextWatering } from "@/app/lib/smartWatering";

function normalizeWhatsAppAddress(value: string) {
  const v = String(value || "").trim();
  if (!v) return "";
  return v.startsWith("whatsapp:") ? v : `whatsapp:${v}`;
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const debug = url.searchParams.get("debug") === "1";

    const {
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_WHATSAPP_FROM,
    } = process.env;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
      throw new Error("Twilio env vars missing");
    }

    const client = twilio(
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN
    );

    const reminders = await Reminder.find({ completed: false });

    const today = new Date();
    let dueCount = 0;
    let sentCount = 0;

    const debugMessages: Array<{
      reminderId: string;
      plantName: string;
      to: string;
      sid: string;
      status: string | null;
      errorCode: number | null;
      errorMessage: string | null;
    }> = [];
    const warnings: string[] = [];

    const from = normalizeWhatsAppAddress(TWILIO_WHATSAPP_FROM);
    if (!from) {
      throw new Error("TWILIO_WHATSAPP_FROM is empty");
    }
    if (from === "whatsapp:+14155238886") {
      warnings.push(
        "Using Twilio WhatsApp Sandbox (+14155238886). Your recipient number must join the sandbox before it can receive messages."
      );
    }

    for (const reminder of reminders) {
      if (
        reminder.nextWateringDate &&
        today >= new Date(reminder.nextWateringDate)
      ) {
        dueCount++;
        console.log(`🔔 Sending reminder for ${reminder.plantName}`);

        const to = normalizeWhatsAppAddress(reminder.phone);

        if (!to) {
          console.error("❌ Missing reminder phone; skipping", reminder._id);
          continue;
        }

        if (debug && typeof reminder.phone === "string" && !reminder.phone.trim().startsWith("+") && !reminder.phone.trim().startsWith("whatsapp:+")) {
          warnings.push(
            `Reminder ${reminder._id}: phone does not look like E.164 (expected +<countrycode><number>). Current: '${reminder.phone}'.`
          );
        }

        // 📲 Send WhatsApp
        const message = await client.messages.create({
          from,
          to,
          body: `🌱 Plant Reminder\n\nTime to water *${reminder.plantName}* 💧`,
        });

        console.log("✅ WhatsApp queued. SID:", message.sid, "Status:", message.status);

        if (debug) {
          debugMessages.push({
            reminderId: String(reminder._id),
            plantName: String(reminder.plantName),
            to,
            sid: String(message.sid),
            status: (message.status ?? null) as any,
            errorCode: (message.errorCode ?? null) as any,
            errorMessage: (message.errorMessage ?? null) as any,
          });
        }

        sentCount++;

        // 🔁 Calculate next watering
        const newNextDate = calculateNextWatering(
          reminder.frequencyPerWeek
        );

        reminder.nextWateringDate = newNextDate;
        reminder.whatsappSent = true;

        await reminder.save();
      }
    }

    return NextResponse.json({
      success: true,
      dueCount,
      sentCount,
      ...(debug ? { warnings, messages: debugMessages } : {}),
    });

  } catch (err: any) {
    console.error("WhatsApp Error:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
