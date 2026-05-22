import { cn } from '../../lib/cn'

export default function QuantityStepper({ value, onChange, className }) {
  return (
    <div
      className={cn(
        'inline-flex min-h-11 items-center overflow-hidden rounded-xl border border-accent-2 font-body text-text',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="inline-flex min-h-11 cursor-pointer items-center justify-center border-none bg-transparent px-4 py-2 text-lg font-bold text-text"
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="min-w-8 text-center text-lg font-bold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="inline-flex min-h-11 cursor-pointer items-center justify-center border-none bg-transparent px-4 py-2 text-lg font-bold text-text"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
