import { useState } from 'react'
import QuantityStepper from './QuantityStepper'
import { cn } from '../../lib/cn'
import Button from '../ui/Button'
import { buttonClassName } from '../ui/buttonStyles'

function ExternalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 5h5v5M10 14 19 5M5 10v9h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProductImagePlaceholder() {
  return (
    <div className="flex h-32 items-center justify-center bg-background-third">
      <svg width="70" height="56" viewBox="0 0 64 52" fill="none" aria-hidden="true">
        <rect x="9" y="12" width="46" height="28" rx="4" stroke="currentColor" strokeWidth="2" className="text-text" />
        <rect x="16" y="18" width="12" height="8" rx="1" fill="currentColor" className="text-accent-1" />
        <path d="M30 23h18M30 29h14" stroke="currentColor" strokeWidth="2" className="text-text" />
      </svg>
    </div>
  )
}

function Details({ product }) {
  return (
    <div className="mt-6 rounded-[20px] bg-background px-8 py-7">
      <h3 className="m-0 text-xl font-bold text-text">{product.fullName}</h3>
      <p className="m-0 mt-6 text-base text-text">Pris/pc: {product.price} kr-</p>
      <ul className="mt-6 flex flex-col gap-4 pl-6 text-base font-semibold text-text">
        {product.details.map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>
      <a
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClassName({
          variant: 'accent',
          size: 'md',
          rounded: 'xl',
          className: 'mt-6 max-w-full whitespace-normal text-center',
        })}
      >
        See on Ebits.dk
        <ExternalIcon />
      </a>
    </div>
  )
}

function ProductDetailsModal({ product, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/60 px-4 py-8">
      <div className="relative max-h-[90vh] w-full max-w-[760px] overflow-auto rounded-[20px] bg-background-secondary px-6 py-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex size-9 cursor-pointer items-center justify-center rounded-full border-none bg-text font-body text-xl leading-none text-background"
          aria-label="Close product details"
        >
          ×
        </button>
        <Details product={product} />
      </div>
    </div>
  )
}

export default function KitMakerProductCard({ product, view, onAdd }) {
  const [quantity, setQuantity] = useState(1)
  const [expanded, setExpanded] = useState(false)

  if (view === 'grid') {
    return (
      <article className="overflow-hidden rounded-xl border border-accent-2 bg-background-secondary shadow-sm">
        <ProductImagePlaceholder />
        <div className="px-4 py-4">
          <h3 className="m-0 text-lg font-bold text-text">{product.name}</h3>
          <p className="m-0 mt-1 text-sm text-text">{product.subtitle}</p>
          <span className="mt-5 inline-flex rounded-full border border-text-secondary bg-background-third px-3 py-1.5 text-sm font-medium text-text">
            pcs/kit: {quantity}
          </span>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              variant="accent"
              size="sm"
              rounded="xl"
              className="min-w-0 px-3 text-sm"
            >
              More info
            </Button>
            <Button
              type="button"
              onClick={() => onAdd(product, quantity)}
              variant="accent"
              size="sm"
              rounded="xl"
              className="min-w-0 px-3 text-sm"
            >
              Add
            </Button>
          </div>
          {expanded ? (
            <ProductDetailsModal
              product={product}
              onClose={() => setExpanded(false)}
            />
          ) : null}
        </div>
      </article>
    )
  }

  return (
    <article className="border-b border-text-secondary py-6">
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_auto_auto]">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex cursor-pointer items-center gap-3 border-none bg-transparent p-0 text-left text-xl font-bold leading-none text-text"
        >
          <span
            className={cn(
              'flex size-6 items-center justify-center text-2xl leading-none',
              expanded && 'rotate-180',
            )}
          >
            ⌄
          </span>
          {product.name}
        </button>
        <div className="flex items-center gap-3">
          <span>pcs</span>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </div>
        <span className="text-base text-text">{product.price} kr/pc</span>
        <Button
          type="button"
          onClick={() => onAdd(product, quantity)}
          variant="accent"
          size="lg"
          rounded="xl"
          className="whitespace-normal text-center"
        >
          Add to Cart
        </Button>
      </div>
      {expanded ? <Details product={product} /> : null}
    </article>
  )
}
