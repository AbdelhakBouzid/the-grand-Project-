'use client';

import Link from 'next/link';
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

  const primaryNav = canSeeAdmin
    ? [...basePrimaryNav, { href: '/admin/reviews', label: 'Admin' }]
    : basePrimaryNav;

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
    window.location.href = '/login';
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="card overflow-hidden p-4 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <Link href="/" className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
                  EduWorld
                </Link>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
                {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-600">{subtitle}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
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

            <nav className="flex gap-2 overflow-x-auto pb-1">
              {primaryNav.map((item) => (
                <Link key={item.href} href={item.href} className="btn-ghost whitespace-nowrap rounded-full border border-transparent px-4 py-2 text-xs sm:text-sm">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <section className="card p-4 sm:p-6">{children}</section>
      </div>
    </main>
  );
}
