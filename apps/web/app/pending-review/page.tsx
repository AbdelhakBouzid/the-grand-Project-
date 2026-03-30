import Link from 'next/link';
import { Shell } from '../../components/shell';

export default function PendingReviewPage() {
  return (
    <Shell title="Pending Review" subtitle="Your account verification is currently being reviewed by the team.">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <div className="card border-amber-300/25 bg-amber-500/5 p-6 text-center sm:p-8">
          <p className="text-base font-semibold text-amber-100">Thanks for submitting your details.</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            You&apos;ll be automatically unlocked once approved. Please return later or refresh this page from time to time.
          </p>
        </div>
        <Link href="/login" className="btn-secondary mx-auto">Back to login</Link>
      </div>
    </Shell>
  );
}
