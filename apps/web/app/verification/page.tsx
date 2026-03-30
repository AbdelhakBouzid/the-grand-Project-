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
    <Shell title="Verification" subtitle="Upload your documents for manual reviewer validation.">
      <form action={submit} className="mx-auto grid w-full max-w-lg gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Institution ID</label>
          <input className="input" name="institutionId" placeholder="Institution UUID" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Note (optional)</label>
          <textarea className="textarea" name="note" placeholder="Anything reviewers should know" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Supporting documents</label>
          <input className="input" type="file" name="documents" accept=".pdf,.png,.jpg,.jpeg" multiple required />
        </div>
        <button className="btn-primary">Submit for review</button>
        {status ? <p className="status-note status-note-warning">{status}</p> : null}
      </form>
    </Shell>
  );
}
