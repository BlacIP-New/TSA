import { AuthUser } from '../types/auth';
import { appConfig } from '../config/env';

export const MOCK_ADMIN_USER: AuthUser = {
  id: 'usr_admin_001',
  email: 'admin@nsw.gov.ng',
  name: 'Chukwuemeka Obi',
  role: 'aggregator_admin',
  status: 'active',
  aggregatorId: appConfig.aggregatorId,
  aggregatorName: 'NSW Aggregator',
  lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
};

export const MOCK_MDA_USER: AuthUser = {
  id: 'usr_mda_001',
  email: 'finance@fmf.gov.ng',
  name: 'Amaka Nwosu',
  role: 'mda_viewer',
  status: 'active',
  aggregatorId: appConfig.aggregatorId,
  aggregatorName: 'NSW Aggregator',
  collectionCode: 'FMF-001',
  serviceCode: 'FMF-SVC-001',
  mdaName: 'Federal Ministry of Finance',
  lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
};
