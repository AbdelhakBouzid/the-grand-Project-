import Link from 'next/link';
import { Shell } from '../components/shell';

export default function LandingPage() {
  return (
    <Shell title="EduWorld">
      <p className="mb-4">A verified student-only social learning platform.</p>
      <div className="flex flex-wrap gap-4">
        <Link className="rounded bg-blue-600 px-4 py-2 text-white" href="/signup">Sign Up</Link>
        <Link className="rounded border px-4 py-2" href="/login">Login</Link>
        <Link className="rounded border px-4 py-2" href="/feed">Feed</Link>
        <Link className="rounded border px-4 py-2" href="/groups">Groups</Link>
        <Link className="rounded border px-4 py-2" href="/resources">Resources</Link>
        <Link className="rounded border px-4 py-2" href="/exams">Exams</Link>
      </div>
    </Shell>
  );
}
