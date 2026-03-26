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
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="card p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-blue-700">
                EduWorld
              </Link>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isAuthenticated ? (
                <>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
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
          <nav className="mt-4 flex flex-wrap gap-2">
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} className="btn-secondary text-xs sm:text-sm">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="card p-4 sm:p-6">{children}</section>
      </div>
    </main>
  );
}
