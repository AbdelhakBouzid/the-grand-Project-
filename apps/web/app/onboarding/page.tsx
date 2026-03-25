'use client';
import { useState } from 'react';
import { Shell } from '../../components/shell';

export default function OnboardingPage() {
  const [status, setStatus] = useState('');
  async function submit(formData: FormData) {
    const token = localStorage.getItem('accessToken');
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/institutions/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...payload, isPublic: payload.isPublic === 'true' }) });
    setStatus(res.ok ? 'Institution request submitted.' : 'Request failed.');
  }
  return <Shell title="Onboarding"><form action={submit} className="space-y-3"><input className="w-full border p-2" name="name" placeholder="Institution Name" required/><input className="w-full border p-2" name="countryCode" placeholder="Country Code" required/><input className="w-full border p-2" name="city" placeholder="City"/><select className="w-full border p-2" name="isPublic"><option value="true">Public</option><option value="false">Private</option></select><button className="rounded bg-blue-600 px-4 py-2 text-white">Submit</button><p>{status}</p></form></Shell>;
}
