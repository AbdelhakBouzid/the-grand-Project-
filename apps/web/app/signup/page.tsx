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
        console.error('Signup request failed', {
          status: res.status,
          statusText: res.statusText,
          response: data,
        });
        return;
      }

      if (typeof data?.accessToken !== 'string' || data.accessToken.length === 0) {
        setMessage('Signup succeeded, but no session token was returned. Please log in.');
        console.error('Signup succeeded without expected tokens', data);
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

  return <Shell title="Sign up"><form action={submit} className="space-y-3"><input className="w-full border p-2" name="email" type="email" placeholder="Email" required/><input className="w-full border p-2" name="password" type="password" placeholder="Password" required/><button className="rounded bg-blue-600 px-4 py-2 text-white">Create account</button><p>{message}</p></form></Shell>;
}
