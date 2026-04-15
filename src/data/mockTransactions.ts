import { Transaction, TransactionStatus } from '../types/transaction';
import { appConfig } from '../config/env';

const AGGREGATOR_ID = appConfig.aggregatorId;
const BANKS = ['GTBank', 'Access Bank', 'Zenith Bank', 'UBA', 'First Bank'];
const CHANNELS = ['bank_transfer', 'card', 'ussd', 'pos'] as const;

const MDA_PROFILES = [
  {
    name: 'Federal Ministry of Finance',
    collectionCode: 'FMF-001',
    serviceCode: 'FMF-SVC-001',
    baseAmount: 2_250_000,
    dayIncrement: 185_000,
    entryIncrement: 82_000,
  },
  {
    name: 'Ministry of Works',
    collectionCode: 'MW-002',
    serviceCode: 'MW-SVC-014',
    baseAmount: 1_650_000,
    dayIncrement: 132_000,
    entryIncrement: 76_000,
  },
  {
    name: 'Lagos Internal Revenue Service',
    collectionCode: 'LIRS-010',
    serviceCode: 'LIRS-SVC-120',
    baseAmount: 3_100_000,
    dayIncrement: 214_000,
    entryIncrement: 125_000,
  },
  {
    name: 'Vehicle Inspection Service',
    collectionCode: 'VIS-031',
    serviceCode: 'VIS-SVC-088',
    baseAmount: 1_250_000,
    dayIncrement: 118_000,
    entryIncrement: 58_000,
  },
] as const;

function toIsoDate(year: number, month: number, day: number, hour: number, minute: number) {
  return new Date(Date.UTC(year, month, day, hour, minute, 0)).toISOString();
}

function buildMonthTransactions(monthOffset: number): Transaction[] {
  const today = new Date();
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + monthOffset, 1));
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const visibleDays =
    monthOffset === 0
      ? Math.max(15, Math.min(today.getUTCDate(), daysInMonth))
      : Math.min(daysInMonth, 28);

  const monthBias = monthOffset === 0 ? 1.1 : 0.92;

  return Array.from({ length: visibleDays }, (_, dayIndex) => dayIndex + 1).flatMap((day) =>
    MDA_PROFILES.flatMap((profile, profileIndex) => {
      const entriesPerDay = 2 + ((day + profileIndex + Math.abs(monthOffset)) % 2);

      return Array.from({ length: entriesPerDay }, (_, entryIndex) => {
        const status: TransactionStatus =
          day % 13 === 0 && entryIndex === 0
            ? 'failed'
            : day % 9 === 0 && entryIndex === entriesPerDay - 1
              ? 'pending'
              : 'settled';

        const rawAmount =
          (profile.baseAmount + day * profile.dayIncrement + entryIndex * profile.entryIncrement) *
          monthBias;

        const amount = Math.round(rawAmount / 100) * 100;
        const hour = 8 + entryIndex * 3 + profileIndex;
        const createdAt = toIsoDate(year, month, day, hour, (profileIndex + entryIndex) * 7);
        const settlementDate =
          status === 'settled'
            ? toIsoDate(year, month, day, hour + 2, 15)
            : createdAt;

        return {
          id: `txn_${year}_${month + 1}_${day}_${profile.collectionCode}_${entryIndex}`,
          reference: `TSA-${String(year).slice(-2)}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}-${profileIndex + 1}${entryIndex + 1}`,
          payerName: `Payer ${profileIndex + 1}${String(day).padStart(2, '0')}${entryIndex + 1}`,
          payerAccount: `01${profileIndex}${String(day).padStart(2, '0')}${entryIndex + 3}8821`,
          payerBank: BANKS[(day + profileIndex + entryIndex) % BANKS.length],
          amount,
          channel: CHANNELS[(day + profileIndex + entryIndex) % CHANNELS.length],
          settlementDate,
          createdAt,
          status,
          collectionCode: profile.collectionCode,
          serviceCode: profile.serviceCode,
          aggregatorId: AGGREGATOR_ID,
          narration: `${profile.name} settlement for ${day}/${month + 1}/${year}`,
          settlementBatch: `SB-${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`,
        };
      });
    })
  );
}

export const mockTransactions: Transaction[] = [...buildMonthTransactions(-1), ...buildMonthTransactions(0)];

export function getMockTransactionById(id: string) {
  return mockTransactions.find((transaction) => transaction.id === id) ?? null;
}
