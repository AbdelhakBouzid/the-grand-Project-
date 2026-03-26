'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '../../components/shell';

export default function OnboardingPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');

  async function submit(formData: FormData) {
    const token = localStorage.getItem('accessToken');
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/institutions/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...payload, isPublic: payload.isPublic === 'true' }),
    });
    if (res.ok) {
      setStatus('Institution request submitted.');
      router.replace('/pending-review');
      return;
    }

    setStatus('Request failed.');
  }

  return (
    <Shell title="Onboarding" subtitle="Request institution approval to unlock your account.">
      <form action={submit} className="mx-auto grid w-full max-w-lg gap-3">
        <input className="input" name="name" placeholder="Institution Name" required />
        <input className="input" name="countryCode" placeholder="Country Code" required />
        <input className="input" name="city" placeholder="City" />
        <select className="input" name="isPublic">
          <option value="true">Public</option>
          <option value="false">Private</option>
        </select>
        <button className="btn-primary">Submit request</button>
        {status ? <p className="text-sm text-slate-600">{status}</p> : null}
      </form>
    </Shell>
  );
}
