import { Shell } from '../../components/shell';

export default function PendingReviewPage() {
  return (
    <Shell title="Pending Review" subtitle="Your account verification is under review.">
      <div className="card border-dashed p-6 text-center text-slate-700">
        <p className="text-sm">We&apos;ll notify you once a reviewer has approved or rejected your request.</p>
      </div>
    </Shell>
  );
}
