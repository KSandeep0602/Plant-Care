import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/app/lib/mongodb";
import Reminder from "@/app/models/Reminder";
import User from "@/app/models/User";
import { startCron } from "@/app/lib/cron";

const SECRET = process.env.JWT_SECRET!;

async function getCurrentUser() {
  const token = cookies().get("token")?.value;
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, SECRET);
    const userId = decoded.userId as string | null;
    if (!userId) return null;

    const user = await User.findById(userId);
    if (!user) return null;

    return {
      id: user._id.toString(),
      phone: String(user.phone),
    };
  } catch {
    return null;
  }
}

// Mongoose model types can become a TS union in some route modules.
// Cast locally to keep route handlers typecheck-clean.
const ReminderModel = Reminder as any;

export const runtime = "nodejs";

// In dev, run an in-process cron so scheduled WhatsApp messages can fire.
// In production, prefer an external scheduler calling `/api/send-whatsapp`.
if (process.env.NODE_ENV !== "production") {
  startCron();
}

function parseLocalDateYYYYMMDD(value: string): Date | null {
  // Expected format from `<input type="date" />`: YYYY-MM-DD
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(value);
  if (!match) return null;

  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const day = Number(dayStr);

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) {
    return null;
  }

  // Default send time: 9:00 AM local time.
  const dt = new Date(year, monthIndex, day, 9, 0, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/* =========================
   GET + AUTO DELETE
========================= */
export async function GET() {
  await connectDB();

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json([]);
  }

  const userFilter = currentUser.id
    ? { $or: [{ userId: currentUser.id }, { phone: currentUser.phone }] }
    : { phone: currentUser.phone };

  const AUTO_DELETE_DAYS = 7;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - AUTO_DELETE_DAYS);

  // Delete completed reminders older than 7 days for this user
  await ReminderModel.deleteMany({
    ...userFilter,
    completed: true,
    completedAt: { $lte: cutoffDate },
  });

  const reminders = await ReminderModel.find(userFilter).sort({ createdAt: -1 });

  // Backward-compatible shape for the UI: always include `reminderDate`.
  const normalized = reminders.map((r: any) => {
    const obj = typeof r.toObject === "function" ? r.toObject() : r;
    return {
      ...obj,
      reminderDate: obj.reminderDate ?? obj.nextWateringDate,
    };
  });

  return NextResponse.json(normalized);
}

/* =========================
   ADD SMART reminder
========================= */
export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const plantName = String(body.plantName || "").trim();
  const phone = String(body.phone || "").trim();

  if (!plantName) {
    return NextResponse.json({ error: "plantName is required" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }

  // Frequency is optional from the UI; keep it safe.
  let frequencyPerWeek = Number(body.frequencyPerWeek);
  if (!Number.isFinite(frequencyPerWeek) || frequencyPerWeek <= 0) {
    frequencyPerWeek = 1;
  }

  const now = new Date();
  const requestedReminderDateRaw = typeof body.reminderDate === "string" ? body.reminderDate : "";
  const requestedReminderDate = requestedReminderDateRaw ? parseLocalDateYYYYMMDD(requestedReminderDateRaw) : null;

  // The UI is a date-only picker. If user chose today (or a past date), send ASAP.
  const nextWateringDate = requestedReminderDate && requestedReminderDate <= now ? now : (requestedReminderDate ?? now);

  if (Number.isNaN(nextWateringDate.getTime())) {
    return NextResponse.json({ error: "Invalid reminderDate" }, { status: 400 });
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const reminder = await ReminderModel.create({
    userId: currentUser.id,
    plantName,
    phone: currentUser.phone,
    frequencyPerWeek,
    nextWateringDate,
    reminderDate: requestedReminderDate ?? nextWateringDate,
    whatsappSent: false,
    completed: false,
  });

  return NextResponse.json(reminder);
}


/* =========================
   MARK REMINDER AS DONE
========================= */
export async function PATCH(req: Request) {
  await connectDB();
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await req.json();

  const updated = await ReminderModel.findOneAndUpdate(
    {
      _id: id,
      $or: [
        { userId: currentUser.id },
        { phone: currentUser.phone },
      ],
    },
    {
      completed: true,
      completedAt: new Date(),
    },
    { new: true }
  );

  return NextResponse.json(updated);
}

/* =========================
   DELETE REMINDER
========================= */
export async function DELETE(req: Request) {
  await connectDB();
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await req.json();

  await ReminderModel.findOneAndDelete({
    _id: id,
    $or: [
      { userId: currentUser.id },
      { phone: currentUser.phone },
    ],
  });
  return NextResponse.json({ success: true });
}
