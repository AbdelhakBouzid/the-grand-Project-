'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

const REQUEST_INFO_PREFIX = '[REQUEST_MORE_INFO]';

export default function AdminReviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => getAccessToken(), []);
  const payload = useMemo(() => parseAccessToken(token), [token]);
  const isAdmin = payload?.role === 'super_admin' || payload?.role === 'reviewer';
  const type = searchParams.get('type');

  const [userRequest, setUserRequest] = useState<PendingUser | null>(null);
  const [institutionRequest, setInstitutionRequest] = useState<PendingInstitutionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');

  const loadItem = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      if (type === 'user') {
        const users = await apiFetch<PendingUser[]>('/users/pending', undefined, token);
        setUserRequest(users.find((item) => item.id === params.id) ?? null);
        setInstitutionRequest(null);
      } else if (type === 'institution') {
        const institutions = await apiFetch<PendingInstitutionRequest[]>('/institutions/requests/pending', undefined, token);
        setInstitutionRequest(institutions.find((item) => item.id === params.id) ?? null);
        setUserRequest(null);
      } else {
        const [users, institutions] = await Promise.all([
          apiFetch<PendingUser[]>('/users/pending', undefined, token),
          apiFetch<PendingInstitutionRequest[]>('/institutions/requests/pending', undefined, token),
        ]);

        setUserRequest(users.find((item) => item.id === params.id) ?? null);
        setInstitutionRequest(institutions.find((item) => item.id === params.id) ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load review request.');
    } finally {
      setLoading(false);
    }
  }, [params.id, token, type]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      setError('Only reviewers and super admins can access this review page.');
      setLoading(false);
      return;
    }

    void loadItem();
  }, [isAdmin, loadItem, router, token]);

  async function review(action: 'approve' | 'reject' | 'request_info') {
    if (!token) return;

    if (action === 'request_info' && !reason.trim()) {
      setError('Please add the information request note before submitting.');
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      if (userRequest) {
        await apiFetch(
          `/users/${userRequest.id}/approval`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              action: action === 'request_info' ? 'reject' : action,
              reason: action === 'request_info' ? `${REQUEST_INFO_PREFIX} ${reason.trim()}` : reason.trim() || undefined,
            }),
          },
          token,
        );
        setSuccess(
          action === 'request_info'
            ? 'Request for user information submitted.'
            : `User ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
        );
      } else if (institutionRequest) {
        await apiFetch(
          `/institutions/requests/${institutionRequest.id}/review`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              action: action === 'request_info' ? 'reject' : action,
              reason: action === 'request_info' ? `${REQUEST_INFO_PREFIX} ${reason.trim()}` : reason.trim() || undefined,
            }),
          },
          token,
        );
        setSuccess(
          action === 'request_info'
            ? 'Institution information request submitted.'
            : `Institution request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
        );
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
    <Shell title={`Review ${params.id}`} subtitle="Approve, reject, or request more information.">
      <div className="space-y-4">
        {error ? <div className="status-note status-note-error">{error}</div> : null}
        {success ? <div className="status-note status-note-success">{success}</div> : null}

        {loading ? <div className="h-24 animate-pulse rounded-xl bg-slate-200" /> : null}

        {missing ? (
          <div className="card border-dashed p-5 text-sm text-slate-500">
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
            <p className="text-xs text-slate-500">Submitted: {new Date(institutionRequest.createdAt).toLocaleString()}</p>
          </div>
        ) : null}

        {(userRequest || institutionRequest) ? (
          <>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Optional reason (required for request info)"
              className="textarea min-h-24 text-sm"
              disabled={busy}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button className="btn-primary" onClick={() => void review('approve')} disabled={busy}>{busy ? 'Saving…' : 'Approve'}</button>
              <button className="btn-secondary" onClick={() => void review('reject')} disabled={busy}>{busy ? 'Saving…' : 'Reject'}</button>
              <button className="btn-secondary" onClick={() => void review('request_info')} disabled={busy}>{busy ? 'Saving…' : 'Request info'}</button>
            </div>
          </>
        ) : null}

        <Link href="/admin/reviews" className="inline-block text-sm font-medium text-blue-300 underline">Back to admin dashboard</Link>
      </div>
    </Shell>
  );
}
