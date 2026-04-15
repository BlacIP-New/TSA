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
    <section className="app-panel border-gray-300 p-5">
      <div className="flex items-center gap-2">
        <div className="rounded-lg border border-gray-300 bg-white p-2 text-slate-600">
          <Layers3 className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-950">Collection codes</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose a collection code to inspect its settlement batches.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading &&
          Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-lg bg-slate-100" />
          ))}

        {!isLoading && collections.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-sm text-slate-500">
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
                className={`w-full rounded border px-4 py-4 text-left transition-colors ${
                  isSelected
                    ? 'border-gray-300 bg-[#335CFF] text-white'
                    : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                }`}
                onClick={() => onSelect(collection.code)}
              >
                <p className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-950'}`}>{collection.code}</p>
                <p className={`mt-1 text-sm ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>{collection.name}</p>
              </button>
            );
          })}
      </div>
    </section>
  );
}
