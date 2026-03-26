'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '../../components/shell';
import { getCurrentUser } from '../../lib/api';

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
        setMessage('Login failed.');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      if (typeof data?.refreshToken === 'string' && data.refreshToken.length > 0) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      let destination = '/feed';
      try {
        const me = await getCurrentUser(data.accessToken);

        if (me?.role === 'super_admin') {
          destination = '/admin/reviews';
        } else if (me?.status === 'pending') {
          destination = '/pending-review';
        } else if (me?.status === 'approved' && !me?.institutionId) {
          destination = '/onboarding';
        }
      } catch (error) {
        console.error('Could not load current user after login; falling back to /feed', error);
      }

      router.replace(destination);
    } catch (error) {
      console.error('Login submit crashed', error);
      setMessage('Login failed.');
      setIsSubmitting(false);
    }
  }

  return (
    <Shell title="Login" subtitle="Access your student account.">
      <form action={submit} className="mx-auto grid w-full max-w-md gap-3">
        <input className="input" name="email" type="email" required placeholder="Email" />
        <input className="input" name="password" type="password" required placeholder="Password" />
        <button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Logging in…' : 'Login'}</button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        <p className="text-sm text-slate-600">Need an account? <Link href="/signup" className="text-blue-700 underline">Sign up</Link></p>
      </form>
    </Shell>
  );
}
