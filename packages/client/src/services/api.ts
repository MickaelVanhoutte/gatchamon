/**
 * Thin HTTP client for the Gatchamon server API.
 *
 * In production the server serves the client from the same origin,
 * so relative /api URLs work out of the box.
 * In development, a Vite proxy forwards /api → localhost:3001.
 */

import { getAuthToken, clearAuth } from '../config';

const BASE = '/api';

interface ApiOptions {
  skipReloadOn401?: boolean;
}

async function request<T>(path: string, init?: RequestInit, opts?: ApiOptions): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...init,
  });

  if (res.status === 401) {
    if (!opts?.skipReloadOn401) {
      clearAuth();
      window.location.reload();
    }
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string, opts?: ApiOptions) => request<T>(path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: ApiOptions) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }, opts),
  put: <T>(path: string, body?: unknown, opts?: ApiOptions) =>
    request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }, opts),
  patch: <T>(path: string, body?: unknown, opts?: ApiOptions) =>
    request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }, opts),
  delete: <T>(path: string, opts?: ApiOptions) =>
    request<T>(path, { method: 'DELETE' }, opts),
};
