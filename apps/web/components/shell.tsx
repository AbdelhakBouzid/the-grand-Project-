'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getAccessToken, getCurrentUser, parseAccessToken, type CurrentUser } from '../lib/api';

type ShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const basePrimaryNav = [
  { href: '/feed', label: 'Feed' },
  { href: '/groups', label: 'Groups' },
  { href: '/resources', label: 'Resources' },
  { href: '/exams', label: 'Exams' },
];

const guestAccountNav = [
  { href: '/login', label: 'Login' },
  { href: '/signup', label: 'Sign up' },
];

export function Shell({ title, subtitle, children }: ShellProps) {
  const pathname = usePathname();
  const token = useMemo(() => getAccessToken(), []);
  const payload = useMemo(() => parseAccessToken(token), [token]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (!token) return;

    let mounted = true;
    void getCurrentUser(token)
      .then((user) => {
        if (mounted) setCurrentUser(user);
      })
      .catch(() => {
        if (mounted) setCurrentUser(null);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const role = currentUser?.role ?? payload?.role;
  const status = currentUser?.status;
  const canSeeAdmin = role === 'super_admin' || role === 'reviewer';
  const isAuthenticated = Boolean(token);

  const primaryNav = canSeeAdmin ? [...basePrimaryNav, { href: '/admin/reviews', label: 'Admin' }] : basePrimaryNav;

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
    window.location.href = '/login';
  }

  return (
    <main className="min-h-screen px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <header className="card sticky top-3 z-20 overflow-hidden p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href="/" className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
                  EduWorld
                </Link>
                <h1 className="page-title mt-3">{title}</h1>
                {subtitle ? <p className="page-subtitle mt-1 max-w-2xl">{subtitle}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                      {currentUser?.email ?? payload?.email ?? 'Signed in'}
                      {status ? ` · ${status}` : ''}
                    </span>
                    <button type="button" onClick={logout} className="btn-secondary text-xs sm:text-sm">
                      Logout
                    </button>
                  </>
                ) : (
                  guestAccountNav.map((item) => (
                    <Link key={item.href} href={item.href} className="btn-secondary text-xs sm:text-sm">
                      {item.label}
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <label className="input flex items-center gap-2 rounded-full px-4">
                <span className="text-slate-400">⌕</span>
                <input disabled placeholder="Search communities, resources, and exams" className="w-full bg-transparent text-sm text-slate-500 outline-none" />
              </label>
              <nav className="flex gap-2 overflow-x-auto pb-1 md:justify-end">
                {primaryNav.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition sm:text-sm ${
                        active
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)_15rem]">
          <aside className="card hidden h-fit p-4 lg:block">
            <p className="section-heading">Navigation</p>
            <div className="mt-3 space-y-2">
              {primaryNav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={`side-${item.href}`}
                    href={item.href}
                    className={`block rounded-2xl px-3 py-2 text-sm font-medium transition ${
                      active ? 'bg-violet-100 text-violet-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </aside>

          <section className="card p-4 sm:p-6">{children}</section>

          <aside className="card hidden h-fit space-y-3 p-4 lg:block">
            <p className="section-heading">Quick Tips</p>
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-3 text-sm text-violet-700">
              Complete onboarding to unlock posting and collaborations.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Review feed, groups, resources, and exams from one consistent workspace.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
