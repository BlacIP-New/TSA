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
import {
  MOCK_ADMIN_USER,
  MOCK_MDA_ADMIN_WORKS,
  MOCK_MDA_USER,
  MOCK_MDA_USER_LIRS,
  MOCK_MDA_USER_VIS,
  MOCK_MDA_USER_WORKS,
  MOCK_SYSTEM_USER,
} from '../data/mockUsers';
import { logAuditEntry } from './auditService';

const DEMO_CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  'admin@nsw.gov.ng': { password: 'Admin@1234', user: MOCK_ADMIN_USER },
  'operations@nsw.gov.ng': { password: 'System@1234', user: MOCK_SYSTEM_USER },
  'mdaadmin@works.gov.ng': { password: 'MDAAdmin@1234', user: MOCK_MDA_ADMIN_WORKS },
  'finance@fmf.gov.ng': { password: 'Viewer@1234', user: MOCK_MDA_USER },
  'director@works.gov.ng': { password: 'Viewer@1234', user: MOCK_MDA_USER_WORKS },
  'audit@lirs.gov.ng': { password: 'Viewer@1234', user: MOCK_MDA_USER_LIRS },
  'collections@vis.gov.ng': { password: 'Viewer@1234', user: MOCK_MDA_USER_VIS },
};

const INVITED_ACCOUNTS_STORAGE_KEY = 'tsa_invited_accounts';
const SETUP_TOKENS_STORAGE_KEY = 'tsa_setup_tokens';
const SETUP_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type InvitedAccountRecord = {
  user: AuthUser;
  password?: string;
};

type SetupTokenRecord = {
  email: string;
  expiresAt: number;
};

export interface InvitedUserAccessPayload {
  email: string;
  name: string;
  role: AuthUser['role'];
  aggregatorId: string;
  aggregatorName: string;
  mdaId?: string;
  mdaCode?: string;
  mdaName?: string;
  collectionCode?: string;
  serviceCode?: string;
}

function readStorageJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStorageJson<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota and private mode errors in mock mode.
  }
}

function getInvitedAccounts() {
  return readStorageJson<Record<string, InvitedAccountRecord>>(INVITED_ACCOUNTS_STORAGE_KEY) ?? {};
}

function setInvitedAccounts(accounts: Record<string, InvitedAccountRecord>) {
  writeStorageJson(INVITED_ACCOUNTS_STORAGE_KEY, accounts);
}

function getSetupTokens() {
  return readStorageJson<Record<string, SetupTokenRecord>>(SETUP_TOKENS_STORAGE_KEY) ?? {};
}

function setSetupTokens(tokens: Record<string, SetupTokenRecord>) {
  writeStorageJson(SETUP_TOKENS_STORAGE_KEY, tokens);
}

