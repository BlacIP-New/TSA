import { Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface ExportButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
}

export function ExportButton({
  disabled = false,
  isLoading = false,
  onClick,
}: ExportButtonProps) {
  return (
    <Button
      size="sm"
      variant="primary"
      disabled={disabled}
      isLoading={isLoading}
      leftIcon={<Download className="h-4 w-4" />}
      onClick={onClick}
    >
      Export
    </Button>
  );
}
