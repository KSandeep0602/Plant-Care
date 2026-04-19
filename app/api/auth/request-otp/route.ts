import { NextResponse } from "next/server";

export const runtime = "nodejs";

import { createOtp } from "@/app/lib/otpStore";

export async function POST(req: Request) {
  const { phone } = await req.json();

  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Phone is required" }, { status: 400 });
  }

  const { otp, expiresAt } = createOtp(phone);

  // For local development, return the OTP so you can test without SMS/WhatsApp.
  const isDev = process.env.NODE_ENV !== "production";

  console.log("OTP for", phone, ":", otp);

  return NextResponse.json({
    success: true,
    expiresAt,
    ...(isDev ? { devOtp: otp } : {}),
  });
}