import Link from 'next/link';
import { Shell } from '../components/shell';

const featureCards = [
  {
    title: 'Community feed',
    description: 'Ask questions, share progress, and collaborate with students in your institution.',
    href: '/feed',
  },
  {
    title: 'Study groups',
    description: 'Join focused groups by course, major, or exam preparation topic.',
    href: '/groups',
  },
  {
    title: 'Resources',
    description: 'Upload and discover notes, links, and supporting study files.',
    href: '/resources',
  },
  {
    title: 'Exam archive',
    description: 'Browse archived exams by subject and year to practice effectively.',
    href: '/exams',
  },
];

export default function LandingPage() {
  return (
    <Shell title="Welcome to EduWorld" subtitle="A verified student-only social learning platform.">
      <div className="space-y-8">
        <div className="flex flex-wrap gap-3">
          <Link className="btn-primary" href="/signup">Get started</Link>
          <Link className="btn-secondary" href="/login">I already have an account</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {featureCards.map((card) => (
            <Link key={card.href} href={card.href} className="card p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <h2 className="text-base font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{card.description}</p>
              <span className="mt-4 inline-block text-sm font-medium text-blue-700">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
