import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

export interface DropdownOption {
  label: string;
  value: string;
  description?: string;
}

interface SearchableDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  allowCustomValue?: boolean;
  customValueLabel?: string;
  onChange: (value: string) => void;
}

export function SearchableDropdown({
  label,
  value,
  options,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search',
  error,
  hint,
  disabled = false,
  allowCustomValue = false,
  customValueLabel,
  onChange,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter((option) => {
      const searchableText = `${option.label} ${option.description ?? ''}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [options, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</label>

      <button
        type="button"
        disabled={disabled}
        className={`flex h-11 w-full items-center justify-between rounded-lg border bg-white/80 px-4 text-left text-sm font-medium text-slate-900 outline-none transition-all focus:ring-4 focus:ring-offset-0 ${
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-300 focus:border-[#335CFF] focus:ring-[#335CFF]/12'
        } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selectedOption ? 'truncate' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-xl border border-gray-300 bg-white p-3 shadow-lg">
          <div className="mb-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              leftAddon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="max-h-56 overflow-y-auto pr-1">
            {filteredOptions.length === 0 ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-slate-500">
                  No results found.
                </div>
                {allowCustomValue && query.trim() && (
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-[#335CFF] bg-[#335CFF]/8 px-4 py-3 text-left text-sm font-medium text-[#1F3FD6] transition-colors hover:bg-[#335CFF]/12"
                    onClick={() => {
                      onChange(query.trim());
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">
                      {customValueLabel ?? 'Use typed value'}
                    </span>
                    <span className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-[#335CFF]">
                      {query.trim()}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredOptions.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                        isSelected ? 'bg-[#335CFF]/8 text-slate-950' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-[#335CFF] bg-[#335CFF] text-white' : 'border-gray-300 text-transparent'}`}>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">{option.label}</span>
                        {option.description && <span className="mt-1 block text-xs text-slate-500">{option.description}</span>}
                      </span>
                    </button>
                  );
                })}
                {allowCustomValue && query.trim() && !filteredOptions.some((option) => option.value.toLowerCase() === query.trim().toLowerCase()) && (
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-[#335CFF] bg-[#335CFF]/8 px-4 py-3 text-left text-sm font-medium text-[#1F3FD6] transition-colors hover:bg-[#335CFF]/12"
                    onClick={() => {
                      onChange(query.trim());
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">
                      {customValueLabel ?? 'Use typed value'}
                    </span>
                    <span className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-[#335CFF]">
                      {query.trim()}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}