import { AuthUser } from '../types/auth';
import { appConfig } from '../config/env';

export const MOCK_ADMIN_USER: AuthUser = {
  id: 'usr_admin_001',
  email: 'admin@nsw.gov.ng',
  name: 'NSW SYSTEM ADMIN',
  role: 'system_admin',
  status: 'active',
  aggregatorId: appConfig.aggregatorId,
  aggregatorName: 'NSW Platform',
  lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
};

export const MOCK_SYSTEM_USER: AuthUser = {
  id: 'usr_sys_001',
  email: 'operations@nsw.gov.ng',
  name: 'NSW SYSTEM USER',
  role: 'system_user',
  status: 'active',
  aggregatorId: appConfig.aggregatorId,
  aggregatorName: 'NSW Platform',
  lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
};

export const MOCK_MDA_ADMIN_WORKS: AuthUser = {
  id: 'usr_mda_admin_001',
  email: 'mdaadmin@works.gov.ng',
  name: 'MDA ADMIN',
  role: 'mda_admin',
  status: 'active',
  aggregatorId: appConfig.aggregatorId,
  aggregatorName: 'NSW Platform',
  mdaId: 'mda_mw',
  mdaCode: 'MDA-MW',
  mdaName: 'Ministry of Works',
  lastLoginAt: new Date(Date.now() - 5400000).toISOString(),
};

export const MOCK_MDA_USER: AuthUser = {
  id: 'usr_mda_001',
  email: 'finance@fmf.gov.ng',
  name: 'MDA USER',
  role: 'mda_user',
  status: 'active',
  aggregatorId: appConfig.aggregatorId,
  aggregatorName: 'NSW Platform',
  mdaId: 'mda_fmf',
  mdaCode: 'MDA-FMF',
  collectionCode: 'FMF-001',
  serviceCode: 'FMF-SVC-001',
  mdaName: 'Federal Ministry of Finance',
  lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
};

export const MOCK_MDA_USER_WORKS: AuthUser = {
  id: 'usr_mda_002',
  email: 'director@works.gov.ng',
  name: 'MDA USER',
  role: 'mda_user',
  status: 'active',
  aggregatorId: appConfig.aggregatorId,
  aggregatorName: 'NSW Platform',
  mdaId: 'mda_mw',
  mdaCode: 'MDA-MW',
  collectionCode: 'MW-002',
  serviceCode: 'MW-SVC-014',
  mdaName: 'Ministry of Works',
  lastLoginAt: new Date(Date.now() - 5400000).toISOString(),
};

export const MOCK_MDA_USER_LIRS: AuthUser = {
  id: 'usr_mda_003',
  email: 'audit@lirs.gov.ng',
  name: 'MDA USER',
  role: 'mda_user',
  status: 'active',
  aggregatorId: appConfig.aggregatorId,
  aggregatorName: 'NSW Platform',
  mdaId: 'mda_lirs',
  mdaCode: 'MDA-LIRS',
  collectionCode: 'LIRS-010',
  serviceCode: 'LIRS-SVC-120',
  mdaName: 'Lagos Internal Revenue Service',
  lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
};

export const MOCK_MDA_USER_VIS: AuthUser = {
  id: 'usr_mda_004',
  email: 'collections@vis.gov.ng',
  name: 'MDA USER',
  role: 'mda_user',
  status: 'active',
  aggregatorId: appConfig.aggregatorId,
  aggregatorName: 'NSW Platform',
  mdaId: 'mda_vis',
  mdaCode: 'MDA-VIS',
  collectionCode: 'VIS-031',
  serviceCode: 'VIS-SVC-088',
  mdaName: 'Vehicle Inspection Service',
  lastLoginAt: new Date(Date.now() - 9000000).toISOString(),
};
