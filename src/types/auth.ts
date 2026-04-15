export type UserRole = 'aggregator_admin' | 'mda_viewer';

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  aggregatorId?: string;
  aggregatorName?: string;
  collectionCode?: string;
  serviceCode?: string;
  mdaName?: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}
