export type MDAStatus = 'pending' | 'active' | 'inactive';

export interface MDAUser {
  id: string;
  email: string;
  name: string;
  mdaName: string;
  collectionCode: string;
  serviceCode: string;
  status: MDAStatus;
  invitedAt: string;
  activatedAt?: string;
  lastLoginAt?: string;
  aggregatorId: string;
  invitedBy: string;
}

export interface InviteMDAPayload {
  email: string;
  mdaName: string;
  collectionCode: string;
  serviceCode: string;
}

export interface CollectionCode {
  code: string;
  name: string;
  aggregatorId: string;
}

export interface ServiceCode {
  code: string;
  name: string;
  collectionCode: string;
}
