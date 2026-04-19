import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";

const SECRET = process.env.JWT_SECRET!;

export async function GET() {
  // ✅ FIX: await cookies()
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const decoded: any = jwt.verify(token, SECRET);

    await connectDB();

    const user = await User.findById(decoded.userId);

    return NextResponse.json({ user });

  } catch (error) {
    return NextResponse.json({ user: null });
  }
}