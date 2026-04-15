import { Badge } from '../ui/Badge';
import { MDAStatus } from '../../types/mda';

interface MDAStatusBadgeProps {
  status: MDAStatus;
}

const statusConfig: Record<MDAStatus, { label: string; variant: 'warning' | 'success' | 'neutral' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'neutral' },
};

export function MDAStatusBadge({ status }: MDAStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
