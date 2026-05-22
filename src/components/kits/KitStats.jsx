import { cn } from '../../lib/cn'

export default function KitStats({ stats }) {
  const { checked, totalComponents, approved, rejected, totalKits } = stats

  const required = stats.required ?? rejected ?? 0

  const items = [
    { label: 'Components checked', value: `${checked}/${totalComponents}` },
    { label: 'Components approved', value: `${approved}/${totalComponents}` },
    { label: 'Components required', value: `${required}/${totalComponents}` },
    { label: 'Total number of kits', value: String(totalKits) },
  ]

  return (
    <div
      className={cn(
        'grid gap-3',
        'grid-cols-[repeat(auto-fit,minmax(160px,1fr))]',
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn('flex flex-col gap-1 rounded-xl bg-background-third px-4 py-3')}
        >
          <span className="text-sm font-medium text-text-secondary">
            {item.label}
          </span>
          <span className="text-base font-semibold text-text">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
