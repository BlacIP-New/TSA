export type MDAStatus = 'pending' | 'active' | 'inactive';
export type ManagedUserType = 'system_admin' | 'system_user' | 'mda_admin' | 'mda_user';

export interface MDARecord {
  id: string;
  mdaCode: string;
  mdaName: string;
  aggregatorId: string;
  status?: 'active' | 'inactive';
  collectionCount: number;
  serviceCount: number;
  activeUserCount: number;
  totalUserCount: number;
}

export interface MDACollectionCode {
  id: string;
  mdaId: string;
  code: string;
  name: string;
  aggregatorId: string;
}

export interface MDAServiceCode {
  id: string;
  mdaId: string;
  collectionCode: string;
  code: string;
  name: string;
  aggregatorId: string;
}

export interface MDADetail {
  record: MDARecord;
  collections: MDACollectionCode[];
  services: MDAServiceCode[];
}

export interface MDAUser {
  id: string;
  email: string;
  name: string;
  userType: ManagedUserType;
  mdaId?: string;
  mdaCode?: string;
  mdaName?: string;
  collectionCode?: string;
  serviceCode?: string;
  status: MDAStatus;
  invitedAt: string;
  activatedAt?: string;
  lastLoginAt?: string;
  aggregatorId: string;
  invitedBy: string;
}

export interface InviteMDAPayload {
  email: string;
  userType: ManagedUserType;
  mdaId?: string;
  collectionCode?: string;
  serviceCode?: string;
}
