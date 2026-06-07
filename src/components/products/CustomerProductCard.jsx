import { useId, useState } from 'react'
import { PRODUCT_STATUS } from '../../data/products'
import { formatKr } from '../../lib/format'
import { cn } from '../../lib/cn'
import Button from '../ui/Button'

const DECISIONS = [
  {
    id: PRODUCT_STATUS.APPROVED,
    label: 'Approve',
    selectedLabel: 'Approved',
    className: 'border-accent-1 bg-accent-1-lighter text-text',
  },
  {
    id: PRODUCT_STATUS.CHANGES,
    label: 'Changes',
    selectedLabel: 'Changes',
    className: 'border-accent-3 bg-accent-3-lighter text-text',
  },
  {
    id: PRODUCT_STATUS.REJECTED,
    label: 'Reject',
    selectedLabel: 'Rejected',
    className: 'border-accent-2 bg-accent-2-lighter text-text',
  },
]

function ProductImagePlaceholder() {
  return (
    <div className="flex h-32 items-center justify-center bg-background-third">
      <div className="flex flex-col items-center gap-1 text-center">
        <svg width="58" height="48" viewBox="0 0 64 52" fill="none" aria-hidden="true">
          <rect
            x="9"
            y="12"
            width="46"
            height="28"
            rx="4"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text"
          />
          <rect
            x="16"
            y="18"
            width="12"
            height="8"
            rx="1"
            fill="currentColor"
            className="text-accent-1"
          />
          <path
            d="M30 23h18M30 29h14"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text"
          />
        </svg>
      </div>
    </div>
  )
}

function ProductImage({ product }) {
  if (product.imageUrl) {
    return (
      <div className="h-32 overflow-hidden bg-background-third">
        <img
          src={product.imageUrl}
          alt=""
          className="h-full w-full object-contain"
        />
      </div>
    )
  }

  return <ProductImagePlaceholder />
}

function ProductMeta({ label, value }) {
  if (value == null || value === '') return null

  return (
    <span className="rounded-full border border-text-secondary bg-background-third px-3 py-1.5 text-sm font-medium text-text">
      {label}: {value}
    </span>
  )
}

function formatPrice(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'number') return formatKr(value)
  return value
}

function DecisionPill({ option, checked, name, onChange }) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center rounded-full border px-3 py-1.5 font-body text-sm font-medium transition-opacity',
        option.className,
        !checked && 'opacity-80',
      )}
    >
      <input
        type="radio"
        name={name}
        value={option.id}
        checked={checked}
        onChange={() => onChange(option.id)}
        className="sr-only"
      />
      {checked ? option.selectedLabel : option.label}
    </label>
  )
}

function CustomerDecision({ product, review, onApply }) {
  const radioName = useId()
  const [decision, setDecision] = useState(review?.status ?? '')
  const [comment, setComment] = useState(review?.comment ?? '')
  const hasDecision = Boolean(review?.status)

  function handleApply() {
    if (!decision) return

    onApply(product.id, {
      status: decision,
      comment,
    })
  }

  return (
    <div className="mt-4 border-t border-text pt-4">
      {hasDecision ? (
        <span
          className={cn(
            'inline-flex w-fit rounded-full border px-3 py-1.5 font-body text-sm font-medium',
            DECISIONS.find((item) => item.id === review.status)?.className,
          )}
        >
          {DECISIONS.find((item) => item.id === review.status)?.selectedLabel}
        </span>
      ) : (
        <>
          <p className="m-0 max-w-[240px] text-sm font-medium leading-tight text-text">
            Customer Decision (choose from the list below)
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {DECISIONS.map((option) => (
              <DecisionPill
                key={option.id}
                option={option}
                checked={decision === option.id}
                name={radioName}
                onChange={setDecision}
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-4 rounded-xl bg-background-third px-4 py-3">
        <h4 className="m-0 text-sm font-bold text-text">Customer Reply</h4>
        {hasDecision ? (
          <p className="m-0 mt-3 text-sm leading-snug text-text">
            {review.comment || '[no reply]'}
          </p>
        ) : (
          <>
            <label className="sr-only" htmlFor={`${radioName}-comment`}>
              Customer reply
            </label>
            <textarea
              id={`${radioName}-comment`}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Type here comment or requested change..."
              className={cn(
                'mt-3 min-h-24 w-full resize-y rounded-xl border border-accent-2 bg-transparent px-3 py-3',
                'font-body text-sm text-text outline-none placeholder:text-text-secondary focus:border-text',
              )}
            />
            <Button
              type="button"
              onClick={handleApply}
              disabled={!decision}
              variant="accent"
              size="sm"
              rounded="xl"
              className={cn('mt-4', !decision && 'cursor-not-allowed bg-text-secondary text-background opacity-70')}
            >
              Apply
            </Button>
          </>
        )}
      </div>

      {hasDecision ? (
        <Button
          type="button"
          onClick={() => {
            setDecision(review.status)
            setComment(review.comment ?? '')
            onApply(product.id, null)
          }}
          variant="accent"
          size="sm"
          rounded="xl"
          className="mt-4"
        >
          Change
        </Button>
      ) : null}
    </div>
  )
}

export default function CustomerProductCard({ product, review, onApply }) {
  const totalQuantity = product.orderQuantity ?? product.pcsPerKit

  return (
    <article className="overflow-hidden rounded-xl border border-accent-2 bg-background-secondary shadow-sm">
      <ProductImage product={product} />

      <div className="px-4 py-4">
        <h3 className="m-0 font-body text-lg font-bold text-text">{product.name}</h3>
        <p className="m-0 mt-1 text-sm text-text">
          {product.variant || product.subtitle}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <ProductMeta label="pcs/kit" value={product.pcsPerKit} />
          <ProductMeta label="kits" value={product.kitCount} />
          <ProductMeta label="total" value={totalQuantity} />
          <ProductMeta label="price" value={formatPrice(product.price ?? product.quoteLine)} />
        </div>

        {product.supplierLink ? (
          <a
            href={product.supplierLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm font-medium text-accent-2 underline-offset-2 hover:underline"
          >
            Open supplier link
          </a>
        ) : null}

        <CustomerDecision product={product} review={review} onApply={onApply} />
      </div>
    </article>
  )
}
