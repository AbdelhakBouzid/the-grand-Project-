import type { ReactNode } from 'react';

export function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-semibold">{title}</h1>
      <section className="rounded-lg border bg-white p-6 shadow-sm">{children}</section>
    </main>
  );
}
