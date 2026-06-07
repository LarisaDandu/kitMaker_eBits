import { useState } from 'react'
import QuantityStepper from './QuantityStepper'
import Button from '../ui/Button'
import { formatKr } from '../../lib/format'
import { downloadCsv } from '../../lib/csvExport'

function CartIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h2l2 10h9l2-7H7M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function KitMakerCart({
  items,
  onClear,
  onSubmit,
  onUpdateItem,
  onRemoveItem,
  initialKitCount = 1,
}) {
  const [kitName, setKitName] = useState('')
  const [notes, setNotes] = useState('')
  const [kitCount, setKitCount] = useState(initialKitCount)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity * kitCount, 0)

  return (
    <aside className="self-start rounded-[20px] border border-accent-2 bg-background px-6 py-7 shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-2xl text-text">
          <CartIcon />
          <h2 className="m-0 text-2xl font-normal">Cart</h2>
        </div>
        <Button type="button" variant="ghost" onClick={onClear} className="min-h-0 px-0 py-0 text-base">
          clear cart
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="m-0 mb-3 text-base font-normal text-text">Personalize your kit</h3>
        <input
          value={kitName}
          onChange={(event) => setKitName(event.target.value)}
          placeholder="Kit Name (e.g., Class of 2026 Kit)"
          className="w-full rounded-lg border border-accent-2 bg-transparent px-3 py-2 font-body text-sm text-text outline-none"
        />
        <p className="m-0 mt-7 text-base text-text">
          Let us know if there are any special requests or notes.
        </p>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add notes"
          className="mt-2 min-h-28 w-full resize-y rounded-lg border border-accent-2 bg-transparent px-3 py-2 font-body text-sm text-text outline-none"
        />
      </div>

      <div className="mt-7 border-y border-text-secondary py-6">
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-text">Number of kits:</span>
          <QuantityStepper value={kitCount} onChange={setKitCount} />
        </div>
      </div>

      <div className="border-b border-text-secondary py-6">
        <h3 className="m-0 text-base font-bold text-text">Components per kit</h3>
        {items.length === 0 ? (
          <p className="m-0 mt-4 text-base text-text">No items in your cart yet</p>
        ) : (
          <ul className="m-0 mt-4 flex max-h-[360px] list-none flex-col gap-3 overflow-y-auto pr-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl bg-background-secondary px-3 py-3 text-sm text-text"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">{item.name}</span>
                  <Button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    variant="ghost"
                    size="icon"
                    className="size-6 text-sm font-bold text-accent-2"
                    aria-label={`Remove ${item.name}`}
                  >
                    ×
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(quantity) => onUpdateItem(item.id, quantity)}
                    className="bg-background"
                  />
                  <span>{formatKr(item.price * item.quantity)}</span>
                </div>
                {item.variant || item.supplierLink ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-secondary">
                    {item.variant ? <span>{item.variant}</span> : null}
                    {item.sourceCurrency === 'USD' && item.sourcePrice != null ? (
                      <span>${item.sourcePrice.toFixed(2)} × 6.5</span>
                    ) : null}
                    {item.supplierLink ? (
                      <a
                        href={item.supplierLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-accent-2 underline-offset-2 hover:underline"
                      >
                        Supplier link
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="m-0 mt-7 text-xl font-bold text-text">
        Estimated Cost: {items.length ? formatKr(total) : '--- kr'}
      </p>
      <Button
        type="button"
        onClick={() =>
          downloadCsv(
            `${kitName || 'kit-cart'}.csv`,
            items.map((item) => ({
              kitName: kitName || 'Untitled kit',
              kitCount,
              itemName: item.name,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity * kitCount,
            })),
          )
        }
        variant="outline"
        size="md"
        rounded="xl"
        className="mt-4"
      >
        Export CSV
      </Button>
      <Button
        type="button"
        onClick={() => onSubmit({ kitName, notes, kitCount, items })}
        variant="accent"
        size="lg"
        rounded="xl"
        fullWidth
        className="mt-4"
      >
        Submit order
      </Button>
    </aside>
  )
}
