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
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <span className="absolute left-3 text-gray-400 pointer-events-none">{leftAddon}</span>
        )}
        <input
          id={inputId}
          className={`
            w-full h-10 rounded-lg border bg-white text-sm text-gray-900
            placeholder:text-gray-400 outline-none transition-colors
            focus:ring-2 focus:ring-offset-0
            ${error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-200 focus:border-[#E8001C] focus:ring-[#E8001C]/10'
            }
            ${leftAddon ? 'pl-9' : 'pl-3.5'}
            ${rightAddon ? 'pr-10' : 'pr-3.5'}
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {rightAddon && (
          <span className="absolute right-3 text-gray-400">{rightAddon}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
