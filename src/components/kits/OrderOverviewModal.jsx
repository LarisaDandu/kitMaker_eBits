import Button from '../ui/Button'

import { formatKr } from '../../lib/format'

export default function OrderOverviewModal({ order, onCancel, onConfirm }) {
  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity * order.kitCount,
    0,
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/60 px-4 py-8">
      <section className="max-h-[90vh] w-full max-w-[620px] overflow-auto rounded-[20px] bg-background-secondary px-7 py-7 shadow-xl">
        <h2 className="m-0 text-2xl font-bold text-text">Review your order</h2>
        <p className="m-0 mt-3 text-base text-text">
          Check the kit details before submitting the order.
        </p>

        <div className="mt-6 rounded-xl bg-background px-5 py-4">
          <p className="m-0 font-bold text-text">
            {order.kitName || 'Untitled kit'}
          </p>
          <p className="m-0 mt-2 text-sm text-text">Number of kits: {order.kitCount}</p>
          {order.notes ? (
            <p className="m-0 mt-3 text-sm text-text">{order.notes}</p>
          ) : null}
        </div>

        <div className="mt-5">
          <h3 className="m-0 text-base font-bold text-text">Components per kit</h3>
          {order.items.length === 0 ? (
            <p className="m-0 mt-3 text-sm text-text">No items selected.</p>
          ) : (
            <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-4 rounded-xl bg-background px-4 py-3 text-sm text-text"
                >
                  <span>{item.name}</span>
                  <span>{item.quantity} pcs</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="m-0 mt-6 text-xl font-bold text-text">
          Estimated Cost: {order.items.length ? formatKr(total) : '--- kr'}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={onConfirm}
            variant="accent"
            size="md"
            rounded="xl"
          >
            Confirm order
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outlineStrong"
            size="md"
            rounded="xl"
          >
            Cancel
          </Button>
        </div>
      </section>
    </div>
  )
}
