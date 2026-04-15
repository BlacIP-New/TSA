import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftAddon,
  rightAddon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <span className="pointer-events-none absolute left-3.5 text-slate-400">{leftAddon}</span>
        )}
        <input
          id={inputId}
          className={`
            h-11 w-full rounded-2xl border bg-white/80 text-sm font-medium text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]
            placeholder:text-slate-400 outline-none transition-all
            focus:ring-4 focus:ring-offset-0
            ${error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200/80 focus:border-sky-300 focus:ring-sky-100'
            }
            ${leftAddon ? 'pl-10' : 'pl-4'}
            ${rightAddon ? 'pr-11' : 'pr-4'}
            disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {rightAddon && (
          <span className="absolute right-3.5 text-slate-400">{rightAddon}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
