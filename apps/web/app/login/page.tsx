'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Shell } from '../../components/shell';

export default function LoginPage() {
  const [message, setMessage] = useState('');

  async function submit(formData: FormData) {
    setMessage('');
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      setMessage('Logged in successfully.');
    } else setMessage('Login failed.');
  }

  return (
    <Shell title="Login" subtitle="Access your student account.">
      <form action={submit} className="mx-auto grid w-full max-w-md gap-3">
        <input className="input" name="email" type="email" required placeholder="Email" />
        <input className="input" name="password" type="password" required placeholder="Password" />
        <button className="btn-primary">Login</button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        <p className="text-sm text-slate-600">Need an account? <Link href="/signup" className="text-blue-700 underline">Sign up</Link></p>
      </form>
    </Shell>
  );
}
