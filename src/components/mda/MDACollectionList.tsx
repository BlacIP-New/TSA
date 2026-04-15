import { Layers3 } from 'lucide-react';
import { MDACollectionCode } from '../../types/mda';

interface MDACollectionListProps {
  collections: MDACollectionCode[];
  selectedCollectionCode: string | null;
  isLoading?: boolean;
  onSelect: (collectionCode: string) => void;
}

export function MDACollectionList({
  collections,
  selectedCollectionCode,
  isLoading = false,
  onSelect,
}: MDACollectionListProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="rounded-2xl bg-[#E8001C]/8 p-2 text-[#E8001C]">
          <Layers3 className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-950">Collection codes</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose a collection code to inspect its settlement batches.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading &&
          Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
          ))}

        {!isLoading && collections.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-sm text-gray-500">
            No collection codes are configured for this MDA yet.
          </div>
        )}

        {!isLoading &&
          collections.map((collection) => {
            const isSelected = collection.code === selectedCollectionCode;

            return (
              <button
                key={collection.id}
                type="button"
                className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                  isSelected
                    ? 'border-[#E8001C]/30 bg-red-50/60'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => onSelect(collection.code)}
              >
                <p className="font-medium text-gray-950">{collection.code}</p>
                <p className="mt-1 text-sm text-gray-500">{collection.name}</p>
              </button>
            );
          })}
      </div>
    </section>
  );
}
