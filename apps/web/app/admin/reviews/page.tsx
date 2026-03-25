import Link from 'next/link';
import { Shell } from '../../../components/shell';

export default function AdminReviewListPage() {
  return (
    <Shell title="Reviewer Dashboard">
      <p className="mb-3">Use API token in Postman for now. UI list is placeholder for Phase 2 enhancement.</p>
      <Link href="/admin/reviews/sample" className="text-blue-600 underline">Open sample detail page</Link>
    </Shell>
  );
}
