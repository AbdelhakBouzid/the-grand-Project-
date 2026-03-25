import { Shell } from '../../../../components/shell';

export default function AdminReviewDetailPage({ params }: { params: { id: string } }) {
  return <Shell title={`Review ${params.id}`}><p>Review detail and actions (approve/reject/request-info) will call reviewer APIs.</p></Shell>;
}
