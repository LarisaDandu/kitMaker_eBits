import { Link, useNavigate } from 'react-router'
import StatusBadge from '../admin/StatusBadge'
import KitSummary from '../kits/KitSummary'
import KitStats from '../kits/KitStats'
import Button from '../ui/Button'
import { buttonClassName } from '../ui/buttonStyles'
import { cn } from '../../lib/cn'

export default function UniversityCard({ university, onDelete }) {
  const navigate = useNavigate()
  const { id, name, kit, status } = university

  function handleCardClick() {
    navigate(`/admin/customers/${id}`)
  }

  function stopPropagation(event) {
    event.stopPropagation()
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleCardClick()
        }
      }}
      className={cn(
        'cursor-pointer rounded-[20px] bg-background px-6 py-5 transition-opacity hover:opacity-95',
        'max-sm:px-4',
      )}
    >
      <div
        className={cn(
          'mb-4 flex flex-wrap items-center justify-between gap-3',
        )}
        onClick={stopPropagation}
      >
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          <span
            className={cn(
              'inline-block rounded-full bg-background-secondary px-3.5 py-1.5 text-sm font-medium text-text-secondary',
            )}
          >
            Quote {kit.quoteId}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/admin/customers/${id}/edit`}
            className={buttonClassName({
              variant: 'outlineStrong',
              size: 'sm',
              className: 'border-2',
            })}
          >
            Edit customer
          </Link>
          <Button
            variant="danger"
            onClick={() => onDelete?.(id, name)}
            aria-label={`Delete ${name}`}
          >
            <TrashIcon />
            Delete customer
          </Button>
        </div>
      </div>

      <div className="mb-5">
        <h2 className={cn('m-0 mb-1 font-body text-[1.75rem] font-semibold text-text')}>
          {name}
        </h2>
        <KitSummary kit={kit} />
        {university.professorName && (
          <p className={cn('mt-1 m-0 text-sm text-text-secondary')}>
            {university.professorName}
            {university.email ? ` · ${university.email}` : ''}
          </p>
        )}
      </div>

      <KitStats stats={kit.stats} />
    </article>
  )
}

function TrashIcon() {
  return (
    <svg
      className="shrink-0"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}
