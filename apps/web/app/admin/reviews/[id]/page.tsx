'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '../../../../components/shell';
import { apiFetch, getAccessToken, parseAccessToken } from '../../../../lib/api';

type PendingUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  institution?: { id: string; name: string } | null;
};

type PendingInstitutionRequest = {
  id: string;
  name: string;
  countryCode: string;
  city?: string | null;
  isPublic: boolean;
  createdAt: string;
  requester: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
};

export default function AdminReviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const token = useMemo(() => getAccessToken(), []);
  const payload = useMemo(() => parseAccessToken(token), [token]);
  const isAdmin = payload?.role === 'super_admin';

  const [userRequest, setUserRequest] = useState<PendingUser | null>(null);
  const [institutionRequest, setInstitutionRequest] = useState<PendingInstitutionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadItem = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const [users, institutions] = await Promise.all([
        apiFetch<PendingUser[]>('/users/pending', undefined, token),
        apiFetch<PendingInstitutionRequest[]>('/institutions/requests/pending', undefined, token),
      ]);

      setUserRequest(users.find((item) => item.id === params.id) ?? null);
      setInstitutionRequest(institutions.find((item) => item.id === params.id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load review request.');
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      setError('Only super admins can access this review page.');
      setLoading(false);
      return;
    }

    void loadItem();
  }, [isAdmin, loadItem, router, token]);

  async function review(action: 'approve' | 'reject') {
    if (!token) return;
    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      if (userRequest) {
        await apiFetch(`/users/${userRequest.id}/approval`, { method: 'PATCH', body: JSON.stringify({ action }) }, token);
        setSuccess(`User ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      } else if (institutionRequest) {
        await apiFetch(
          `/institutions/requests/${institutionRequest.id}/review`,
          { method: 'PATCH', body: JSON.stringify({ action }) },
          token,
        );
        setSuccess(`Institution request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      }

      await loadItem();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} request.`);
    } finally {
      setBusy(false);
    }
  }

  const missing = !loading && !userRequest && !institutionRequest;

  return (
    <Shell title={`Review ${params.id}`} subtitle="Approve or reject pending users and institution requests.">
      <div className="space-y-4">
        {error ? <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
        {success ? <div className="card border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div> : null}

        {loading ? <div className="h-24 animate-pulse rounded-xl bg-slate-100" /> : null}

        {missing ? (
          <div className="card border-dashed p-5 text-sm text-slate-600">
            This request is no longer pending or does not exist.
          </div>
        ) : null}

        {userRequest ? (
          <div className="card space-y-2 p-4">
            <p className="text-sm font-semibold text-slate-900">Pending user</p>
            <p className="text-sm text-slate-700">{userRequest.email}</p>
            <p className="text-xs text-slate-500">Role: {userRequest.role}</p>
            <p className="text-xs text-slate-500">Institution: {userRequest.institution?.name ?? 'Not linked yet'}</p>
            <p className="text-xs text-slate-500">Submitted: {new Date(userRequest.createdAt).toLocaleString()}</p>
          </div>
        ) : null}

        {institutionRequest ? (
          <div className="card space-y-2 p-4">
            <p className="text-sm font-semibold text-slate-900">Pending institution request</p>
            <p className="text-sm text-slate-700">{institutionRequest.name}</p>
            <p className="text-xs text-slate-500">{institutionRequest.city ? `${institutionRequest.city}, ` : ''}{institutionRequest.countryCode}</p>
            <p className="text-xs text-slate-500">Type: {institutionRequest.isPublic ? 'Public' : 'Private'}</p>
            <p className="text-xs text-slate-500">Requester: {institutionRequest.requester.email}</p>
          </div>
        ) : null}

        {(userRequest || institutionRequest) ? (
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => void review('approve')} disabled={busy}>{busy ? 'Saving…' : 'Approve'}</button>
            <button className="btn-secondary" onClick={() => void review('reject')} disabled={busy}>{busy ? 'Saving…' : 'Reject'}</button>
          </div>
        ) : null}

        <Link href="/admin/reviews" className="inline-block text-sm font-medium text-blue-700 underline">Back to admin dashboard</Link>
      </div>
    </Shell>
  );
}
