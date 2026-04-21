export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { runPythonReminderSender } from "@/app/lib/pythonReminderSender";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const debug = url.searchParams.get("debug") === "1";

    console.log("📱 Triggering WhatsApp reminder sender (Python/Selenium)...");

    const result = await runPythonReminderSender();

    if (result.success) {
      return NextResponse.json({
        success: true,
        dueCount: result.sent,
        sentCount: result.sent,
        message: result.message,
        ...(debug ? { provider: "python-selenium-web" } : {}),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || result.message,
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("WhatsApp Error:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
