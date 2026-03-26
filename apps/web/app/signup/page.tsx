'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '../../components/shell';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type AuthResponse = {
  accessToken?: string;
  refreshToken?: string;
  message?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  async function submit(formData: FormData) {
    setMessage('');

    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: AuthResponse = {};
      try {
        data = (await res.json()) as AuthResponse;
      } catch (parseError) {
        console.error('Signup response parse failed', parseError);
      }

      if (!res.ok) {
        const apiMessage = typeof data?.message === 'string' ? data.message : null;
        setMessage(apiMessage || 'Signup failed. Please try again.');
        return;
      }

      if (typeof data?.accessToken !== 'string' || data.accessToken.length === 0) {
        setMessage('Signup succeeded, but no session token was returned. Please log in.');
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      if (typeof data?.refreshToken === 'string' && data.refreshToken.length > 0) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      setMessage('Account created. Redirecting...');
      router.push('/onboarding');
    } catch (error) {
      console.error('Signup submit crashed', error);
      setMessage('Unable to sign up right now. Please try again in a moment.');
    }
  }

  return (
    <Shell title="Create your account" subtitle="Join your verified institution community.">
      <form action={submit} className="mx-auto grid w-full max-w-md gap-3">
        <input className="input" name="email" type="email" placeholder="Email" required />
        <input className="input" name="password" type="password" placeholder="Password" required />
        <button className="btn-primary">Create account</button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </form>
    </Shell>
  );
}
