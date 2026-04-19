import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { phone, otp } = await req.json(); // TODO: validate OTP from DB 
  return NextResponse.json({
    success: true,
    user: { phone },
  });
}