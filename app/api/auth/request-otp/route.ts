import { NextResponse } from "next/server";

export const runtime = "nodejs";

import { createOtp } from "@/app/lib/otpStore";

export async function POST(req: Request) {
  const { phone } = await req.json();

  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  // Validate phone number format: should be +91 followed by exactly 10 digits
  const phoneRegex = /^\+91\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return NextResponse.json({
      error: "Invalid phone number format. Please provide a valid 10-digit Indian phone number."
    }, { status: 400 });
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