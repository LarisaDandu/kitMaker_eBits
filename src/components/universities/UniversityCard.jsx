import { Link, useNavigate } from 'react-router'
import Button from '../ui/Button'
import { buttonClassName } from '../ui/buttonStyles'
import { UNIVERSITY_STATUS } from '../../data/universities'
import { cn } from '../../lib/cn'
import { getActiveOrders } from '../../lib/universityUtils'

function QuotePill({ order }) {
  const requiresChanges = order.status === UNIVERSITY_STATUS.REQUIRES_CHANGES

  return (
    <span
      className={cn(
        'inline-flex min-h-10 items-center rounded-full border px-5 text-lg text-text',
        requiresChanges
          ? 'border-accent-2 bg-accent-2-lighter'
          : 'border-text bg-background-third',
      )}
    >
      Quote {order.quoteId}
      {requiresChanges ? ' - requires changes' : ''}
    </span>
  )
}

export default function UniversityCard({ university, onDelete }) {
  const navigate = useNavigate()
  const { id, name } = university
  const activeOrders = getActiveOrders(university)

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
        'w-full cursor-pointer rounded-[20px] bg-background px-8 py-7 transition-opacity hover:opacity-95',
        'max-sm:px-5',
      )}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_auto]" onClick={stopPropagation}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex min-h-10 items-center rounded-full bg-accent-1-lighter px-5 text-lg text-text">
            {activeOrders.length} Active {activeOrders.length === 1 ? 'order' : 'orders'}
          </span>
          {activeOrders.map((order) => (
            <QuotePill key={order.id} order={order} />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            to={`/admin/customers/${id}/edit`}
            className={buttonClassName({
              variant: 'outlineStrong',
              size: 'sm',
              rounded: 'xl',
              className: 'min-w-[210px] border-2 text-base',
            })}
          >
            <EditIcon />
            Edit customer
          </Link>
          <Button
            variant="danger"
            size="sm"
            rounded="xl"
            className="min-w-[230px] text-base"
            onClick={() => onDelete?.(id, name)}
            aria-label={`Delete ${name}`}
          >
            <TrashIcon />
            Delete customer
          </Button>
        </div>
      </div>

      <div className="mt-9">
        <h2 className="m-0 font-body text-4xl font-normal text-text max-sm:text-3xl">
          {name}
        </h2>
        <div className="mt-8 flex max-w-[560px] flex-col gap-3 text-xl text-text">
          {activeOrders.map((order) => (
            <p
              key={order.id}
              className="m-0 rounded-xl bg-background-secondary px-5 py-3"
            >
              {order.name}
            </p>
          ))}
        </div>
      </div>

      <Link
        to={`/admin/customers/${id}`}
        onClick={stopPropagation}
        className={buttonClassName({
          variant: 'accent',
          size: 'md',
          rounded: 'xl',
          className: 'mt-9 min-w-[185px] text-lg',
        })}
      >
        View details
      </Link>
    </article>
  )
}

function EditIcon() {
  return (
    <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" fill="currentColor" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      className="shrink-0"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}
