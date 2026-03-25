import Link from 'next/link';
import { Shell } from '../../components/shell';

export default function GroupsPage() {
  return (
    <Shell title="Study Groups">
      <p className="mb-4 text-sm text-gray-700">Find private and public learning groups by keyword and join with one click.</p>
      <ul className="list-disc space-y-2 pl-5 text-sm">
        <li>Search: <code>GET /groups?page=1&limit=10&q=stem</code></li>
        <li>Create group: <code>POST /groups</code></li>
        <li>Join group: <code>POST /groups/:groupId/memberships</code></li>
      </ul>
      <div className="mt-6">
        <Link className="text-blue-600 underline" href="/resources">Explore Resources</Link>
      </div>
    </Shell>
  );
}
