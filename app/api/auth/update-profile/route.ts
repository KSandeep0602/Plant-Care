import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";

const SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  const { name, dob } = await req.json();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, SECRET);

    await connectDB();

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { name, dob },
      { new: true }
    );

    return NextResponse.json({ user });

  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}