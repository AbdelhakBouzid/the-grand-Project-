'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '../../components/shell';
import { apiFetch, getAccessToken, getCurrentUser } from '../../lib/api';

type Group = {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  _count?: { members: number };
};

type GroupsResponse = {
  items: Group[];
};

export default function GroupsPage() {
  const router = useRouter();
  const token = useMemo(() => getAccessToken(), []);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  async function loadGroups() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<GroupsResponse>('/groups', undefined, token ?? undefined);
      setGroups(data.items);
      setPendingApproval(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load groups.';
      setError(message);
      if ((err as { status?: number })?.status === 401) router.push('/login');
      if ((err as { status?: number })?.status === 403 && message.toLowerCase().includes('approved accounts only')) {
        setPendingApproval(true);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    void loadGroups();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]);

  useEffect(() => {
    if (!token || !pendingApproval) return;
    const timer = setInterval(async () => {
      try {
        const me = await getCurrentUser(token);
        if (me.status === 'approved') {
          setPendingApproval(false);
          setError(null);
          await loadGroups();
        }
      } catch {
        // ignored
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [pendingApproval, token]);

  async function onCreateGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await apiFetch('/groups', {
        method: 'POST',
        body: JSON.stringify({ name, description, isPrivate }),
      }, token ?? undefined);
      setName('');
      setDescription('');
      setIsPrivate(false);
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group.');
    } finally {
      setCreating(false);
    }
  }

  async function joinGroup(groupId: string) {
    setBusyGroupId(groupId);
    setError(null);
    try {
      await apiFetch(`/groups/${groupId}/memberships`, { method: 'POST' }, token ?? undefined);
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group.');
    } finally {
      setBusyGroupId(null);
    }
  }

  return (
    <Shell title="Study Groups" subtitle="Create or join focused learning communities.">
      <div className="space-y-6">
        <form onSubmit={onCreateGroup} className="card grid gap-3 bg-slate-50 p-4">
          <h2 className="text-base font-semibold">Create a group</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Group name" className="input" disabled={pendingApproval} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="textarea" disabled={pendingApproval} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} disabled={pendingApproval} />
            Private group
          </label>
          <button disabled={creating || pendingApproval} className="btn-primary w-fit">{creating ? 'Creating…' : 'Create Group'}</button>
        </form>

        {pendingApproval ? <div className="card border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">Your account is pending review. Access will unlock automatically once approved.</div> : null}

        {error ? (
          <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button onClick={() => void loadGroups()} className="mt-3 btn-secondary text-xs">Try again</button>
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : groups.length === 0 ? (
          <div className="card border-dashed p-8 text-center text-sm text-slate-600">No groups yet. Create one to start collaborating.</div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {groups.map((group) => (
              <li key={group.id} className="card p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">{group.name}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{group.isPrivate ? 'Private' : 'Public'}</span>
                </div>
                <p className="mb-3 text-sm text-slate-600">{group.description || 'No description provided.'}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{group._count?.members ?? 0} members</p>
                  <button
                    onClick={() => void joinGroup(group.id)}
                    disabled={busyGroupId === group.id || pendingApproval}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    {busyGroupId === group.id ? 'Joining…' : 'Join'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link className="text-sm font-medium text-blue-700 underline" href="/resources">Explore Resources</Link>
      </div>
    </Shell>
  );
}