function buildSetupLink(token: string) {
  const path = `/reset-password?token=${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}

function createSetupToken() {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `inv_${Date.now()}_${randomPart}`;
}

export function provisionInvitedUserAccess(payload: InvitedUserAccessPayload) {
  const email = payload.email.trim().toLowerCase();
  const existingAccounts = getInvitedAccounts();
  const existingRecord = existingAccounts[email];
  const userId = existingRecord?.user.id ?? `usr_inv_${Date.now()}`;

  const user: AuthUser = {
    id: userId,
    email,
    name: payload.name,
    role: payload.role,
    status: 'pending',
    aggregatorId: payload.aggregatorId,
    aggregatorName: payload.aggregatorName,
    mdaId: payload.mdaId,
    mdaCode: payload.mdaCode,
    collectionCode: payload.collectionCode,
    serviceCode: payload.serviceCode,
    mdaName: payload.mdaName,
  };

  existingAccounts[email] = {
    user,
    password: existingRecord?.password,
  };
  setInvitedAccounts(existingAccounts);

  const tokens = getSetupTokens();
  const token = createSetupToken();
  tokens[token] = {
    email,
    expiresAt: Date.now() + SETUP_TOKEN_TTL_MS,
  };
  setSetupTokens(tokens);

  return {
    token,
    setupLink: buildSetupLink(token),
  };
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 900));

  const email = credentials.email.trim().toLowerCase();

  const invitedAccounts = getInvitedAccounts();
  const invitedAccount = invitedAccounts[email];

  const match = DEMO_CREDENTIALS[email];

  let authenticatedUser: AuthUser | null = null;

  if (match && match.password === credentials.password) {
    authenticatedUser = match.user;
  } else if (invitedAccount) {
    if (!invitedAccount.password) {
      throw new Error('This invitation is pending password setup. Use your setup link to create a password.');
    }
    if (invitedAccount.password !== credentials.password) {
      throw new Error('Invalid email or password. Please check your credentials and try again.');
    }
    if (invitedAccount.user.status === 'inactive') {
      throw new Error('This account is inactive. Contact your administrator.');
    }

    authenticatedUser = {
      ...invitedAccount.user,
      status: 'active',
      lastLoginAt: new Date().toISOString(),
    };

    invitedAccounts[email] = {
      ...invitedAccount,
      user: authenticatedUser,
    };
    setInvitedAccounts(invitedAccounts);
  }

  if (!authenticatedUser) {
    throw new Error('Invalid email or password. Please check your credentials and try again.');
  }

  const token = `mock_token_${Date.now()}`;
  sessionStorage.setItem('tsa_token', token);
  sessionStorage.setItem('tsa_user', JSON.stringify(authenticatedUser));

  if (authenticatedUser.aggregatorId) {
    await logAuditEntry({
      userId: authenticatedUser.id,
      userEmail: authenticatedUser.email,
      userName: authenticatedUser.name,
      action: 'login',
      details: `${authenticatedUser.email} signed into the TSA Collection Insight Portal.`,
      aggregatorId: authenticatedUser.aggregatorId,
    });
  }

  return { token, user: authenticatedUser };
}

export async function logout(): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const storedUser = getStoredUser();
  if (storedUser?.aggregatorId) {
    await logAuditEntry({
      userId: storedUser.id,
      userEmail: storedUser.email,
      userName: storedUser.name,
      action: 'logout',
      details: `${storedUser.email} signed out of the TSA Collection Insight Portal.`,
      aggregatorId: storedUser.aggregatorId,
    });
  }
  sessionStorage.removeItem('tsa_token');
  sessionStorage.removeItem('tsa_user');
}

export async function requestPasswordReset(email: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 800));
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  const invitedAccounts = getInvitedAccounts();
  if (invitedAccounts[normalizedEmail]) {
    const token = createSetupToken();
    const tokens = getSetupTokens();
    tokens[token] = {
      email: normalizedEmail,
      expiresAt: Date.now() + SETUP_TOKEN_TTL_MS,
    };
    setSetupTokens(tokens);
  }
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 800));
  if (!token || !newPassword) {
    throw new Error('Invalid reset link. Please request a new password reset.');
  }

  const tokens = getSetupTokens();
  const tokenRecord = tokens[token];

  if (!tokenRecord) {
    throw new Error('Invalid reset link. Please request a new password reset.');
  }

  if (tokenRecord.expiresAt < Date.now()) {
    delete tokens[token];
    setSetupTokens(tokens);
    throw new Error('This reset link has expired. Please request a new one.');
  }

  const invitedAccounts = getInvitedAccounts();
  const account = invitedAccounts[tokenRecord.email];

  if (!account) {
    throw new Error('No invited user was found for this reset link.');
  }

  invitedAccounts[tokenRecord.email] = {
    ...account,
    password: newPassword,
    user: {
      ...account.user,
      status: 'active',
    },
  };
  setInvitedAccounts(invitedAccounts);

  delete tokens[token];
  setSetupTokens(tokens);

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
