import Link from 'next/link';
import { Shell } from '../../../components/shell';

export default function AdminReviewListPage() {
  return (
    <Shell title="Reviewer Dashboard" subtitle="Moderation workspace placeholder for reviewer APIs.">
      <div className="space-y-3 text-sm text-slate-700">
        <p className="card p-4">Use API token in Postman for now. UI list is placeholder for the next enhancement phase.</p>
        <Link href="/admin/reviews/sample" className="text-blue-700 underline">Open sample detail page</Link>
      </div>
    </Shell>
  );
}
