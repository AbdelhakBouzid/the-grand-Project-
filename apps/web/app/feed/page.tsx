'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '../../components/shell';
import { apiFetch, getAccessToken, getCurrentUser } from '../../lib/api';

type FeedPost = {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; email: string };
  _count: { comments: number; reactions: number };
};

type FeedResponse = {
  items: FeedPost[];
};

const APPROVAL_MESSAGE = 'Your account is still pending review. This page will unlock automatically after approval.';

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);

  const token = useMemo(() => getAccessToken(), []);

  async function loadPosts() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<FeedResponse>('/feed/posts', undefined, token ?? undefined);
      setPosts(data.items);
      setPendingApproval(false);
    } catch (err) {
      const status = (err as { status?: number })?.status;
      const message = err instanceof Error ? err.message : 'Could not load feed posts.';
      setError(message);
      if (status === 401) router.push('/login');
      if (status === 403 && message.toLowerCase().includes('approved accounts only')) {
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
    void loadPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, token]);

  useEffect(() => {
    if (!token || !pendingApproval) return;

    const timer = setInterval(async () => {
      try {
        const me = await getCurrentUser(token);
        if (me.status === 'approved') {
          setError(null);
          setPendingApproval(false);
          await loadPosts();
        }
      } catch {
        // ignore polling errors
      }
    }, 8000);

    return () => clearInterval(timer);
  }, [pendingApproval, token]);

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
    <Shell title="Community Feed" subtitle="Share updates, ask questions, and learn together.">
      <div className="space-y-6">
        <form onSubmit={onCreatePost} className="card grid gap-3 bg-slate-50/80 p-4 sm:p-5">
          <label className="text-sm font-medium text-slate-700">Create a post</label>
          <textarea
            value={newPost}
            onChange={(event) => setNewPost(event.target.value)}
            placeholder="What are you studying today?"
            className="textarea min-h-28"
            disabled={pendingApproval}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Live data from GET/POST /feed/posts</p>
            <button disabled={creating || pendingApproval} className="btn-primary">
              {creating ? 'Posting…' : 'Create Post'}
            </button>
          </div>
        </form>

        {pendingApproval ? <div className="status-note status-note-warning">{APPROVAL_MESSAGE}</div> : null}

        {error ? (
          <div className="status-note status-note-error">
            <p>{error}</p>
            <button onClick={() => void loadPosts()} className="mt-3 btn-secondary text-xs">Try again</button>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center text-sm text-slate-600">
            No posts yet. Create the first post to start your institution feed.
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id} className="card p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">{post.user?.email ?? 'Unknown user'}</p>
                  <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.body}</p>
                <div className="mt-4 flex gap-4 text-xs text-slate-500">
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
