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
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:px-5 lg:px-8">
        <header className="card overflow-hidden p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href="/" className="inline-flex rounded-full border border-blue-300/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-200">
                  EduWorld
                </Link>
                <h1 className="page-title mt-3">{title}</h1>
                {subtitle ? <p className="page-subtitle mt-1 max-w-2xl">{subtitle}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <span className="rounded-full border border-slate-600 bg-slate-800/70 px-3 py-1 text-xs text-slate-300">
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
              {primaryNav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide transition sm:text-sm ${
                      active
                        ? 'border border-blue-300/50 bg-blue-500/20 text-blue-100'
                        : 'border border-transparent bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <section className="card p-4 sm:p-6">{children}</section>
      </div>
    </main>
  );
}
