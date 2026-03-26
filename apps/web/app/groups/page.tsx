'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '../../components/shell';
import { apiFetch, getAccessToken } from '../../lib/api';

type Group = {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  _count?: { members: number };
};

type GroupsResponse = {
  items: Group[];
  total: number;
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

  async function loadGroups() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<GroupsResponse>('/groups', undefined, token ?? undefined);
      setGroups(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups.');
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
    void loadGroups();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]);

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
    <Shell title="Study Groups">
      <div className="space-y-6">
        <form onSubmit={onCreateGroup} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-semibold">Create a group</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Group name" className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            Private group
          </label>
          <button disabled={creating} className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{creating ? 'Creating…' : 'Create Group'}</button>
        </form>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {loading ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-600">No groups yet. Create one to start collaborating.</div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {groups.map((group) => (
              <li key={group.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">{group.name}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{group.isPrivate ? 'Private' : 'Public'}</span>
                </div>
                <p className="mb-3 text-sm text-slate-600">{group.description || 'No description provided.'}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{group._count?.members ?? 0} members</p>
                  <button
                    onClick={() => void joinGroup(group.id)}
                    disabled={busyGroupId === group.id}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-60"
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
