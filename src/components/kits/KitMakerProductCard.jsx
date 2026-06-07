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

function ProductImage() {
  return (
    <div className="flex h-[184px] items-center justify-center overflow-hidden border-x border-accent-2 bg-background-third">
      <img
        src={`${import.meta.env.BASE_URL}kitmaker_img.png`}
        alt=""
        className="h-full w-full object-cover"
        aria-hidden="true"
      />
    </div>
  )
}

function Details({ product, className }) {
  return (
    <div className={cn('mt-6 rounded-[20px] bg-background px-8 py-7', className)}>
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

export default function KitMakerProductCard({ product, view, onAdd }) {
  const [quantity, setQuantity] = useState(1)
  const [expanded, setExpanded] = useState(false)

  if (view === 'grid') {
    return (
      <article
        className={cn(
          'overflow-hidden rounded-[20px] border border-accent-2 bg-background-secondary shadow-md',
          expanded && 'md:col-span-2 xl:col-span-3',
        )}
      >
        <div
          className={cn(
            expanded && 'grid items-start gap-6 lg:grid-cols-[360px_1fr]',
          )}
        >
          <div>
            <ProductImage />
            <div className="px-5 py-5">
              <h3 className="m-0 text-2xl font-bold leading-tight text-text">{product.name}</h3>
              <p className="m-0 mt-9 text-xl text-text">Pris/pc: {product.price} kr-</p>
              <div className="mt-8 flex items-center gap-4">
                <span className="text-xl text-text">pcs</span>
                <QuantityStepper value={quantity} onChange={setQuantity} />
              </div>
              <div className="mt-9 grid grid-cols-2 items-center gap-4">
                <Button
                  type="button"
                  onClick={() => onAdd(product, quantity)}
                  variant="accent"
                  size="lg"
                  rounded="xl"
                  fullWidth
                  className="min-w-0 whitespace-nowrap px-4"
                >
                  Add to Cart
                </Button>
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="flex min-h-[52px] w-full cursor-pointer items-center justify-center whitespace-nowrap border-none bg-transparent p-0 font-body text-xl text-text"
                  aria-expanded={expanded}
                >
                  {expanded ? 'see less' : 'see more'}
                </button>
              </div>
            </div>
          </div>
          {expanded ? (
            <Details
              product={product}
              className="m-5 lg:mt-5 lg:ml-0"
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
            ^
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
