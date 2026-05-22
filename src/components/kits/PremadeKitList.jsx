import PremadeKitCard from './PremadeKitCard'
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

export default function PremadeKitList({ kits, view, onViewChange, onAdd }) {
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

      <div className={cn('mt-5', view === 'grid' && 'grid gap-6 md:grid-cols-2 xl:grid-cols-3')}>
        {kits.map((kit) => (
          <PremadeKitCard key={kit.id} kit={kit} view={view} onAdd={onAdd} />
        ))}
      </div>
    </section>
  )
}
