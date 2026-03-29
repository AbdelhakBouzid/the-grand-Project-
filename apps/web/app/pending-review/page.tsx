import { Shell } from '../../components/shell';

export default function PendingReviewPage() {
  return (
    <Shell title="Pending Review" subtitle="Your account verification is under review.">
      <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
        <p className="text-base font-semibold text-slate-800">Thanks for submitting your details.</p>
        <p className="text-sm leading-6 text-slate-600">We&apos;ll notify you once a reviewer has approved or rejected your request. You can safely close this page and return later.</p>
      </div>
    </Shell>
  );
}
