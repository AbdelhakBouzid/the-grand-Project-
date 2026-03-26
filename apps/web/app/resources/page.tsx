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

type ResourcesResponse = { items: Resource[] };

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
    <Shell title="Educational Resources" subtitle="Share notes and useful links with your classmates.">
      <div className="space-y-6">
        <form onSubmit={onCreateResource} className="card grid gap-3 bg-slate-50 p-4">
          <h2 className="text-base font-semibold">Upload or link a resource</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Resource title" className="input" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="textarea" />
          <textarea
            value={fileUrls}
            onChange={(e) => setFileUrls(e.target.value)}
            placeholder="One file URL per line"
            className="textarea"
          />
          <button disabled={creating} className="btn-primary w-fit">
            {creating ? 'Publishing…' : 'Create Resource'}
          </button>
        </form>

        {error ? (
          <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button onClick={() => void loadResources()} className="mt-3 btn-secondary text-xs">Try again</button>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : resources.length === 0 ? (
          <div className="card border-dashed p-8 text-center text-sm text-slate-600">No resources yet. Add one to help classmates.</div>
        ) : (
          <ul className="space-y-3">
            {resources.map((resource) => (
              <li key={resource.id} className="card p-4">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">{resource.title}</h3>
                  <span className="text-xs text-slate-500">{resource.owner?.email ?? 'Unknown uploader'}</span>
                </div>
                <p className="mb-2 text-sm text-slate-600">{resource.description || 'No description provided.'}</p>
                {resource.files.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-xs text-blue-700">
                    {resource.files.map((file) => (
                      <li key={file.id}>
                        <a href={file.fileUrl} target="_blank" rel="noreferrer" className="break-all underline">{file.fileUrl}</a>
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
