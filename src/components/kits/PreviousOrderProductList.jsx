import { useState } from 'react'
import { cn } from '../../lib/cn'

function ExternalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 5h5v5M10 14 19 5M5 10v9h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ViewButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex size-10 cursor-pointer items-center justify-center rounded-md border border-text bg-transparent text-text',
        active && 'bg-text text-accent-1',
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

function ProductRow({ product }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="border-b border-text-secondary py-7">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_auto_auto]">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex cursor-pointer items-center gap-3 border-none bg-transparent p-0 text-left text-xl font-bold leading-none text-text"
        >
          <span className={cn('flex size-6 items-center justify-center text-2xl leading-none', expanded && 'rotate-180')}>⌄</span>
          {product.name}
        </button>
        <span className="w-fit rounded-full border border-text-secondary bg-background-third px-4 py-2 text-base text-text">
          pcs/kit: 1
        </span>
        <span className="min-w-[90px] text-base text-text">{product.price} kr/pc</span>
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-xl bg-text px-8 py-3 text-center font-body text-base font-medium whitespace-nowrap text-accent-1 no-underline"
        >
          See on Ebits.dk <ExternalIcon />
        </a>
      </div>
      {expanded ? (
        <div className="mt-5 rounded-xl bg-background px-6 py-5">
          <h3 className="m-0 text-lg font-bold text-text">{product.fullName}</h3>
          <ul className="mt-4 flex flex-col gap-2 pl-5 text-sm font-medium text-text">
            {product.details.slice(0, 4).map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}

export default function PreviousOrderProductList({ products, showModify, onModify }) {
  const [view, setView] = useState('list')

  return (
    <section className="rounded-[20px] bg-background-secondary px-8 py-7">
      <div className="rounded-xl bg-background-third px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            type="search"
            className="min-w-[280px] flex-1 rounded-xl border border-accent-2 bg-transparent px-4 py-3 font-body text-base text-text outline-none"
            aria-label="Search products"
          />
          {showModify ? (
            <button
              type="button"
              onClick={onModify}
              className="rounded-xl border-none bg-text px-8 py-3 font-body text-base font-medium text-accent-1"
            >
              Modify list
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-12 flex justify-end gap-2">
        <ViewButton active={view === 'list'} onClick={() => setView('list')}>
          ☰
        </ViewButton>
        <ViewButton active={view === 'grid'} onClick={() => setView('grid')}>
          ▦
        </ViewButton>
      </div>

      <div className={cn('mt-8', view === 'grid' && 'grid gap-6 md:grid-cols-2 xl:grid-cols-3')}>
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
