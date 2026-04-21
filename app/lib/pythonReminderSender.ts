import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { open, unlink, stat } from 'fs/promises';

type PythonReminderResult = {
  success: boolean;
  sent: number;
  message: string;
  error?: string;
};

/**
 * Execute Python reminder sender and return results
 * Uses WhatsApp Web (Selenium) - no Twilio needed
 */
export async function runPythonReminderSender(): Promise<PythonReminderResult> {
  const lockPath = path.join(os.tmpdir(), 'plantcare-python-reminder.lock');
  let lockHandle: Awaited<ReturnType<typeof open>> | null = null;

  // Clear stale lock older than 15 minutes.
  try {
    const s = await stat(lockPath);
    if (Date.now() - s.mtimeMs > 15 * 60 * 1000) {
      await unlink(lockPath).catch(() => undefined);
    }
  } catch {
    // no existing lock
  }

  try {
    lockHandle = await open(lockPath, 'wx');
    await lockHandle.writeFile(String(process.pid));
  } catch {
    return {
      success: false,
      sent: 0,
      message: 'Python reminder sender already running',
      error: 'Skipped to avoid opening multiple browser sessions',
    };
  }

  return new Promise((resolve) => {
    const pythonScript = path.join(process.cwd(), 'scripts', 'reminder_sender_web.py');
    const venvPython = path.join(process.cwd(), '.venv', 'Scripts', 'python.exe');
    const pythonBinary = process.env.PYTHON_EXECUTABLE || venvPython;
    let settled = false;
    
    // Run Python script with headless=True (no browser window)
    const python = spawn(pythonBinary, [pythonScript], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PYTHONDONTWRITEBYTECODE: '1',
        PYTHONUTF8: '1',
        PYTHONIOENCODING: 'utf-8',
      },
    });

    let stdout = '';
    let stderr = '';

    python.stdout?.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log('[Python] ' + output.trim());
    });

    python.stderr?.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.error('[Python Error] ' + output.trim());
    });

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      python.kill();
      lockHandle?.close().catch(() => undefined).finally(() => {
        unlink(lockPath).catch(() => undefined);
      });
      resolve({
        success: false,
        sent: 0,
        message: 'Python reminder sender timeout',
        error: 'Script took longer than 5 minutes',
      });
    }, 5 * 60 * 1000);

    python.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      lockHandle?.close().catch(() => undefined).finally(() => {
        unlink(lockPath).catch(() => undefined);
      });

      if (code === 0) {
        // Extract sent count from output
        const sentMatch = stdout.match(/Sent: (\d+)/);
        const sent = sentMatch ? parseInt(sentMatch[1], 10) : 0;

        resolve({
          success: true,
          sent,
          message: `Python reminder sender completed: ${sent} reminders sent`,
        });
      } else {
        resolve({
          success: false,
          sent: 0,
          message: 'Python reminder sender failed',
          error: (stderr || stdout || 'Unknown error').trim(),
        });
      }
    });

    python.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      lockHandle?.close().catch(() => undefined).finally(() => {
        unlink(lockPath).catch(() => undefined);
      });
      resolve({
        success: false,
        sent: 0,
        message: 'Failed to spawn Python process',
        error: err.message,
      });
    });
  });
}
