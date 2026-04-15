import type { ReactNode } from 'react';
import { Layers3, Network, UserRound } from 'lucide-react';
import { MDADetail } from '../../types/mda';

interface MDADetailPanelProps {
  detail: MDADetail | null;
  isLoading?: boolean;
}

function DetailList({
  title,
  icon,
  items,
  emptyLabel,
}: {
  title: string;
  icon: ReactNode;
  items: Array<{ primary: string; secondary?: string }>;
  emptyLabel: string;
}) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="rounded-2xl bg-[#E8001C]/8 p-2 text-[#E8001C]">{icon}</div>
        <div>
          <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{items.length} configured</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500">
            {emptyLabel}
          </div>
        ) : (
          items.map((item) => (
            <div key={item.primary} className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="font-medium text-gray-950">{item.primary}</p>
              {item.secondary && <p className="mt-1 text-sm text-gray-500">{item.secondary}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function MDADetailPanel({ detail, isLoading = false }: MDADetailPanelProps) {
  if (isLoading && !detail) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-3xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-5 py-12 text-center text-sm text-gray-500 shadow-sm">
        Select an MDA to inspect its registry details.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Active MDA</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950">
              {detail.record.mdaCode}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{detail.record.mdaName}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Collections</p>
              <p className="mt-2 font-semibold text-gray-950">{detail.record.collectionCount}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Services</p>
              <p className="mt-2 font-semibold text-gray-950">{detail.record.serviceCount}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Active Users</p>
              <p className="mt-2 font-semibold text-gray-950">{detail.record.activeUserCount}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Total Users</p>
              <p className="mt-2 font-semibold text-gray-950">{detail.record.totalUserCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <DetailList
          title="Collection codes"
          icon={<Layers3 className="h-4 w-4" />}
          items={detail.collections.map((collection) => ({
            primary: collection.code,
            secondary: collection.name,
          }))}
          emptyLabel="No collection codes are configured for this MDA yet."
        />
        <DetailList
          title="Service codes"
          icon={<Network className="h-4 w-4" />}
          items={detail.services.map((service) => ({
            primary: service.code,
            secondary: service.name,
          }))}
          emptyLabel="No service codes are configured for this MDA yet."
        />
      </div>

      <div className="rounded-3xl border border-red-100 bg-gradient-to-r from-red-50 via-white to-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white p-2 text-[#E8001C]">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-950">Scope model</p>
            <p className="mt-1 text-sm text-gray-600">
              Users under this MDA can be assigned one collection code and one independently selected service code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
