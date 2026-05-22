import { STATUS_LABELS } from '../../data/universities'
import { cn } from '../../lib/cn'

const STATUS_STYLES = {
  requires_changes: 'bg-accent-2 text-background',
  active_order: 'bg-accent-1-lighter text-text',
  inactive_orders: 'bg-background-third text-text-secondary',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3.5 py-1.5 text-sm font-medium',
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
