import { appConfig } from '../config/env';

/**
 * Base API client configuration.
 *
 * TODO (Backend Integration): Set VITE_API_BASE_URL in .env to point to the
 * Credo backend service. All requests will be sent with Authorization: Bearer <token>
 * header extracted from localStorage/session.
 *
 * Example: VITE_API_BASE_URL=https://api.credo.ng/tsa-portal/v1
 */

const API_BASE_URL = appConfig.apiBaseUrl;

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

function getAuthToken(): string | null {
  return sessionStorage.getItem('tsa_token');
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    sessionStorage.removeItem('tsa_token');
    window.dispatchEvent(new CustomEvent('tsa:session-expired'));
    throw new Error('Session expired. Please log in again.');
  }

  if (response.status === 403) {
    throw new Error('Access denied. You do not have permission to perform this action.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unexpected error occurred.' }));
    throw new Error(error.message ?? 'An unexpected error occurred.');
  }

  return response.json();
}
