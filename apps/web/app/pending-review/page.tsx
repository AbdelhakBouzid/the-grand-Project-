import Link from 'next/link';
import { Shell } from '../../components/shell';

export default function PendingReviewPage() {
  return (
    <Shell title="Pending Review" subtitle="Your account verification is under review.">
      <div className="card border-dashed p-6 text-center text-slate-700">
        <p className="text-sm">We&apos;ll notify you once a reviewer has approved or rejected your request.</p>
        <Link href="/feed" className="mt-4 inline-block text-sm font-medium text-blue-700 underline">Go to feed</Link>
      </div>
    </Shell>
  );
}
