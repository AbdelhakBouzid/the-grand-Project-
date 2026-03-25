import Link from 'next/link';
import { Shell } from '../../components/shell';

export default function FeedPage() {
  return (
    <Shell title="Community Feed">
      <p className="mb-4 text-sm text-gray-700">Approved users can post, comment, and react in the student feed.</p>
      <ul className="list-disc space-y-2 pl-5 text-sm">
        <li>Endpoint: <code>GET /feed/posts?page=1&limit=10&q=math</code></li>
        <li>Create post: <code>POST /feed/posts</code></li>
        <li>Comments: <code>/feed/posts/:postId/comments</code></li>
        <li>Reactions: <code>/feed/posts/:postId/reactions</code></li>
      </ul>
      <div className="mt-6">
        <Link className="text-blue-600 underline" href="/groups">Continue to Groups</Link>
      </div>
    </Shell>
  );
}
