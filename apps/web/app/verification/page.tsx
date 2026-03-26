'use client';

import { useState } from 'react';
import { Shell } from '../../components/shell';

export default function VerificationPage() {
  const [status, setStatus] = useState('');

  async function submit(formData: FormData) {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verification-requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    setStatus(res.ok ? 'Verification submitted.' : 'Verification failed.');
  }

  return (
    <Shell title="Verification" subtitle="Upload your documents for manual review.">
      <form action={submit} className="mx-auto grid w-full max-w-lg gap-3">
        <input className="input" name="institutionId" placeholder="Institution ID" required />
        <textarea className="textarea" name="note" placeholder="Optional note" />
        <input className="input" type="file" name="documents" accept=".pdf,.png,.jpg,.jpeg" multiple required />
        <button className="btn-primary">Submit for review</button>
        {status ? <p className="text-sm text-slate-600">{status}</p> : null}
      </form>
    </Shell>
  );
}
