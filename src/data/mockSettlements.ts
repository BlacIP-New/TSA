import { appConfig } from '../config/env';
import { mockMDACollections, mockMDARegistry, mockMDAServiceCodes } from './mockMDARegistry';
import { SettlementBatch, SettlementBatchDetail, SettlementLine, SettlementStatus } from '../types/transaction';

const BANKS = [
  'Access Bank Plc',
  'CBN-TSA',
  'Guaranty Trust Bank',
  'First City Monument Bank',
  'Access(Diamond) Bank',
  'United Bank for Africa',
];

const ACCOUNT_NAMES = [
  'Stephen Obikobe Obi',
  'MDA-TSA-SETTLEMENT',
  'Obikobe Farms Ltd',
  'Brown Itoemugh Memoye',
  'Ifeoma Chukwudi Ventures',
  'Kensington Supplies Ltd',
  'Rimex Services',
  'Olaide Afolabi',
];

const SETTLEMENT_MDA_IDS = [
  'mda_fmf',
  'mda_mw',
  'mda_lirs',
  'mda_vis',
  'mda_health',
  'mda_immigration',
] as const;

const SETTLEMENT_STATUSES: SettlementStatus[] = [
  'Settled',
  'Pending',
  'Failed',
  'Queued',
  'Partially Settled',
  'Refunded',
  'Offline Settlement',
  'Paused Settlement',
];

function toIsoDate(year: number, month: number, day: number, hour: number, minute: number) {
  return new Date(Date.UTC(year, month, day, hour, minute, 0)).toISOString();
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function createLineAmount(baseAmount: number, batchIndex: number, mdaIndex: number, lineIndex: number) {
  const multiplier = 1 + ((batchIndex + mdaIndex + lineIndex) % 4);
  return Math.round((baseAmount * multiplier + batchIndex * 18_500 + lineIndex * 7_250) * 100) / 100;
}

function getRegistryProfile(mdaId: string) {
  const record = mockMDARegistry.find((entry) => entry.id === mdaId);
  const collections = mockMDACollections.filter((entry) => entry.mdaId === mdaId);
  const services = mockMDAServiceCodes.filter((entry) => entry.mdaId === mdaId);

  if (!record || collections.length === 0 || services.length === 0) {
    throw new Error(`Settlement mock profile is incomplete for ${mdaId}.`);
  }

  return {
    record,
    collections,
    services,
  };
}

function buildBatchDetailsForMonth(monthOffset: number, batchCountPerMDA: number): SettlementBatchDetail[] {
  const today = new Date();
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + monthOffset, 1));
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const latestReferenceDay = monthOffset === 0 ? Math.min(today.getUTCDate(), daysInMonth) : daysInMonth;
  const referenceDays =
    monthOffset === 0
      ? [
          latestReferenceDay,
          latestReferenceDay - 2,
          latestReferenceDay - 4,
          latestReferenceDay - 6,
          latestReferenceDay - 8,
          latestReferenceDay - 10,
        ]
      : [daysInMonth - 1, daysInMonth - 4, daysInMonth - 7, daysInMonth - 10];

  return SETTLEMENT_MDA_IDS.flatMap((mdaId, mdaIndex) => {
    const profile = getRegistryProfile(mdaId);

    return Array.from({ length: batchCountPerMDA }, (_, batchIndex) => {
      const collection = profile.collections[batchIndex % profile.collections.length];
      // Keep collection/service pairing stable so MDA viewer scope combinations always have data.
      const service = profile.services[batchIndex % profile.services.length];
      const batchStatus = SETTLEMENT_STATUSES[(mdaIndex + batchIndex) % SETTLEMENT_STATUSES.length];
      const settledDay = Math.max(1, referenceDays[batchIndex] ?? daysInMonth - batchIndex * 2);
      const settledDate = toIsoDate(year, month, settledDay, 9 + mdaIndex, 15);
      const batchId = `${year}${pad(month + 1)}${pad(settledDay)}${mdaIndex + 1}${batchIndex + 1}`;
      const lineCount = 4 + ((batchIndex + mdaIndex) % 5);
      const baseAmount = 28_000 + mdaIndex * 11_000 + batchIndex * 2_500;

      const lines: SettlementLine[] = Array.from({ length: lineCount }, (_, lineIndex) => {
        const accountName = ACCOUNT_NAMES[(mdaIndex * 2 + batchIndex + lineIndex) % ACCOUNT_NAMES.length];
        const amount = createLineAmount(baseAmount, batchIndex, mdaIndex, lineIndex);

        return {
          id: `line_${batchId}_${lineIndex + 1}`,
          batchId,
          bankName: BANKS[(mdaIndex + batchIndex + lineIndex) % BANKS.length],
          accountNumber: `0${mdaIndex}${pad(batchIndex + 1)}${pad(lineIndex + 3)}${String(10450000 + batchIndex * 310 + lineIndex * 17).slice(0, 8)}`,
          accountName,
          amount,
          settledDate,
          collectionCode: collection.code,
          serviceCode: service.code,
          mdaId: profile.record.id,
          mdaName: profile.record.mdaName,
          aggregatorId: appConfig.aggregatorId,
          status: SETTLEMENT_STATUSES[(mdaIndex + batchIndex + lineIndex) % SETTLEMENT_STATUSES.length],
        };
      });

      const batch: SettlementBatch = {
        id: batchId,
        batchId,
        settledDate,
        mdaId: profile.record.id,
        mdaName: profile.record.mdaName,
        collectionCode: collection.code,
        serviceCode: service.code,
        itemCount: lines.length,
        totalAmount: lines.reduce((sum, line) => sum + line.amount, 0),
        aggregatorId: appConfig.aggregatorId,
        status: batchStatus,
      };

      return {
        batch,
        lines,
      };
    });
  });
}

export const mockSettlementBatchDetails: SettlementBatchDetail[] = [
  ...buildBatchDetailsForMonth(-2, 4),
  ...buildBatchDetailsForMonth(-1, 4),
  ...buildBatchDetailsForMonth(0, 6),
];

export const mockSettlementBatches: SettlementBatch[] = mockSettlementBatchDetails.map((detail) => detail.batch);
export const mockSettlementLines: SettlementLine[] = mockSettlementBatchDetails.flatMap((detail) => detail.lines);

export function getMockSettlementBatchDetailById(batchId: string) {
  return (
    mockSettlementBatchDetails.find(
      (detail) => detail.batch.id === batchId || detail.batch.batchId === batchId,
    ) ?? null
  );
}
