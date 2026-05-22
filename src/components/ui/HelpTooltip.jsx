import { useId } from 'react'

export default function HelpTooltip({ label = 'Help', children }) {
  const id = useId()

  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        className="inline-flex size-5 items-center justify-center rounded-full border border-text-secondary bg-background text-xs font-bold text-text-secondary"
      >
        ?
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-40 w-[230px] -translate-x-1/2 rounded-xl bg-text px-3 py-2 text-left text-xs font-medium leading-snug text-background opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {children}
      </span>
    </span>
  )
}
