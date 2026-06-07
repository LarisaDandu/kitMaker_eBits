import QuantityStepper from './QuantityStepper'
import Button from '../ui/Button'

function CartIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h2l2 10h9l2-7H7M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AddToKitCart({
  items,
  onClear,
  onUpdateItem,
  onRemoveItem,
  onSubmit,
  submitLabel = 'Add to kit',
}) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

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

      <div className="mt-8 border-b border-text-secondary pb-6">
        <h3 className="m-0 text-base font-bold text-text">Components per kit</h3>
        {items.length === 0 ? (
          <p className="m-0 mt-4 text-base text-text">No items in your cart yet</p>
        ) : (
          <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
            {items.map((item) => (
              <li key={item.id} className="rounded-xl bg-background-secondary px-3 py-3 text-sm text-text">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">{item.name}</span>
                  {!item.locked ? (
                    <Button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      variant="ghost"
                      size="icon"
                      className="size-6 text-sm font-bold text-accent-2"
                    >
                      ×
                    </Button>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  {item.locked ? (
                    <span>{item.quantity} kit</span>
                  ) : (
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(quantity) => onUpdateItem(item.id, quantity)}
                      className="bg-background"
                    />
                  )}
                  <span>
                    {item.locked ? `${item.price} kr/kit` : `${item.price * item.quantity} kr`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="m-0 mt-7 text-xl font-bold text-text">
        Estimated Cost: {items.length ? `${total} kr` : '--- kr'}
      </p>
      <Button
        type="button"
        onClick={() => onSubmit({ kitName: 'Reordered kit', notes: '', kitCount: 1, items })}
        variant="accent"
        size="lg"
        rounded="xl"
        fullWidth
        className="mt-4"
      >
        {submitLabel}
      </Button>
    </aside>
  )
}
