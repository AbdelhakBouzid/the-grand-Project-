'use client';
import { useState } from 'react';
import { Shell } from '../../components/shell';

export default function LoginPage() {
  const [message, setMessage] = useState('');
  async function submit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      setMessage('Logged in.');
    } else setMessage('Login failed.');
  }
  return <Shell title="Login"><form action={submit} className="space-y-3"><input className="w-full border p-2" name="email" type="email" required/><input className="w-full border p-2" name="password" type="password" required/><button className="rounded bg-blue-600 px-4 py-2 text-white">Login</button><p>{message}</p></form></Shell>;
}
