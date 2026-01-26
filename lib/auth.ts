import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

export function issueJWT(userId: string) {
  return jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function setAuthCookie(token: string) {
  cookies().set('pc_token', token, { httpOnly: true, sameSite: 'lax', path: '/' });
}

export function getUserIdFromCookie(): string | null {
  const token = cookies().get('pc_token')?.value;
  if (!token) return null;
  try { return (jwt.verify(token, JWT_SECRET) as any).uid; } catch { return null; }
}

export async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

export async function comparePassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function validPassword(pw: string) {
  // must contain upper, lower, digit, special, min 8
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pw);
}