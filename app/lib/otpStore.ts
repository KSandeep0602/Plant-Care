type OtpRecord = {
  otp: string;
  expiresAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __plantCareOtpStore: Map<string, OtpRecord> | undefined;
}

function getStore(): Map<string, OtpRecord> {
  if (!globalThis.__plantCareOtpStore) {
    globalThis.__plantCareOtpStore = new Map();
  }
  return globalThis.__plantCareOtpStore;
}

export function createOtp(target: string, ttlMs = 5 * 60 * 1000) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + ttlMs;
  getStore().set(target, { otp, expiresAt });
  return { otp, expiresAt };
}

export function peekOtp(target: string): string | null {
  const rec = getStore().get(target);
  if (!rec) return null;
  if (Date.now() > rec.expiresAt) {
    getStore().delete(target);
    return null;
  }
  return rec.otp;
}

export function consumeOtp(target: string, otp: string): boolean {
  const rec = getStore().get(target);
  if (!rec) return false;
  if (Date.now() > rec.expiresAt) {
    getStore().delete(target);
    return false;
  }
  if (rec.otp !== otp) return false;
  getStore().delete(target);
  return true;
}
