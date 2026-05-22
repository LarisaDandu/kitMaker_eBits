import { PRODUCT_STATUS_LABELS } from '../../data/products'
import Button from '../ui/Button'
import CustomerReply from './CustomerReply'
import { cn } from '../../lib/cn'

const STATUS_STYLES = {
  pending_review: 'bg-accent-3-lighter text-text',
  approved: 'bg-accent-1-lighter text-text',
  rejected: 'bg-accent-2-lighter text-text',
  changes: 'bg-background-third text-text-secondary',
}

function DetailRow({ label, value, isLink }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-background py-2.5 last:border-b-0">
      <span className="text-sm text-text-secondary">{label}</span>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text hover:text-accent-2"
          aria-label="Open supplier link"
        >
          <ExternalLinkIcon />
        </a>
      ) : (
        <span className="text-sm font-medium text-text">{value}</span>
      )}
    </div>
  )
}

export default function ProductCard({ product, onChange }) {
  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-[20px] border border-background-third bg-background-secondary',
      )}
    >
      <div className="flex justify-center px-4 pt-4">
        <div
          className={cn(
            'flex h-48 w-full max-w-[240px] items-center justify-center rounded-xl border-2 border-accent-2-lighter bg-background',
          )}
        >
          <ProductImagePlaceholder />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pt-3 pb-4">
        <h3 className={cn('m-0 font-body text-base font-semibold text-text')}>
          {product.name}
        </h3>
        <p className={cn('m-0 mt-0.5 text-sm text-text-secondary')}>{product.subtitle}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium',
              STATUS_STYLES[product.status],
            )}
          >
            {PRODUCT_STATUS_LABELS[product.status]}
          </span>
          <span className="rounded-full bg-background-third px-3 py-1.5 text-sm font-medium text-text-secondary">
            pcs/kit: {product.pcsPerKit}
          </span>
        </div>

        <div className="mt-3 flex-1">
          <DetailRow label="Quote row" value={String(product.quoteRow)} />
          <DetailRow label="Order quantity" value={String(product.orderQuantity)} />
          <DetailRow label="Variant" value={product.variant} />
          <DetailRow label="Pack" value={product.pack} />
          <DetailRow label="Quote line" value={product.quoteLine} />
          <DetailRow label="Supplier link" value={product.supplierLink} isLink />
        </div>

        <CustomerReply reply={product.customerReply} status={product.status} />

        <Button type="button" onClick={() => onChange?.(product)} className="mt-4 w-full justify-center">
          <EditIcon />
          Change
        </Button>
      </div>
    </article>
  )
}

function EditIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 7l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ProductImagePlaceholder() {
  return (
    <div className="flex flex-col items-center gap-1.5 p-2 text-center">
      <svg width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="8" y="16" width="48" height="32" rx="4" stroke="currentColor" strokeWidth="2" className="text-text-secondary" />
        <rect x="14" y="22" width="12" height="8" rx="1" fill="currentColor" className="text-accent-1" />
        <path d="M28 28h22M28 34h16" stroke="currentColor" strokeWidth="2" className="text-text-secondary" />
      </svg>
      <span className="text-sm font-medium text-text-secondary">ESP32 board</span>
    </div>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 5h5v5M10 14L19 5M19 5h-5M19 5v5M5 10v9h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
