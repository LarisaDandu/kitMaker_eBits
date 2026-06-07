import { useMemo, useState } from 'react'
import { cn } from '../../lib/cn'
import ViewModeToggle from './ViewModeToggle'

function ExternalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 5h5v5M10 14 19 5M5 10v9h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ProductDetails({ product }) {
  return (
    <div className="mt-5 rounded-xl bg-background px-6 py-5">
      <h3 className="m-0 text-lg font-bold text-text">{product.fullName}</h3>
      <ul className="mt-4 flex flex-col gap-2 pl-5 text-sm font-medium text-text">
        {product.details.slice(0, 4).map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>
    </div>
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
          <span className={cn('flex size-6 items-center justify-center text-2xl leading-none', expanded && 'rotate-180')}>
            v
          </span>
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
          className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-text px-6 py-3 text-center font-body text-base font-medium whitespace-nowrap text-accent-1 no-underline"
        >
          See on Ebits.dk <ExternalIcon />
        </a>
      </div>
      {expanded ? <ProductDetails product={product} /> : null}
    </article>
  )
}

function ProductCard({ product }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-accent-2 bg-background shadow-sm">
      <div className="flex h-32 items-center justify-center bg-background-third text-text-secondary">
        <span className="text-sm font-medium">Product image</span>
      </div>
      <div className="flex flex-1 flex-col px-5 py-5">
        <h3 className="m-0 text-lg font-bold text-text">{product.name}</h3>
        <p className="m-0 mt-1 text-sm text-text-secondary">{product.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-text-secondary bg-background-third px-3 py-1.5 text-sm text-text">
            pcs/kit: 1
          </span>
          <span className="rounded-full bg-background-secondary px-3 py-1.5 text-sm text-text">
            {product.price} kr/pc
          </span>
        </div>
        <div className="mt-auto flex flex-wrap gap-3 pt-5">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="min-w-0 flex-1 rounded-xl border border-accent-2 bg-transparent px-4 py-2.5 font-body text-sm font-medium text-text"
          >
            More info
          </button>
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-text px-4 py-2.5 text-center font-body text-sm font-medium text-accent-1 no-underline"
          >
            Ebits.dk <ExternalIcon />
          </a>
        </div>
      </div>
      {expanded ? <div className="px-5 pb-5"><ProductDetails product={product} /></div> : null}
    </article>
  )
}

export default function PreviousOrderProductList({ products, showModify, onModify }) {
  const [view, setView] = useState('list')
  const [query, setQuery] = useState('')

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return products.filter(
      (product) =>
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.subtitle.toLowerCase().includes(normalizedQuery) ||
        product.fullName?.toLowerCase().includes(normalizedQuery),
    )
  }, [products, query])

  return (
    <section className="rounded-[20px] bg-background-secondary px-8 py-7 max-sm:px-4">
      <div className="rounded-xl bg-background-third px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex w-full max-w-[430px] items-center gap-2 rounded-xl border-2 border-accent-2 bg-background px-4 py-3 text-text">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search previous kit components..."
              className="w-full border-none bg-transparent font-body text-base text-text outline-none placeholder:text-text-secondary"
              aria-label="Search previous kit components"
            />
          </label>
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

      <div className="mt-8">
        <ViewModeToggle view={view} onViewChange={setView} />
      </div>

      <div className={cn('mt-8', view === 'grid' && 'grid gap-6 md:grid-cols-2 xl:grid-cols-3')}>
        {filteredProducts.length === 0 ? (
          <p className="m-0 py-8 text-center text-sm font-medium text-text-secondary">
            No previous kit components match your search.
          </p>
        ) : (
          filteredProducts.map((product) =>
            view === 'grid' ? (
              <ProductCard key={product.id} product={product} />
            ) : (
              <ProductRow key={product.id} product={product} />
            ),
          )
        )}
      </div>
    </section>
  )
}
