'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '../../components/shell';
import { apiFetch, getAccessToken } from '../../lib/api';

type FeedPost = {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; email: string };
  _count: { comments: number; reactions: number };
};

type FeedResponse = {
  items: FeedPost[];
  page: number;
  limit: number;
  total: number;
};

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newPost, setNewPost] = useState('');

  const token = useMemo(() => getAccessToken(), []);

  async function loadPosts() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<FeedResponse>('/feed/posts', undefined, token ?? undefined);
      setPosts(data.items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load feed posts.';
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
    void loadPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, token]);

  async function onCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newPost.trim()) return;

    setCreating(true);
    setError(null);

    try {
      await apiFetch('/feed/posts', { method: 'POST', body: JSON.stringify({ body: newPost.trim() }) }, token ?? undefined);
      setNewPost('');
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish post.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Shell title="Community Feed">
      <div className="space-y-6">
        <form onSubmit={onCreatePost} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">Share something with your community</label>
          <textarea
            value={newPost}
            onChange={(event) => setNewPost(event.target.value)}
            placeholder="What are you studying today?"
            className="min-h-28 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-blue-500 focus:ring"
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500">Live data from GET/POST /feed/posts</p>
            <button disabled={creating} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {creating ? 'Posting…' : 'Create Post'}
            </button>
          </div>
        </form>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-600">
            No posts yet. Create the first post to start your institution feed.
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">{post.user?.email ?? 'Unknown user'}</p>
                  <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-700">{post.body}</p>
                <div className="mt-3 flex gap-4 text-xs text-slate-500">
                  <span>{post._count?.comments ?? 0} comments</span>
                  <span>{post._count?.reactions ?? 0} reactions</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div>
          <Link className="text-sm font-medium text-blue-700 underline" href="/groups">
            Continue to Groups
          </Link>
        </div>
      </div>
    </Shell>
  );
}
