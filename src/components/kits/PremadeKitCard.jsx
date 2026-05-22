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

function KitPart({ part }) {
  return (
    <div className="grid items-center gap-4 md:grid-cols-[1fr_1fr_auto]">
      <span>
        {part.quantity} pcs&nbsp;&nbsp;
        <strong>{part.name}</strong>
      </span>
      <span>Pris: {part.price} kr-</span>
      <a
        href={part.link}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClassName({
          variant: 'accent',
          size: 'md',
          rounded: 'xl',
          className: 'max-w-full whitespace-normal text-center',
        })}
      >
        See on Ebits.dk
        <ExternalIcon />
      </a>
    </div>
  )
}

function PremadeKitModal({ kit, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/60 px-4 py-8">
      <section className="relative max-h-[90vh] w-full max-w-[920px] overflow-auto rounded-xl border border-accent-2 bg-background-secondary shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-6 cursor-pointer border-none bg-transparent font-body text-5xl leading-none text-text"
          aria-label="Close kit details"
        >
          X
        </button>
        <div className="h-36 bg-background" />
        <div className="px-8 py-8">
          <h2 className="m-0 text-2xl font-bold text-text">{kit.name}</h2>
          <p className="m-0 mt-6 text-base text-text">Komponenter: {kit.componentCount}</p>
          <p className="m-0 mt-5 text-base text-text">Pris/kit: {kit.price} kr-</p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {kit.parts.slice(0, 3).map((part) => (
              <article key={part.id} className="overflow-hidden rounded-xl border border-accent-2 bg-background-secondary shadow-md">
                <div className="h-36 bg-background-third" />
                <div className="px-5 py-5">
                  <h3 className="m-0 text-xl font-bold text-text">{part.name}</h3>
                  <p className="m-0 mt-6 text-base text-text">Stk: {part.quantity}</p>
                  <p className="m-0 mt-5 text-base text-text">Pris: {part.price} kr--</p>
                  <a
                    href={part.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClassName({
                      variant: 'accent',
                      size: 'md',
                      rounded: 'xl',
                      fullWidth: true,
                      className: 'mt-6 whitespace-normal text-center',
                    })}
                  >
                    See on Ebits.dk
                    <ExternalIcon />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default function PremadeKitCard({ kit, view, onAdd }) {
  const [quantity, setQuantity] = useState(1)
  const [expanded, setExpanded] = useState(false)
  const [showModal, setShowModal] = useState(false)

  if (view === 'grid') {
    return (
      <article className="overflow-hidden rounded-xl border border-accent-2 bg-background-secondary shadow-sm">
        <div className="h-36 bg-background-third" />
        <div className="px-5 py-5">
          <h3 className="m-0 text-xl font-bold text-text">{kit.name}</h3>
          <p className="m-0 mt-5 text-base text-text">{kit.componentCount} komponenter</p>
          <p className="m-0 mt-4 text-base text-text">{kit.price} kr/kit</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => setShowModal(true)}
              variant="accent"
              size="sm"
              rounded="xl"
              className="min-w-0 px-3 text-sm"
            >
              More info
            </Button>
            <Button
              type="button"
              onClick={() => onAdd(kit, quantity)}
              variant="accent"
              size="sm"
              rounded="xl"
              className="min-w-0 px-3 text-sm"
            >
              Add
            </Button>
          </div>
          {showModal ? <PremadeKitModal kit={kit} onClose={() => setShowModal(false)} /> : null}
        </div>
      </article>
    )
  }

  return (
    <article className="border-b border-text-secondary py-8">
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex cursor-pointer items-center gap-3 border-none bg-transparent p-0 text-left text-xl font-bold leading-none text-text"
        >
          <span className={cn('flex size-6 items-center justify-center text-2xl leading-none', expanded && 'rotate-180')}>⌄</span>
          {kit.name}
        </button>
        <span>{kit.componentCount} komponenter</span>
        <div className="flex items-center gap-3">
          <span>pcs</span>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </div>
        <span>{kit.price} kr/kit</span>
        <Button
          type="button"
          onClick={() => onAdd(kit, quantity)}
          variant="accent"
          size="lg"
          rounded="xl"
          className="whitespace-normal text-center"
        >
          Add to Cart
        </Button>
      </div>
      {expanded ? (
        <div className="mt-8 rounded-[20px] bg-background px-8 py-8">
          <div className="flex flex-col gap-8">
            {kit.parts.map((part) => (
              <KitPart key={part.id} part={part} />
            ))}
          </div>
        </div>
      ) : null}
    </article>
  )
}
