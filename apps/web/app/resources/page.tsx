'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '../../components/shell';
import { apiFetch, getAccessToken } from '../../lib/api';

type ResourceFile = { id: string; fileUrl: string };
type Resource = {
  id: string;
  title: string;
  description?: string;
  files: ResourceFile[];
  owner?: { email: string };
};

type ResourcesResponse = { items: Resource[]; total: number };

export default function ResourcesPage() {
  const router = useRouter();
  const token = useMemo(() => getAccessToken(), []);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrls, setFileUrls] = useState('');

  async function loadResources() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ResourcesResponse>('/resources', undefined, token ?? undefined);
      setResources(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load resources.');
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
    void loadResources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]);

  async function onCreateResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);

    try {
      await apiFetch('/resources', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          fileUrls: fileUrls
            .split('\n')
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      }, token ?? undefined);
      setTitle('');
      setDescription('');
      setFileUrls('');
      await loadResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create resource.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Shell title="Educational Resources">
      <div className="space-y-6">
        <form onSubmit={onCreateResource} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-semibold">Upload or link a resource</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Resource title" className="rounded-lg border border-slate-300 p-2 text-sm" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="rounded-lg border border-slate-300 p-2 text-sm" />
          <textarea
            value={fileUrls}
            onChange={(e) => setFileUrls(e.target.value)}
            placeholder="One file URL per line"
            className="min-h-20 rounded-lg border border-slate-300 p-2 text-sm"
          />
          <button disabled={creating} className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {creating ? 'Publishing…' : 'Create Resource'}
          </button>
        </form>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-600">No resources yet. Add one to help classmates.</div>
        ) : (
          <ul className="space-y-3">
            {resources.map((resource) => (
              <li key={resource.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">{resource.title}</h3>
                  <span className="text-xs text-slate-500">{resource.owner?.email ?? 'Unknown uploader'}</span>
                </div>
                <p className="mb-2 text-sm text-slate-600">{resource.description || 'No description provided.'}</p>
                {resource.files.length > 0 ? (
                  <ul className="list-disc pl-5 text-xs text-blue-700">
                    {resource.files.map((file) => (
                      <li key={file.id}>
                        <a href={file.fileUrl} target="_blank" rel="noreferrer" className="underline">{file.fileUrl}</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">No files attached.</p>
                )}
              </li>
            ))}
          </ul>
        )}

        <Link className="text-sm font-medium text-blue-700 underline" href="/exams">Open Exam Archive</Link>
      </div>
    </Shell>
  );
}
