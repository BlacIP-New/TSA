import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  variant?: AlertVariant;
  message: string;
  className?: string;
}

const config: Record<AlertVariant, { icon: React.FC<{ className?: string }>; classes: string }> = {
  error: { icon: XCircle, classes: 'border-red-200/80 bg-red-50/80 text-red-700' },
  success: { icon: CheckCircle2, classes: 'border-sky-200/80 bg-sky-50/80 text-sky-800' },
  info: { icon: Info, classes: 'border-slate-200/80 bg-white/85 text-slate-700' },
  warning: { icon: AlertCircle, classes: 'border-amber-200/80 bg-amber-50/80 text-amber-700' },
};

export function Alert({ variant = 'info', message, className = '' }: AlertProps) {
  const { icon: Icon, classes } = config[variant];
  return (
    <div className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${classes} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
