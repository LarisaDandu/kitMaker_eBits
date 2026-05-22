import { cn } from '../../lib/cn'

export default function SortSelect({
  label = 'Sort by',
  value,
  options,
  onChange,
  className,
}) {
  return (
    <label className={cn('flex items-center gap-2 text-sm font-medium text-text', className)}>
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 rounded-full border-2 border-accent-2 bg-background px-4 py-2 font-body text-sm text-text outline-none focus:outline-2 focus:outline-offset-2 focus:outline-accent-2-lighter"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
