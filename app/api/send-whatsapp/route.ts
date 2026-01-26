export const runtime = "nodejs";

import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: Request) {
  try {
    const {
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_WHATSAPP_FROM,
    } = process.env;

    console.log("SID:", TWILIO_ACCOUNT_SID);
    console.log("TOKEN:", TWILIO_AUTH_TOKEN ? "LOADED" : "MISSING");
    console.log("FROM:", TWILIO_WHATSAPP_FROM);

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
      throw new Error("Twilio env vars missing");
    }

    const { phone, plantName, reminderDate } = await req.json();

    const client = twilio(
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${phone}`,
      body: `🌱 Plant Reminder\n\nTake care of *${plantName}*\n📅 Date: ${reminderDate}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WhatsApp Error:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
