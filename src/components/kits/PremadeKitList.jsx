import PremadeKitCard from './PremadeKitCard'
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

export default function PremadeKitList({
  kits,
  view,
  onViewChange,
  onAdd,
  emptyMessage = 'No kits match your filters.',
}) {
  return (
    <section className="rounded-[20px] bg-background-secondary px-7 py-7">
      <div className="flex justify-end gap-2">
        <ViewButton
          active={view === 'list'}
          onClick={() => onViewChange('list')}
          label="Show list view"
        >
          =
        </ViewButton>
        <ViewButton
          active={view === 'grid'}
          onClick={() => onViewChange('grid')}
          label="Show card view"
        >
          #
        </ViewButton>
      </div>

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
