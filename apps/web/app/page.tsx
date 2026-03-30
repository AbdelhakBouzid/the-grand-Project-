import Link from 'next/link';
import { Shell } from '../components/shell';

const featureCards = [
  {
    title: 'Community feed',
    description: 'Ask questions, share progress updates, and exchange study wins with peers.',
    href: '/feed',
  },
  {
    title: 'Study groups',
    description: 'Create or join focused groups by topic, class, or certification track.',
    href: '/groups',
  },
  {
    title: 'Resources',
    description: 'Publish and discover notes, links, and practical supporting files.',
    href: '/resources',
  },
  {
    title: 'Exam archive',
    description: 'Filter past exam sets by subject and year for targeted revision.',
    href: '/exams',
  },
];

export default function LandingPage() {
  return (
    <Shell title="Welcome to EduWorld" subtitle="A verified student social learning platform designed for fast collaboration.">
      <div className="space-y-6">
        <div className="card border-blue-300/20 bg-blue-500/5 p-5 sm:p-6">
          <p className="text-sm leading-6 text-slate-300">
            One product, one workflow: register, get reviewed, then access your feed, groups, resources, and exam preparation tools.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="btn-primary" href="/signup">Get started</Link>
            <Link className="btn-secondary" href="/login">I already have an account</Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {featureCards.map((card) => (
            <Link key={card.href} href={card.href} className="card p-5 transition hover:-translate-y-0.5">
              <h2 className="text-base font-semibold text-slate-100">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{card.description}</p>
              <span className="mt-4 inline-block text-sm font-medium text-blue-300">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
