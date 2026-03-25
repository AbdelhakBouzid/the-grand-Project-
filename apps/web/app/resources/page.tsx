import Link from 'next/link';
import { Shell } from '../../components/shell';

export default function ResourcesPage() {
  return (
    <Shell title="Educational Resources">
      <p className="mb-4 text-sm text-gray-700">Upload and browse course resources with file attachments.</p>
      <ul className="list-disc space-y-2 pl-5 text-sm">
        <li>List resources: <code>GET /resources?page=1&limit=10&q=algebra</code></li>
        <li>Create resource + files: <code>POST /resources</code></li>
      </ul>
      <div className="mt-6">
        <Link className="text-blue-600 underline" href="/exams">Open Exam Archive</Link>
      </div>
    </Shell>
  );
}
