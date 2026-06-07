import { cn } from '../../lib/cn'

function publicAsset(path) {
  return `${import.meta.env.BASE_URL}${path}`
}

function ViewButton({ active, icon, selectedIcon, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex size-10 cursor-pointer items-center justify-center rounded-md border border-text bg-transparent',
        active && 'bg-text',
      )}
      aria-label={label}
      aria-pressed={active}
    >
      <img
        src={publicAsset(active ? selectedIcon : icon)}
        alt=""
        className="size-7 object-contain"
        aria-hidden="true"
      />
    </button>
  )
}

export default function ViewModeToggle({ view, onViewChange }) {
  return (
    <div className="flex justify-end gap-2">
      <ViewButton
        active={view === 'list'}
        icon="List.png"
        selectedIcon="List selected.png"
        onClick={() => onViewChange('list')}
        label="Show list view"
      />
      <ViewButton
        active={view === 'grid'}
        icon="Grid.png"
        selectedIcon="Grid selected.png"
        onClick={() => onViewChange('grid')}
        label="Show card view"
      />
    </div>
  )
}
