'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '../../components/shell';
import { getCurrentUser } from '../../lib/api';
import { resolvePostAuthRoute } from '../../lib/routing';

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(formData: FormData) {
    setIsSubmitting(true);
    setMessage('');
    try {
      const payload = Object.fromEntries(formData.entries());
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || typeof data?.accessToken !== 'string' || data.accessToken.length === 0) {
        setMessage('Login failed. Please check your credentials.');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      if (typeof data?.refreshToken === 'string' && data.refreshToken.length > 0) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      let destination = '/onboarding';
      try {
        const me = await getCurrentUser(data.accessToken);
        destination = resolvePostAuthRoute(me);
      } catch (error) {
        console.error('Could not load current user after login; falling back to /onboarding', error);
      }

      router.replace(destination);
    } catch (error) {
      console.error('Login submit crashed', error);
      setMessage('Login failed.');
      setIsSubmitting(false);
    }
  }

  return (
    <Shell title="Welcome back" subtitle="Log in to continue your verified institution workflow.">
      <form action={submit} className="mx-auto grid w-full max-w-md gap-4">
        <div className="card space-y-4 p-5 sm:p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input className="input" name="email" type="email" required placeholder="you@institution.edu" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input className="input" name="password" type="password" required placeholder="••••••••" />
          </div>
          <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Logging in…' : 'Login'}</button>
          {message ? <p className="status-note status-note-error">{message}</p> : null}
        </div>
        <p className="text-center text-sm text-slate-400">Need an account? <Link href="/signup" className="font-semibold text-blue-300 underline">Sign up</Link></p>
      </form>
    </Shell>
  );
}
