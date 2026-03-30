'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '../../../components/shell';
import { apiFetch, getAccessToken, parseAccessToken } from '../../../lib/api';

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

export default function AdminReviewListPage() {
  const router = useRouter();
  const token = useMemo(() => getAccessToken(), []);
  const payload = useMemo(() => parseAccessToken(token), [token]);

  const [users, setUsers] = useState<PendingUser[]>([]);
  const [institutionRequests, setInstitutionRequests] = useState<PendingInstitutionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reasonById, setReasonById] = useState<Record<string, string>>({});

  const isAdmin = payload?.role === 'super_admin' || payload?.role === 'reviewer';

  const loadDashboard = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [pendingUsers, pendingInstitutionRequests] = await Promise.all([
        apiFetch<PendingUser[]>('/users/pending', undefined, token),
        apiFetch<PendingInstitutionRequest[]>('/institutions/requests/pending', undefined, token),
      ]);

      setUsers(pendingUsers);
      setInstitutionRequests(pendingInstitutionRequests);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load approval dashboard.';
      setError(message);
      if ((err as { status?: number })?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router, token]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      setError('Only reviewers and super admins can access this dashboard.');
      setLoading(false);
      return;
    }

    void loadDashboard();
  }, [token, isAdmin, router, loadDashboard]);

  useEffect(() => {
    if (!token || !isAdmin) return;

    const timer = setInterval(() => {
      void loadDashboard();
    }, 15000);

    return () => clearInterval(timer);
  }, [token, isAdmin, loadDashboard]);

  function updateReason(itemKey: string, reason: string) {
    setReasonById((prev) => ({ ...prev, [itemKey]: reason }));
  }

  function readReason(itemKey: string) {
    return reasonById[itemKey]?.trim() ?? '';
  }

  async function reviewUser(userId: string, action: 'approve' | 'reject' | 'request_info') {
    if (!token) return;
    const reason = readReason(`user:${userId}`);

    if (action === 'request_info' && !reason) {
      setError('Please include the requested information before sending.');
      return;
    }

    setBusyId(`user:${userId}`);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch(
        `/users/${userId}/approval`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            action: action === 'request_info' ? 'reject' : action,
            reason: action === 'request_info' ? `${REQUEST_INFO_PREFIX} ${reason}` : reason || undefined,
          }),
        },
        token,
      );
      setSuccess(
        action === 'request_info'
          ? 'Request for more information has been sent.'
          : `User ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      );
      if (action !== 'request_info') {
        setUsers((prev) => prev.filter((item) => item.id !== userId));
      } else {
        await loadDashboard();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} user.`);
    } finally {
      setBusyId(null);
    }
  }

  async function reviewInstitutionRequest(requestId: string, action: 'approve' | 'reject' | 'request_info') {
    if (!token) return;
    const reason = readReason(`institution:${requestId}`);

    if (action === 'request_info' && !reason) {
      setError('Please include the requested information before sending.');
      return;
    }

    setBusyId(`institution:${requestId}`);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch(
        `/institutions/requests/${requestId}/review`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            action: action === 'request_info' ? 'reject' : action,
            reason: action === 'request_info' ? `${REQUEST_INFO_PREFIX} ${reason}` : reason || undefined,
          }),
        },
        token,
      );
      setSuccess(
        action === 'request_info'
          ? 'Institution request marked as more information requested.'
          : `Institution request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      );
      if (action !== 'request_info') {
        setInstitutionRequests((prev) => prev.filter((item) => item.id !== requestId));
      } else {
        await loadDashboard();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} institution request.`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Shell title="Admin Approval Dashboard" subtitle="Review user and institution onboarding requests.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">Auto-refreshes every 15 seconds</p>
          <button onClick={() => void loadDashboard()} className="btn-secondary px-3 py-1.5 text-xs" disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh now'}
          </button>
        </div>

        {error ? <div className="status-note status-note-error">{error}</div> : null}
        {success ? <div className="status-note status-note-success">{success}</div> : null}

        {loading ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900">Pending users ({users.length})</h2>
              {users.length === 0 ? (
                <p className="card border-dashed p-4 text-sm text-slate-500">No pending users.</p>
              ) : (
                <ul className="space-y-3">
                  {users.map((user) => (
                    <li key={user.id} className="card p-4 sm:p-5">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{user.email}</p>
                            <p className="text-xs text-slate-500">Role: {user.role} · Created: {new Date(user.createdAt).toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Institution: {user.institution?.name ?? 'Not linked yet'}</p>
                          </div>
                          <Link href={`/admin/reviews/${user.id}?type=user`} className="text-xs font-semibold text-blue-300 underline">
                            Open details
                          </Link>
                        </div>

                        <textarea
                          value={reasonById[`user:${user.id}`] ?? ''}
                          onChange={(event) => updateReason(`user:${user.id}`, event.target.value)}
                          placeholder="Optional reason (required when requesting more info)"
                          className="textarea min-h-20 text-sm"
                          disabled={busyId === `user:${user.id}`}
                        />

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <button className="btn-primary px-3 py-1.5 text-xs" disabled={busyId === `user:${user.id}`} onClick={() => void reviewUser(user.id, 'approve')}>Approve</button>
                          <button className="btn-secondary px-3 py-1.5 text-xs" disabled={busyId === `user:${user.id}`} onClick={() => void reviewUser(user.id, 'reject')}>Reject</button>
                          <button className="btn-secondary px-3 py-1.5 text-xs" disabled={busyId === `user:${user.id}`} onClick={() => void reviewUser(user.id, 'request_info')}>Request info</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900">Pending institution requests ({institutionRequests.length})</h2>
              {institutionRequests.length === 0 ? (
                <p className="card border-dashed p-4 text-sm text-slate-500">No pending institution requests.</p>
              ) : (
                <ul className="space-y-3">
                  {institutionRequests.map((request) => (
                    <li key={request.id} className="card p-4 sm:p-5">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{request.name}</p>
                            <p className="text-xs text-slate-500">{request.city ? `${request.city}, ` : ''}{request.countryCode} · {request.isPublic ? 'Public' : 'Private'}</p>
                            <p className="text-xs text-slate-500">Requested by {request.requester.email}</p>
                          </div>
                          <Link href={`/admin/reviews/${request.id}?type=institution`} className="text-xs font-semibold text-blue-300 underline">
                            Open details
                          </Link>
                        </div>

                        <textarea
                          value={reasonById[`institution:${request.id}`] ?? ''}
                          onChange={(event) => updateReason(`institution:${request.id}`, event.target.value)}
                          placeholder="Optional reason (required when requesting more info)"
                          className="textarea min-h-20 text-sm"
                          disabled={busyId === `institution:${request.id}`}
                        />

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <button className="btn-primary px-3 py-1.5 text-xs" disabled={busyId === `institution:${request.id}`} onClick={() => void reviewInstitutionRequest(request.id, 'approve')}>Approve</button>
                          <button className="btn-secondary px-3 py-1.5 text-xs" disabled={busyId === `institution:${request.id}`} onClick={() => void reviewInstitutionRequest(request.id, 'reject')}>Reject</button>
                          <button className="btn-secondary px-3 py-1.5 text-xs" disabled={busyId === `institution:${request.id}`} onClick={() => void reviewInstitutionRequest(request.id, 'request_info')}>Request info</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </Shell>
  );
}
