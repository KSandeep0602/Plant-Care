import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, plantName } = await req.json();

    const data = await resend.emails.send({
      from: "PlantCare <onboarding@resend.dev>", // TEST sender
      to: email,
      subject: "🌱 Plant Care Reminder",
      html: `<p>Time to take care of <b>${plantName}</b> 🌿</p>`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
