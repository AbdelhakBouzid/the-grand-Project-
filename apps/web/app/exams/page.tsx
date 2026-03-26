'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '../../components/shell';
import { apiFetch, getAccessToken, parseAccessToken } from '../../lib/api';

type Exam = {
  id: string;
  title: string;
  subject: string;
  year: number;
};

type ExamsResponse = {
  items: Exam[];
};

const CREATOR_ROLES = new Set(['teacher', 'institution_admin', 'super_admin']);

export default function ExamsPage() {
  const router = useRouter();
  const token = useMemo(() => getAccessToken(), []);
  const authPayload = useMemo(() => parseAccessToken(token), [token]);
  const canCreate = CREATOR_ROLES.has(authPayload?.role ?? '');

  const [subjectFilter, setSubjectFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function loadExams() {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (subjectFilter.trim()) params.set('subject', subjectFilter.trim());
    if (yearFilter.trim()) params.set('year', yearFilter.trim());

    try {
      const query = params.toString();
      const data = await apiFetch<ExamsResponse>(`/exam-archive${query ? `?${query}` : ''}`, undefined, token ?? undefined);
      setExams(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exams.');
      if ((err as { status?: number })?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    void loadExams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]);

  async function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadExams();
  }

  async function onCreateExam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);

    try {
      await apiFetch('/exam-archive', {
        method: 'POST',
        body: JSON.stringify({ title, subject, year: Number(year) }),
      }, token ?? undefined);
      setTitle('');
      setSubject('');
      setYear('');
      await loadExams();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create exam set.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Shell title="Exam Archive" subtitle="Find past exams and practice by subject and year.">
      <div className="space-y-6">
        <form onSubmit={applyFilters} className="card grid gap-3 bg-slate-50 p-4 sm:grid-cols-3">
          <input value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} placeholder="Filter by subject" className="input" />
          <input value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} placeholder="Filter by year" className="input" />
          <button className="btn-secondary">Apply filters</button>
        </form>

        {canCreate ? (
          <form onSubmit={onCreateExam} className="card grid gap-3 border-blue-200 bg-blue-50 p-4 sm:grid-cols-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Exam title" className="input" />
            <input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Subject" className="input" />
            <div className="flex gap-2">
              <input value={year} onChange={(e) => setYear(e.target.value)} required placeholder="Year" className="input" />
              <button disabled={creating} className="btn-primary">{creating ? 'Saving…' : 'Create'}</button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-slate-500">Only teachers/admin users can add exam sets.</p>
        )}

        {error ? (
          <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button onClick={() => void loadExams()} className="mt-3 btn-secondary text-xs">Try again</button>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : exams.length === 0 ? (
          <div className="card border-dashed p-8 text-center text-sm text-slate-600">No exams found for the current filters.</div>
        ) : (
          <ul className="space-y-3">
            {exams.map((exam) => (
              <li key={exam.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">{exam.title}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{exam.year}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{exam.subject}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Shell>
  );
}
