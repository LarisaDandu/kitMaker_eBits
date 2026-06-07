import KitMakerProductCard from './KitMakerProductCard'
import { cn } from '../../lib/cn'

function ViewButton({ active, children, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex size-10 cursor-pointer items-center justify-center rounded-md border border-text bg-transparent text-text',
        active && 'bg-text text-accent-1',
      )}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

function publicAsset(path) {
  return `${import.meta.env.BASE_URL}${path}`
}

export default function KitMakerProductList({
  products,
  view,
  onViewChange,
  onAdd,
  emptyMessage = 'No components match your filters.',
}) {
  return (
    <section className="rounded-[20px] bg-background-secondary px-7 py-7">
      <div className="flex justify-end gap-2">
        <ViewButton
          active={view === 'list'}
          onClick={() => onViewChange('list')}
          label="Show list view"
        >
          <img
            src={publicAsset('List.png')}
            alt=""
            className="size-7 object-contain"
            aria-hidden="true"
          />
        </ViewButton>
        <ViewButton
          active={view === 'grid'}
          onClick={() => onViewChange('grid')}
          label="Show card view"
        >
          <img
            src={publicAsset(view === 'grid' ? 'Grid selected.png' : 'Grid.png')}
            alt=""
            className="size-7 object-contain"
            aria-hidden="true"
          />
        </ViewButton>
      </div>

      <div
        className={cn(
          'mt-4',
          view === 'grid' && products.length > 0 && 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
        )}
      >
        {products.length === 0 ? (
          <p className="m-0 py-8 text-center text-sm font-medium text-text-secondary">
            {emptyMessage}
          </p>
        ) : (
          products.map((product) => (
            <KitMakerProductCard
              key={product.id}
              product={product}
              view={view}
              onAdd={onAdd}
            />
          ))
        )}
      </div>
    </section>
  )
}
