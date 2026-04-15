/**
 * MDA Service — integration-ready mock implementation for admin MDA management endpoints.
 *
 * Backend swap-in points:
 *   GET  /admin/mda-users
 *   POST /admin/mda-users/invite
 *   POST /admin/mda-users/:id/resend-invite
 *   PATCH /admin/mda-users/:id/deactivate
 *   PATCH /admin/mda-users/:id/reactivate
 *   GET /admin/collection-codes
 *   GET /admin/service-codes
 */

import { mockCollectionCodes, mockServiceCodes } from '../data/mockCollectionCodes';
import { mockMDAUsers } from '../data/mockMDAs';
import { CollectionCode, InviteMDAPayload, MDAUser, ServiceCode } from '../types/mda';

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

function getCollectionOrThrow(collectionCode: string) {
  const collection = mockCollectionCodes.find((entry) => entry.code === collectionCode);

  if (!collection) {
    throw new Error('The selected collection code is not available.');
  }

  return collection;
}

function getServiceOrThrow(collectionCode: string, serviceCode: string) {
  const service = mockServiceCodes.find(
    (entry) => entry.collectionCode === collectionCode && entry.code === serviceCode
  );

  if (!service) {
    throw new Error('The selected service code is not valid for this collection.');
  }

  return service;
}

export async function getMDAUsers(aggregatorId: string): Promise<MDAUser[]> {
  await delay();
  return mdaUsersStore
    .filter((user) => user.aggregatorId === aggregatorId)
    .slice()
    .sort(
      (left, right) =>
        new Date(right.invitedAt).getTime() - new Date(left.invitedAt).getTime()
    );
}

export async function inviteMDAUser(
  payload: InviteMDAPayload & { aggregatorId: string; invitedBy: string }
): Promise<MDAUser> {
  await delay();

  const duplicateUser = mdaUsersStore.find(
    (user) => user.aggregatorId === payload.aggregatorId && user.email.toLowerCase() === payload.email.toLowerCase()
  );

  if (duplicateUser) {
    throw new Error('An MDA user with this email already exists.');
  }

  const collection = getCollectionOrThrow(payload.collectionCode);
  getServiceOrThrow(payload.collectionCode, payload.serviceCode);

  const invitedUser: MDAUser = {
    id: `mda_usr_${Date.now()}`,
    email: payload.email.toLowerCase(),
    name: toDisplayName(payload.email),
    mdaName: collection.name,
    collectionCode: payload.collectionCode,
    serviceCode: payload.serviceCode,
    status: 'pending',
    invitedAt: new Date().toISOString(),
    aggregatorId: payload.aggregatorId,
    invitedBy: payload.invitedBy,
  };

  mdaUsersStore = [invitedUser, ...mdaUsersStore];
  return invitedUser;
}

export async function resendMDAInvite(id: string): Promise<void> {
  await delay(360);

  const target = mdaUsersStore.find((user) => user.id === id);

  if (!target) {
    throw new Error('MDA user not found.');
  }

  if (target.status !== 'pending') {
    throw new Error('Only pending MDA users can receive a new invitation link.');
  }

  target.invitedAt = new Date().toISOString();
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

export async function getCollectionCodes(aggregatorId: string): Promise<CollectionCode[]> {
  await delay(240);
  return mockCollectionCodes.filter((collection) => collection.aggregatorId === aggregatorId);
}

export async function getServiceCodes(collectionCode: string): Promise<ServiceCode[]> {
  await delay(240);
  return mockServiceCodes.filter((serviceCode) => serviceCode.collectionCode === collectionCode);
}
