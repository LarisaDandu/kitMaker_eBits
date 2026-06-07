import { cn } from '../../lib/cn'

const categories = [
  { label: 'Microcontrollers', image: 'Microcontrollers.png' },
  { label: 'Resistors', image: 'Resistor.png' },
  { label: 'Capacitors', image: 'Capacitor.png' },
  { label: 'Sensors', image: 'Sensors.png' },
  { label: 'Connectors', image: 'Connectors.png' },
  { label: 'Motors', image: 'Motors.png' },
  { label: 'LEDs', image: 'LED.png' },
  { label: 'Transistors', image: 'Transistor.png' },
  { label: 'Other', image: 'Other.png' },
]

function publicAsset(path) {
  return `${import.meta.env.BASE_URL}${path}`
}

export default function KitMakerCategories({ active, onChange }) {
  return (
    <section>
      <h2 className="m-0 mb-4 text-2xl font-normal text-text">Categories</h2>
      <div className="grid gap-5 rounded-[20px] bg-background-secondary p-6 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <button
            key={category.label}
            type="button"
            onClick={() => onChange(category.label)}
            className={cn(
              'flex min-h-[74px] cursor-pointer items-center gap-4 rounded-xl border px-8 py-4 text-left font-body text-xl font-normal text-text shadow-md transition-opacity hover:opacity-90',
              active === category.label
                ? 'border-accent-2 bg-background-secondary'
                : 'border-transparent bg-background shadow-background-third',
            )}
          >
            <img
              src={publicAsset(`Categories/${category.image}`)}
              alt=""
              className="size-9 object-contain"
              aria-hidden="true"
            />
            {category.label}
          </button>
        ))}
      </div>
    </section>
  )
}
