import type { BookStatus } from '@/types/database';

interface StatusBadgeProps {
  status: BookStatus;
  size?: 'sm' | 'md';
}

/** StatusBadge (US-07): Visual indicator for book availability */
export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps): React.JSX.Element {
  const isAvailable = status === 'available';

  const sizeClasses = size === 'md'
    ? 'px-3 py-1 text-sm'
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${
        isAvailable
          ? 'bg-success-500/20 text-success-500'
          : 'bg-warning-500/20 text-warning-500'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isAvailable ? 'bg-success-500 animate-pulse' : 'bg-warning-500'
        }`}
      />
      {isAvailable ? 'Disponible' : 'Reservado'}
    </span>
  );
}
