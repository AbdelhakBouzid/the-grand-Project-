'use client';
import { useState } from 'react';
import { Shell } from '../../components/shell';

export default function SignupPage() {
  const [message, setMessage] = useState('');
  async function submit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setMessage(res.ok ? 'Account created.' : 'Signup failed.');
  }
  return <Shell title="Sign up"><form action={submit} className="space-y-3"><input className="w-full border p-2" name="email" type="email" placeholder="Email" required/><input className="w-full border p-2" name="password" type="password" placeholder="Password" required/><button className="rounded bg-blue-600 px-4 py-2 text-white">Create account</button><p>{message}</p></form></Shell>;
}
