import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Reminder from "@/app/models/Reminder";

/* =========================
   GET + AUTO DELETE
========================= */
export async function GET() {
  await connectDB();

  const AUTO_DELETE_DAYS = 7;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - AUTO_DELETE_DAYS);

  await Reminder.deleteMany({
    completed: true,
    completedAt: { $lte: cutoffDate },
  });

  const reminders = await Reminder.find().sort({ createdAt: -1 });
  return NextResponse.json(reminders);
}

/* =========================
   ADD reminder (WITH PHONE)
========================= */
export async function POST(req: Request) {
  await connectDB();

  const { plantName, reminderDate, phone } = await req.json();

  const reminder = await Reminder.create({
    plantName,
    reminderDate,
    phone,               // ✅ IMPORTANT
    whatsappSent: false, // ✅ for cron
  });

  return NextResponse.json(reminder);
}

/* =========================
   MARK reminder as done
========================= */
export async function PATCH(req: Request) {
  await connectDB();
  const { id } = await req.json();

  const updated = await Reminder.findByIdAndUpdate(
    id,
    {
      completed: true,
      completedAt: new Date(),
    },
    { new: true }
  );

  return NextResponse.json(updated);
}

/* =========================
   DELETE reminder
========================= */
export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();

  await Reminder.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
