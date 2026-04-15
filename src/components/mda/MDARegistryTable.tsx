import { Building2, ChevronRight } from 'lucide-react';
import { MDARecord } from '../../types/mda';

interface MDARegistryTableProps {
  mdas: MDARecord[];
  selectedMDAId: string | null;
  isLoading?: boolean;
  onSelect: (mdaId: string) => void;
}

export function MDARegistryTable({
  mdas,
  selectedMDAId,
  isLoading = false,
  onSelect,
}: MDARegistryTableProps) {
  return (
    <section className="app-panel border-gray-300">
      <div className="border-b border-slate-200/80 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-950">MDA registry</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select an MDA to inspect its collection codes, service codes, settlements, and users.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="app-data-table">
          <thead>
            <tr>
              <th className="px-5 py-4">MDA</th>
              <th className="px-5 py-4">Collections</th>
              <th className="px-5 py-4">Services</th>
              <th className="px-5 py-4">Active Users</th>
              <th className="px-5 py-4">Total Users</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {isLoading &&
              Array.from({ length: 5 }, (_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4" colSpan={5}>
                    <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && mdas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">
                  No MDAs are available in the current aggregator scope.
                </td>
              </tr>
            )}

            {!isLoading &&
              mdas.map((mda) => {
                const isSelected = mda.id === selectedMDAId;

                return (
                  <tr
                  key={mda.id}
                  role="button"
                  tabIndex={0}
                    className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                      isSelected ? 'bg-[#335CFF]/8' : ''
                    }`}
                    onClick={() => onSelect(mda.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelect(mda.id);
                      }
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg border border-gray-300 bg-white p-2 text-slate-600">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-950">{mda.mdaCode}</p>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{mda.mdaName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700 tabular-nums">{mda.collectionCount}</td>
                    <td className="px-5 py-4 font-semibold text-slate-700 tabular-nums">{mda.serviceCount}</td>
                    <td className="px-5 py-4 font-semibold text-slate-700 tabular-nums">{mda.activeUserCount}</td>
                    <td className="px-5 py-4 font-semibold text-slate-700 tabular-nums">{mda.totalUserCount}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
