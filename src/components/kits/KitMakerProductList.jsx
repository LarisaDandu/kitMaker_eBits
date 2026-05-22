import KitMakerProductCard from './KitMakerProductCard'
import { cn } from '../../lib/cn'

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

export default function KitMakerProductList({ products, view, onViewChange, onAdd }) {
  return (
    <section className="rounded-[20px] bg-background-secondary px-7 py-7">
      <div className="flex justify-end gap-2">
        <ViewButton active={view === 'list'} onClick={() => onViewChange('list')}>
          ☰
        </ViewButton>
        <ViewButton active={view === 'grid'} onClick={() => onViewChange('grid')}>
          ▦
        </ViewButton>
      </div>

      <div className={cn('mt-4', view === 'grid' && 'grid gap-6 md:grid-cols-2 xl:grid-cols-3')}>
        {products.map((product) => (
          <KitMakerProductCard
            key={product.id}
            product={product}
            view={view}
            onAdd={onAdd}
          />
        ))}
      </div>
    </section>
  )
}
