'use client';
import { useState } from 'react';
import { z } from 'zod';

const emailSchema = z.string().email();
const pwHint = 'Min 8 chars with upper, lower, number, and special character.';

export default function Signup() {
  const [step, setStep] = useState<'email'|'verify'|'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [pw, setPw] = useState('');

  async function startSignup() {
    setMsg('');
    if (!emailSchema.safeParse(email).success) return setMsg('Enter a valid email.');
    const r = await fetch('/api/auth/signup', { method:'POST', body: JSON.stringify({ email }) });
    const j = await r.json();
    if (r.ok) { setStep('verify'); setMsg(j.devHint || 'We sent a code to your email.'); }
    else setMsg(j.error || 'Failed');
  }
  async function verifyCode() {
    const r = await fetch('/api/auth/verify-otp', { method:'POST', body: JSON.stringify({ email, otp }) });
    const j = await r.json();
    if (r.ok) { setStep('password'); setMsg('Email verified! Create your password.'); }
    else setMsg(j.error || 'Invalid code');
  }
  async function setPassword() {
    const r = await fetch('/api/auth/set-password', { method:'POST', body: JSON.stringify({ email, password: pw }) });
    const j = await r.json();
    if (r.ok) window.location.href = '/';
    else setMsg(j.error || 'Password not set');
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="text-sm text-gray-600">We’ll verify your email, then you’ll set a strong password.</p>
      <div className="h-2" />
      {step==='email' && (
        <div className="grid gap-3">
          <input className="rounded-xl border px-3 py-2" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <button onClick={startSignup} className="rounded-2xl bg-black text-white px-5 py-2 text-sm">Send code</button>
        </div>
      )}
      {step==='verify' && (
        <div className="grid gap-3">
          <input className="rounded-xl border px-3 py-2" placeholder="Enter 6‑digit code" value={otp} onChange={e=>setOtp(e.target.value)} />
          <button onClick={verifyCode} className="rounded-2xl bg-black text-white px-5 py-2 text-sm">Verify</button>
        </div>
      )}
      {step==='password' && (
        <div className="grid gap-2">
          <input type="password" className="rounded-xl border px-3 py-2" placeholder="Create password" value={pw} onChange={e=>setPw(e.target.value)} />
          <p className="text-xs text-gray-500">{pwHint}</p>
          <button disabled={!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pw)} onClick={setPassword} className="rounded-2xl bg-green-600 text-white px-5 py-2 text-sm disabled:opacity-50">Finish</button>
        </div>
      )}
      {msg && <p className="mt-3 text-sm text-blue-600">{msg}</p>}
      <p className="mt-6 text-sm">Already have an account? <a href="/login" className="underline">Sign in</a></p>
    </main>
  );
}