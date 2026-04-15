import { CollectionCode, ServiceCode } from '../types/mda';
import { appConfig } from '../config/env';

export const mockCollectionCodes: CollectionCode[] = [
  { code: 'FMF-001', name: 'Federal Ministry of Finance', aggregatorId: appConfig.aggregatorId },
  { code: 'MW-002', name: 'Ministry of Works', aggregatorId: appConfig.aggregatorId },
  { code: 'LIRS-010', name: 'Lagos Internal Revenue Service', aggregatorId: appConfig.aggregatorId },
  { code: 'VIS-031', name: 'Vehicle Inspection Service', aggregatorId: appConfig.aggregatorId },
  { code: 'EDU-120', name: 'Ministry of Education', aggregatorId: appConfig.aggregatorId },
];

export const mockServiceCodes: ServiceCode[] = [
  { code: 'FMF-SVC-001', name: 'Budget Release Processing', collectionCode: 'FMF-001' },
  { code: 'FMF-SVC-004', name: 'Treasury Remittance Clearance', collectionCode: 'FMF-001' },
  { code: 'MW-SVC-014', name: 'Contract Payment Verification', collectionCode: 'MW-002' },
  { code: 'MW-SVC-018', name: 'Road Maintenance Levy', collectionCode: 'MW-002' },
  { code: 'LIRS-SVC-120', name: 'PAYE Settlement', collectionCode: 'LIRS-010' },
  { code: 'LIRS-SVC-121', name: 'Withholding Tax Remittance', collectionCode: 'LIRS-010' },
  { code: 'VIS-SVC-088', name: 'Vehicle Inspection Fee', collectionCode: 'VIS-031' },
  { code: 'VIS-SVC-092', name: 'Roadworthiness Certificate', collectionCode: 'VIS-031' },
  { code: 'EDU-SVC-020', name: 'School Charges Collection', collectionCode: 'EDU-120' },
  { code: 'EDU-SVC-024', name: 'Examination Processing', collectionCode: 'EDU-120' },
];
