import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
}

export function Select({
  label,
  error,
  hint,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`
            h-11 w-full appearance-none rounded-lg border bg-white/80 pl-4 pr-11 text-sm font-medium text-slate-900 outline-none transition-all
            ${error
              ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100'
              : 'border-gray-300 focus:border-[#335CFF] focus:ring-4 focus:ring-[#335CFF]/12'
            }
            disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
