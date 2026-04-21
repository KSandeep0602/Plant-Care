import cron from "node-cron";
import { runPythonReminderSender } from "@/app/lib/pythonReminderSender";
import { open, unlink, stat } from "fs/promises";
import os from "os";
import path from "path";

type GlobalCronState = {
  __plantCareCronStarted?: boolean;
  __plantCareReminderJobInProgress?: boolean;
};

const cronState = globalThis as GlobalCronState;
const cronLockPath = path.join(os.tmpdir(), "plantcare-reminder-cron.lock");

if (typeof cronState.__plantCareCronStarted === "undefined") {
  cronState.__plantCareCronStarted = false;
}
if (typeof cronState.__plantCareReminderJobInProgress === "undefined") {
  cronState.__plantCareReminderJobInProgress = false;
}

export function startCron() {
  if (cronState.__plantCareCronStarted) return;

  cronState.__plantCareCronStarted = true;

  let lockHandle: Awaited<ReturnType<typeof open>> | null = null;

  const acquireLock = async () => {
    try {
      const s = await stat(cronLockPath);
      if (Date.now() - s.mtimeMs > 15 * 60 * 1000) {
        await unlink(cronLockPath).catch(() => undefined);
      }
    } catch {
      // no existing lock
    }

    try {
      lockHandle = await open(cronLockPath, "wx");
      await lockHandle.writeFile(String(process.pid));
      return true;
    } catch {
      return false;
    }
  };

  acquireLock().then((locked) => {
    if (!locked) {
      cronState.__plantCareCronStarted = false;
      console.log("⏭️ Reminder cron already active in another process");
      return;
    }

    cron.schedule("* * * * *", async () => {
      if (cronState.__plantCareReminderJobInProgress) {
        console.log("⏭️ Skipping cron tick: previous reminder job still running");
        return;
      }

      cronState.__plantCareReminderJobInProgress = true;
      console.log("⏰ Cron running: Checking WhatsApp reminders (Python/Selenium)");

      try {
        const result = await runPythonReminderSender();

        if (result.success) {
          console.log(`✅ ${result.message}`);
        } else {
          console.error(`❌ ${result.message}: ${result.error}`);
        }
      } catch (error: any) {
        console.error("❌ Cron Error:", error.message);
      } finally {
        cronState.__plantCareReminderJobInProgress = false;
      }
    });
  });
}