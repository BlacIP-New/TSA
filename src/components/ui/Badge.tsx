type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80',
  warning: 'bg-amber-50/80 text-amber-800 border-amber-200/80',
  error: 'bg-red-50/80 text-red-800 border-red-200/80',
  neutral: 'bg-slate-100/80 text-slate-700 border-slate-200/80',
  info: 'bg-blue-50/80 text-blue-800 border-blue-200/80',
};

const dotClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  neutral: 'bg-gray-400',
  info: 'bg-blue-500',
};

export function Badge({ variant = 'neutral', children, dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant]}`} />}
      {children}
    </span>
  );
}
