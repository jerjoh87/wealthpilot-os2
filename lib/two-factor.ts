const TWO_FA_CODE_TTL_MS = 10 * 60 * 1000;

type TwoFactorState = {
  enabled: boolean;
  method: 'email';
};

type CodeState = {
  code: string;
  expiresAt: number;
};

const user2FA = new Map<string, TwoFactorState>();
const pendingCodes = new Map<string, CodeState>();

export const isDev = process.env.NODE_ENV !== 'production';

function normalizeEmail(email: string) {
  return String(email || '').trim().toLowerCase();
}

export function isTwoFactorEnabled(email: string) {
  const key = normalizeEmail(email);
  return Boolean(user2FA.get(key)?.enabled);
}

export function enableTwoFactor(email: string) {
  const key = normalizeEmail(email);
  user2FA.set(key, { enabled: true, method: 'email' });
  return user2FA.get(key);
}

export function disableTwoFactor(email: string) {
  const key = normalizeEmail(email);
  user2FA.set(key, { enabled: false, method: 'email' });
  pendingCodes.delete(key);
}

export function generateTwoFactorCode(email: string) {
  const key = normalizeEmail(email);
  const code = `${Math.floor(100000 + Math.random() * 900000)}`;
  pendingCodes.set(key, { code, expiresAt: Date.now() + TWO_FA_CODE_TTL_MS });
  return code;
}

export function verifyTwoFactorCode(email: string, code: string) {
  const key = normalizeEmail(email);
  const entry = pendingCodes.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    pendingCodes.delete(key);
    return false;
  }
  const isValid = entry.code === String(code || '').trim();
  if (isValid) pendingCodes.delete(key);
  return isValid;
}

export async function sendTwoFactorCode(email: string, code: string) {
  const from = process.env.EMAIL_FROM;
  const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS && from);

  if (smtpConfigured) {
    // SMTP transport is intentionally left as a backend integration point.
    // Keep secure default by not exposing code in any response.
    console.info(`[2FA] SMTP configured; email dispatch integration required for ${email}.`);
    return;
  }

  if (isDev) {
    console.info(`[2FA DEV ONLY] Code for ${email}: ${code}`);
  }
}
