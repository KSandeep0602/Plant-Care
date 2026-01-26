'use client';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  async function doLogin(){
    const r = await fetch('/api/auth/login', { method:'POST', body: JSON.stringify({ email, password: pw }) });
    const j = await r.json();
    if (r.ok) window.location.href = '/'; else setMsg(j.error || 'Login failed');
  }
  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <div className="grid gap-3 mt-3">
        <input className="rounded-xl border px-3 py-2" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="rounded-xl border px-3 py-2" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} />
        <button onClick={doLogin} className="rounded-2xl bg-black text-white px-5 py-2 text-sm">Sign in</button>
        <p className="text-sm">New here? <a href="/signup" className="underline">Create account</a></p>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
      </div>
    </main>
  );
}