/**
 * MDA Service — integration-ready mock implementation for admin MDA management.
 *
 * Backend swap-in points:
 *   GET  /admin/mdas
 *   GET  /admin/mdas/:id
 *   GET  /admin/mdas/:id/collection-codes
 *   GET  /admin/mdas/:id/service-codes
 *   GET  /admin/mda-users
 *   POST /admin/mda-users/invite
 *   POST /admin/mda-users/:id/resend-invite
 *   PATCH /admin/mda-users/:id/deactivate
 *   PATCH /admin/mda-users/:id/reactivate
 *   GET  /admin/mdas/:id/collection-settlements
 */

import { mockMDACollections, mockMDARegistry, mockMDAServiceCodes } from '../data/mockMDARegistry';
import { mockMDAUsers } from '../data/mockMDAs';
import {
  InviteMDAPayload,
  MDACollectionCode,
  MDADetail,
  MDARecord,
  MDAServiceCode,
  MDAUser,
} from '../types/mda';
import { PaginatedSettlementBatches } from '../types/transaction';
import { getSettlementBatches } from './transactionService';
import { provisionInvitedUserAccess } from './authService';

const NETWORK_DELAY_MS = 520;
let mdaUsersStore = [...mockMDAUsers];

function delay(ms = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDisplayName(email: string) {
  return email
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function getMDAOrThrow(mdaId: string) {
  const record = mockMDARegistry.find((entry) => entry.id === mdaId);
  if (!record) {
    throw new Error('The selected MDA could not be found.');
  }
  return record;
}

function getCollectionOrThrow(mdaId: string, collectionCode: string) {
  const collection = mockMDACollections.find(
    (entry) => entry.mdaId === mdaId && entry.code === collectionCode,
  );

  if (!collection) {
    throw new Error('The selected collection code does not belong to this MDA.');
  }

  return collection;
}

function getServiceOrThrow(mdaId: string, serviceCode: string, collectionCode?: string) {
  const service = mockMDAServiceCodes.find(
    (entry) =>
      entry.mdaId === mdaId &&
      entry.code === serviceCode &&
      (!collectionCode || entry.collectionCode === collectionCode),
  );

  if (!service) {
    throw new Error('The selected service code does not belong to this MDA.');
  }

  return service;
}

function buildMDARecordSummary(mdaId: string): MDARecord {
  const record = getMDAOrThrow(mdaId);
  const users = mdaUsersStore.filter((entry) => entry.mdaId === mdaId);
  const collections = mockMDACollections.filter((entry) => entry.mdaId === mdaId);
  const services = mockMDAServiceCodes.filter((entry) => entry.mdaId === mdaId);

  return {
    ...record,
    collectionCount: collections.length,
    serviceCount: services.length,
    activeUserCount: users.filter((entry) => entry.status === 'active').length,
    totalUserCount: users.length,
  };
}

export async function getMDAs(aggregatorId: string): Promise<MDARecord[]> {
  await delay();

  return mockMDARegistry
    .filter((entry) => entry.aggregatorId === aggregatorId)
    .map((entry) => buildMDARecordSummary(entry.id))
    .sort((left, right) => left.mdaName.localeCompare(right.mdaName));
}

export async function getMDACollections(mdaId: string): Promise<MDACollectionCode[]> {
  await delay(220);
  getMDAOrThrow(mdaId);
  return mockMDACollections.filter((entry) => entry.mdaId === mdaId);
}

export async function getMDAServiceCodes(
  mdaId: string,
  collectionCode?: string,
): Promise<MDAServiceCode[]> {
  await delay(220);
  getMDAOrThrow(mdaId);

  if (!collectionCode) {
    return mockMDAServiceCodes.filter((entry) => entry.mdaId === mdaId);
  }

  return mockMDAServiceCodes.filter(
    (entry) => entry.mdaId === mdaId && entry.collectionCode === collectionCode,
  );
}

export async function getMDADetail(mdaId: string): Promise<MDADetail> {
  await delay(280);

  return {
    record: buildMDARecordSummary(mdaId),
    collections: mockMDACollections.filter((entry) => entry.mdaId === mdaId),
    services: mockMDAServiceCodes.filter((entry) => entry.mdaId === mdaId),
  };
}

export async function getMDAUsers(aggregatorId: string, mdaId?: string): Promise<MDAUser[]> {
  await delay();

  return mdaUsersStore
    .filter((user) => {
      if (user.aggregatorId !== aggregatorId) return false;
      if (mdaId && user.mdaId !== mdaId) return false;
      return true;
    })
    .slice()
    .sort(
      (left, right) =>
        new Date(right.invitedAt).getTime() - new Date(left.invitedAt).getTime(),
    );
}

export async function inviteMDAUser(
  payload: InviteMDAPayload & { aggregatorId: string; invitedBy: string },
): Promise<{ user: MDAUser; setupLink: string }> {
  await delay();

  const duplicateUser = mdaUsersStore.find(
    (user) =>
      user.aggregatorId === payload.aggregatorId &&
      user.email.toLowerCase() === payload.email.toLowerCase(),
  );

  if (duplicateUser) {
    throw new Error('An MDA user with this email already exists.');
  }

  const record = getMDAOrThrow(payload.mdaId);
  getCollectionOrThrow(payload.mdaId, payload.collectionCode);
  if (payload.serviceCode) {
    getServiceOrThrow(payload.mdaId, payload.serviceCode, payload.collectionCode);
  }

  const invitedUser: MDAUser = {
    id: `mda_usr_${Date.now()}`,
    email: payload.email.toLowerCase(),
    name: toDisplayName(payload.email),
    mdaId: record.id,
    mdaCode: record.mdaCode,
    mdaName: record.mdaName,
    collectionCode: payload.collectionCode,
    serviceCode: payload.serviceCode,
    status: 'pending',
    invitedAt: new Date().toISOString(),
    aggregatorId: payload.aggregatorId,
    invitedBy: payload.invitedBy,
  };

  mdaUsersStore = [invitedUser, ...mdaUsersStore];

  const provision = provisionInvitedUserAccess({
    email: invitedUser.email,
    name: invitedUser.name,
    aggregatorId: invitedUser.aggregatorId,
    aggregatorName: 'NSW Aggregator',
    mdaName: invitedUser.mdaName,
    collectionCode: invitedUser.collectionCode,
    serviceCode: invitedUser.serviceCode,
  });

  return {
    user: invitedUser,
    setupLink: provision.setupLink,
  };
}

export async function resendMDAInvite(id: string): Promise<{ setupLink: string }> {
  await delay(360);

  const target = mdaUsersStore.find((user) => user.id === id);

  if (!target) {
    throw new Error('MDA user not found.');
  }

  if (target.status !== 'pending') {
    throw new Error('Only pending MDA users can receive a new invitation link.');
  }

  target.invitedAt = new Date().toISOString();

  const provision = provisionInvitedUserAccess({
    email: target.email,
    name: target.name,
    aggregatorId: target.aggregatorId,
    aggregatorName: 'NSW Aggregator',
    mdaName: target.mdaName,
    collectionCode: target.collectionCode,
    serviceCode: target.serviceCode,
  });

  return {
    setupLink: provision.setupLink,
  };
}

export async function getMDAInviteSetupLink(id: string): Promise<{ setupLink: string; email: string }> {
  await delay(180);

  const target = mdaUsersStore.find((user) => user.id === id);

  if (!target) {
    throw new Error('MDA user not found.');
  }

  if (target.status !== 'pending') {
    throw new Error('Only pending invitations can generate setup links.');
  }

  const provision = provisionInvitedUserAccess({
    email: target.email,
    name: target.name,
    aggregatorId: target.aggregatorId,
    aggregatorName: 'NSW Aggregator',
    mdaName: target.mdaName,
    collectionCode: target.collectionCode,
    serviceCode: target.serviceCode,
  });

  return {
    setupLink: provision.setupLink,
    email: target.email,
  };
}

export function activateMDAUserByEmail(email: string): MDAUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  const target = mdaUsersStore.find((entry) => entry.email.toLowerCase() === normalizedEmail);

  if (!target) {
    return null;
  }

  target.status = 'active';
  target.activatedAt = target.activatedAt ?? new Date().toISOString();
  return target;
}

export async function deactivateMDAUser(id: string): Promise<MDAUser> {
  await delay(360);

  const target = mdaUsersStore.find((user) => user.id === id);

  if (!target) {
    throw new Error('MDA user not found.');
  }

  if (target.status === 'inactive') {
    throw new Error('This MDA user is already inactive.');
  }

  target.status = 'inactive';
  return target;
}

export async function reactivateMDAUser(id: string): Promise<MDAUser> {
  await delay(360);

  const target = mdaUsersStore.find((user) => user.id === id);

  if (!target) {
    throw new Error('MDA user not found.');
  }

  if (target.status === 'active') {
    throw new Error('This MDA user is already active.');
  }

  target.status = 'active';
  target.activatedAt = target.activatedAt ?? new Date().toISOString();
  return target;
}

interface CollectionSettlementParams {
  aggregatorId: string;
  mdaId: string;
  collectionCode: string;
  page?: number;
  limit?: number;
}

export async function getMDACollectionSettlementBatches(
  params: CollectionSettlementParams,
): Promise<PaginatedSettlementBatches> {
  const collection = getCollectionOrThrow(params.mdaId, params.collectionCode);

  return getSettlementBatches({
    aggregatorId: params.aggregatorId,
    collectionCode: collection.code,
    page: params.page ?? 1,
    limit: params.limit ?? 25,
  });
}
