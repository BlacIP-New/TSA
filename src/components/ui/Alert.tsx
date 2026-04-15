import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  variant?: AlertVariant;
  message: string;
  className?: string;
}

const config: Record<AlertVariant, { icon: React.FC<{ className?: string }>; classes: string }> = {
  error: { icon: XCircle, classes: 'bg-red-50 border-red-200 text-red-700' },
  success: { icon: CheckCircle2, classes: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  info: { icon: Info, classes: 'bg-blue-50 border-blue-200 text-blue-700' },
  warning: { icon: AlertCircle, classes: 'bg-amber-50 border-amber-200 text-amber-700' },
};

export function Alert({ variant = 'info', message, className = '' }: AlertProps) {
  const { icon: Icon, classes } = config[variant];
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${classes} ${className}`}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
