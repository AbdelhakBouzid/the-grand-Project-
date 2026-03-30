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
    <Shell title="Onboarding" subtitle="Submit your institution profile to activate your account access.">
      <form action={submit} className="mx-auto grid w-full max-w-2xl gap-4">
        <div className="card grid gap-4 p-5 sm:p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Institution Name</label>
            <input className="input" name="name" placeholder="University name" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Country Code</label>
              <input className="input" name="countryCode" placeholder="US" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">City</label>
              <input className="input" name="city" placeholder="City" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Institution Visibility</label>
            <select className="input" name="isPublic">
              <option value="true">Public</option>
              <option value="false">Private</option>
            </select>
          </div>
          <button className="btn-primary w-full sm:w-fit">Submit request</button>
        </div>
        {status ? <p className="status-note status-note-warning">{status}</p> : null}
      </form>
    </Shell>
  );
}
