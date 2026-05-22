import { cn } from '../../lib/cn'

export default function FilterPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border-2 border-text px-4 py-2 font-body text-sm font-medium whitespace-nowrap transition-colors',
        active ? 'bg-text text-background' : 'bg-transparent text-text',
      )}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
