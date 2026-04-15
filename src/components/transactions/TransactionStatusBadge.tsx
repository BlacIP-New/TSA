import { Badge } from '../ui/Badge';
import { TransactionStatus } from '../../types/transaction';
import { formatStatus } from '../../utils/formatters';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
}

const STATUS_VARIANTS: Record<TransactionStatus, 'success' | 'warning' | 'error'> = {
  settled: 'success',
  pending: 'warning',
  failed: 'error',
};

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} dot>
      {formatStatus(status)}
    </Badge>
  );
}
