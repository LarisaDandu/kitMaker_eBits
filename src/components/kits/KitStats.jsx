import { cn } from '../../lib/cn'
import HelpTooltip from '../ui/HelpTooltip'

export default function KitStats({ stats }) {
  const { checked, totalComponents, approved, rejected, totalKits } = stats

  const required = stats.required ?? rejected ?? 0

  const items = [
    {
      label: 'Components checked',
      value: `${checked}/${totalComponents}`,
      help: 'Components reviewed so far.',
    },
    {
      label: 'Components approved',
      value: `${approved}/${totalComponents}`,
      help: 'Components accepted for the kit.',
    },
    {
      label: 'Components required',
      value: `${required}/${totalComponents}`,
      help: 'Components needing changes or follow-up.',
    },
    {
      label: 'Total number of kits',
      value: String(totalKits),
      help: 'Complete kits requested by the school.',
    },
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
          <span className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            {item.label}
            <HelpTooltip label={`${item.label} help`}>{item.help}</HelpTooltip>
          </span>
          <span className="text-base font-semibold text-text">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
