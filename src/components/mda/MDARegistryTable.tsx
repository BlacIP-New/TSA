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
    <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-950">MDA registry</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select an MDA to inspect its collection codes, service codes, settlements, and users.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              <th className="px-5 py-4">MDA</th>
              <th className="px-5 py-4">Collections</th>
              <th className="px-5 py-4">Services</th>
              <th className="px-5 py-4">Active Users</th>
              <th className="px-5 py-4">Total Users</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading &&
              Array.from({ length: 5 }, (_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4" colSpan={5}>
                    <div className="h-12 animate-pulse rounded-2xl bg-gray-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && mdas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-500">
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
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-red-50/50' : ''
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
                        <div className="rounded-2xl bg-[#E8001C]/8 p-2 text-[#E8001C]">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-950">{mda.mdaCode}</p>
                            <ChevronRight className="h-4 w-4 text-gray-300" />
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{mda.mdaName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-700">{mda.collectionCount}</td>
                    <td className="px-5 py-4 font-medium text-gray-700">{mda.serviceCount}</td>
                    <td className="px-5 py-4 font-medium text-gray-700">{mda.activeUserCount}</td>
                    <td className="px-5 py-4 font-medium text-gray-700">{mda.totalUserCount}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
