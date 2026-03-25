'use client';
import { useState } from 'react';
import { Shell } from '../../components/shell';

export default function VerificationPage() {
  const [status, setStatus] = useState('');
  async function submit(formData: FormData) {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verification-requests`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    setStatus(res.ok ? 'Verification submitted.' : 'Verification failed.');
  }
  return <Shell title="Upload Verification Documents"><form action={submit} className="space-y-3"><input className="w-full border p-2" name="institutionId" placeholder="Institution ID" required/><textarea className="w-full border p-2" name="note" placeholder="Optional note"/><input className="w-full border p-2" type="file" name="documents" accept=".pdf,.png,.jpg,.jpeg" multiple required/><button className="rounded bg-blue-600 px-4 py-2 text-white">Submit for review</button><p>{status}</p></form></Shell>;
}
