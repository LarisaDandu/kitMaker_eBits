import { cn } from '../../lib/cn'

const categories = [
  'Microcontrollers',
  'Resistors',
  'Capacitors',
  'Sensors',
  'Connectors',
  'Motors',
  'LEDs',
  'Transistors',
  'Other',
]

function CategoryIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function KitMakerCategories({ active, onChange }) {
  return (
    <section>
      <h2 className="m-0 mb-4 text-2xl font-normal text-text">Categories</h2>
      <div className="grid gap-5 rounded-[20px] bg-background-secondary p-6 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-xl border px-6 py-4 text-left font-body text-base font-medium text-text shadow-md transition-opacity hover:opacity-90',
              active === category
                ? 'border-accent-2 bg-background-secondary'
                : 'border-transparent bg-background shadow-background-third',
            )}
          >
            <CategoryIcon />
            {category}
          </button>
        ))}
      </div>
    </section>
  )
}
