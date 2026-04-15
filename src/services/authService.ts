/**
 * Auth Service — Integration stubs for Credo backend authentication endpoints.
 *
 * TODO (Backend Integration):
 *   POST /auth/login              { email, password } → { token, user: AuthUser }
 *   POST /auth/logout             (authenticated)
 *   POST /auth/password-reset/request   { email }
 *   POST /auth/password-reset/confirm   { token, newPassword }
 *   GET  /auth/session/refresh    → { token, user: AuthUser }
 *
 * Token storage: sessionStorage key 'tsa_token'
 * Session expiry: 30 minutes of inactivity (enforced client-side + server validates TTL)
 */

import { AuthUser, LoginCredentials, LoginResponse } from '../types/auth';
import { MOCK_ADMIN_USER, MOCK_MDA_USER } from '../data/mockUsers';

const DEMO_CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  'admin@nsw.gov.ng': { password: 'Admin@1234', user: MOCK_ADMIN_USER },
  'finance@fmf.gov.ng': { password: 'Viewer@1234', user: MOCK_MDA_USER },
};

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 900));

  const match = DEMO_CREDENTIALS[credentials.email.toLowerCase()];

  if (!match || match.password !== credentials.password) {
    throw new Error('Invalid email or password. Please check your credentials and try again.');
  }

  const token = `mock_token_${Date.now()}`;
  sessionStorage.setItem('tsa_token', token);
  sessionStorage.setItem('tsa_user', JSON.stringify(match.user));

  return { token, user: match.user };
}

export async function logout(): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  sessionStorage.removeItem('tsa_token');
  sessionStorage.removeItem('tsa_user');
}

export async function requestPasswordReset(email: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 800));
  if (!email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 800));
  if (!token || !newPassword) {
    throw new Error('Invalid reset link. Please request a new password reset.');
  }
}

export async function refreshSession(): Promise<AuthUser | null> {
  const raw = sessionStorage.getItem('tsa_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  const raw = sessionStorage.getItem('tsa_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
