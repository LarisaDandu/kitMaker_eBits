import KitMakerProductCard from './KitMakerProductCard'
import ViewModeToggle from './ViewModeToggle'
import { cn } from '../../lib/cn'

export default function KitMakerProductList({
  products,
  view,
  onViewChange,
  onAdd,
  emptyMessage = 'No components match your filters.',
}) {
  return (
    <section className="rounded-[20px] bg-background-secondary px-7 py-7">
      <ViewModeToggle view={view} onViewChange={onViewChange} />

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
