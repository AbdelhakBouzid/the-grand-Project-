import { Shell } from '../../../../components/shell';

export default function AdminReviewDetailPage({ params }: { params: { id: string } }) {
  return (
    <Shell title={`Review ${params.id}`} subtitle="Detail view placeholder for approve/reject/request-info actions.">
      <p className="card p-4 text-sm text-slate-700">Review detail and actions will call reviewer APIs in a follow-up phase.</p>
    </Shell>
  );
}
