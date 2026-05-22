import { STATUS_LABELS, UNIVERSITY_STATUS } from '../../data/universities'
import { cn } from '../../lib/cn'

export default function PreviousOrders({ orders = [], onExportCsv }) {
  if (orders.length === 0) return null

  return (
    <section
      className={cn('rounded-[20px] bg-background-secondary px-6 py-5 max-sm:rounded-2xl max-sm:px-4')}
      aria-label="Previous orders"
    >
      <h2 className={cn('m-0 mb-4 font-body text-lg font-semibold text-text')}>
        Previous orders
      </h2>

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {orders.map((order) => (
          <li
            key={order.id}
            className={cn(
              'flex flex-wrap items-center justify-between gap-3 rounded-xl bg-background px-4 py-3',
            )}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-body text-sm font-medium text-text">{order.name}</span>
              <span
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium',
                  order.status === UNIVERSITY_STATUS.INACTIVE_ORDERS
                    ? 'bg-background-third text-text-secondary'
                    : 'bg-accent-1-lighter text-text',
                )}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onExportCsv?.(order)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-full bg-text px-4 py-2 font-body text-sm font-medium text-background transition-opacity hover:opacity-90',
              )}
            >
              Export CSV
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
