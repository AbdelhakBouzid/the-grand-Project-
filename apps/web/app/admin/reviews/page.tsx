'use client';

import { useEffect, useMemo, useState } from 'react';
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

export default function AdminReviewListPage() {
  const router = useRouter();
  const token = useMemo(() => getAccessToken(), []);
  const payload = useMemo(() => parseAccessToken(token), [token]);

  const [users, setUsers] = useState<PendingUser[]>([]);
  const [institutionRequests, setInstitutionRequests] = useState<PendingInstitutionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin = payload?.role === 'super_admin';

  async function loadDashboard() {
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
  }

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      setError('Only super admins can access this dashboard.');
      setLoading(false);
      return;
    }

    void loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin, router]);

  async function reviewUser(userId: string, action: 'approve' | 'reject') {
    if (!token) return;
    setBusyId(userId);
    setError(null);

    try {
      await apiFetch(`/users/${userId}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      }, token);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} user.`);
    } finally {
      setBusyId(null);
    }
  }

  async function reviewInstitutionRequest(requestId: string, action: 'approve' | 'reject') {
    if (!token) return;
    setBusyId(requestId);
    setError(null);

    try {
      await apiFetch(`/institutions/requests/${requestId}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      }, token);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} institution request.`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Shell title="Admin Approval Dashboard" subtitle="Review user and institution onboarding requests.">
      <div className="space-y-6">
        {error ? <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        {loading ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-slate-800">Pending users ({users.length})</h2>
              {users.length === 0 ? (
                <p className="card border-dashed p-4 text-sm text-slate-600">No pending users.</p>
              ) : (
                <ul className="space-y-3">
                  {users.map((user) => (
                    <li key={user.id} className="card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{user.email}</p>
                          <p className="text-xs text-slate-500">Role: {user.role} · Created: {new Date(user.createdAt).toLocaleString()}</p>
                          <p className="text-xs text-slate-500">Institution: {user.institution?.name ?? 'Not linked yet'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn-primary px-3 py-1.5 text-xs" disabled={busyId === user.id} onClick={() => void reviewUser(user.id, 'approve')}>Approve</button>
                          <button className="btn-secondary px-3 py-1.5 text-xs" disabled={busyId === user.id} onClick={() => void reviewUser(user.id, 'reject')}>Reject</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-slate-800">Pending institution requests ({institutionRequests.length})</h2>
              {institutionRequests.length === 0 ? (
                <p className="card border-dashed p-4 text-sm text-slate-600">No pending institution requests.</p>
              ) : (
                <ul className="space-y-3">
                  {institutionRequests.map((request) => (
                    <li key={request.id} className="card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{request.name}</p>
                          <p className="text-xs text-slate-500">{request.city ? `${request.city}, ` : ''}{request.countryCode} · {request.isPublic ? 'Public' : 'Private'}</p>
                          <p className="text-xs text-slate-500">Requested by {request.requester.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn-primary px-3 py-1.5 text-xs" disabled={busyId === request.id} onClick={() => void reviewInstitutionRequest(request.id, 'approve')}>Approve</button>
                          <button className="btn-secondary px-3 py-1.5 text-xs" disabled={busyId === request.id} onClick={() => void reviewInstitutionRequest(request.id, 'reject')}>Reject</button>
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
