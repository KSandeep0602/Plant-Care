import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { consumeOtp } from "@/app/lib/otpStore";

const SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  const { phone, otp } = await req.json();

  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Phone is required" }, { status: 400 });
  }
  if (!otp || typeof otp !== "string") {
    return NextResponse.json({ error: "OTP is required" }, { status: 400 });
  }

  const ok = consumeOtp(phone, otp);

  if (!ok) {
    return NextResponse.json(
      { error: "Invalid OTP" },
      { status: 401 }
    );
  }

  await connectDB();

  let user = await User.findOne({ phone });

  if (!user) {
    user = await User.create({ phone });
  }

  const token = jwt.sign(
    { userId: user._id },
    SECRET,
    { expiresIn: "7d" }
  );

  const response = NextResponse.json({ success: true });

  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
  });

  return response;
}