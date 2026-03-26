const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type AuthTokenPayload = {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
};

export function getApiUrl() {
  return API_URL;
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function parseAccessToken(token: string | null): AuthTokenPayload | null {
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getAccessToken());
}

export async function apiFetch<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const authToken = token ?? getAccessToken();
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : `API error ${res.status}`;

    const error = new Error(message) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }

  return data as T;
}
