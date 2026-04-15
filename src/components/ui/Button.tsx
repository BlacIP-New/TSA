import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-sky-200/80 bg-sky-100 text-sky-900 shadow-[0_10px_24px_rgba(125,183,255,0.18)] hover:bg-sky-200/70 focus-visible:ring-sky-200 disabled:bg-sky-100/60 disabled:text-sky-700/60 disabled:shadow-none',
  secondary:
    'border border-slate-200/80 bg-white/80 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:bg-white focus-visible:ring-slate-300 disabled:opacity-50',
  ghost:
    'border border-transparent bg-transparent text-slate-600 hover:border-slate-200/80 hover:bg-white/70 hover:text-slate-900 focus-visible:ring-slate-300 disabled:opacity-50',
  danger:
    'border border-red-200 bg-red-50 text-red-700 shadow-[0_10px_24px_rgba(220,38,38,0.08)] hover:bg-red-100 focus-visible:ring-red-200 disabled:opacity-50 disabled:shadow-none',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs gap-1.5',
  md: 'h-11 px-4.5 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-2xl font-semibold tracking-[-0.01em]
        transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
        cursor-pointer disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
}
