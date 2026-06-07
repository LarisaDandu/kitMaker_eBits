import PremadeKitCard from './PremadeKitCard'
import ViewModeToggle from './ViewModeToggle'
import { cn } from '../../lib/cn'

export default function PremadeKitList({
  kits,
  view,
  onViewChange,
  onAdd,
  emptyMessage = 'No kits match your filters.',
}) {
  return (
    <section className="rounded-[20px] bg-background-secondary px-7 py-7">
      <ViewModeToggle view={view} onViewChange={onViewChange} />

      <div
        className={cn(
          'mt-5',
          view === 'grid' && kits.length > 0 && 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
        )}
      >
        {kits.length === 0 ? (
          <p className="m-0 py-8 text-center text-sm font-medium text-text-secondary">
            {emptyMessage}
          </p>
        ) : (
          kits.map((kit) => (
            <PremadeKitCard key={kit.id} kit={kit} view={view} onAdd={onAdd} />
          ))
        )}
      </div>
    </section>
  )
}
