import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import TeacherAccountMenu from '../components/customer/TeacherAccountMenu'
import KitPrice from '../components/kits/KitPrice'
import OrderOverviewModal from '../components/kits/OrderOverviewModal'
import PreviousOrderProductList from '../components/kits/PreviousOrderProductList'
import QuantityStepper from '../components/kits/QuantityStepper'
import { kitMakerProducts } from '../data/kitMakerProducts'
import { useUniversityByLoginCode } from '../hooks/useUniversityByLoginCode'
import { useUniversities } from '../hooks/useUniversities'

export default function ReorderPage() {
  const { loginCode, orderId } = useParams()
  const navigate = useNavigate()
  const [kitName, setKitName] = useState('')
  const [quantity, setQuantity] = useState(null)
  const [notes, setNotes] = useState('')
  const [pendingOrder, setPendingOrder] = useState(null)

  const university = useUniversityByLoginCode(loginCode)
  const { createActiveOrder } = useUniversities()
  const order = university?.previousOrders?.find((item) => item.id === orderId)

  if (!university || !order) {
    return (
      <main className="min-h-svh bg-background px-8 py-10 font-body text-text">
        <h1 className="m-0 font-headline text-4xl uppercase">Order not found</h1>
      </main>
    )
  }

  const kitQuantity = quantity ?? order.stats?.totalKits ?? university.kit.stats.totalKits
  const baseItem = {
    id: order.id,
    name: kitName || order.name,
    price: order.pricing?.pricePerKit ?? university.kit.pricing.pricePerKit,
    quantity: kitQuantity,
  }

  return (
    <main className="min-h-svh bg-background font-body text-text">
      <div className="box-border flex flex-col gap-8 px-8 py-10 max-sm:px-4">
        <header className="flex items-center justify-between gap-4">
          <h1 className="m-0 font-headline text-4xl uppercase">Reorder</h1>
          <TeacherAccountMenu university={university} />
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="rounded-[20px] bg-background-secondary px-8 py-8 max-sm:px-5">
            <h2 className="m-0 text-4xl font-normal text-text">{order.name}</h2>
            <label className="mt-9 block text-2xl text-text">
              Rename kit
              <div className="mt-5 flex flex-wrap gap-4">
                <input
                  value={kitName}
                  onChange={(event) => setKitName(event.target.value)}
                  placeholder="Type new name here..."
                  className="min-w-[300px] rounded-xl border border-accent-2 bg-transparent px-4 py-3 font-body text-sm text-text outline-none"
                />
                <button type="button" className="rounded-xl border-none bg-text-secondary px-12 py-3 text-accent-1">
                  Done
                </button>
              </div>
            </label>
            <div className="mt-8">
              <p className="m-0 text-2xl text-text">Select a new quantity of kits if necessary.</p>
              <div className="mt-5 flex items-center gap-4">
                <span>pcs</span>
                <QuantityStepper value={kitQuantity} onChange={setQuantity} />
                <button type="button" className="rounded-xl border-none bg-text-secondary px-12 py-3 text-accent-1">
                  Done
                </button>
              </div>
            </div>
            <div className="mt-8 max-w-[200px] rounded-xl border border-accent-1 bg-background-third px-5 py-4">
              <span className="block text-base text-text">Total number of kits</span>
              <span className="mt-12 block text-4xl text-text">{kitQuantity}</span>
            </div>
            <button type="button" className="mt-8 rounded-xl border border-accent-2 bg-transparent px-7 py-3 text-text">
              Export CSV
            </button>
          </section>

          <div className="flex flex-col gap-6">
            <KitPrice pricing={order.pricing ?? university.kit.pricing} />
            <section className="rounded-[20px] bg-background-secondary px-6 py-6">
              <p className="m-0 text-xl text-text">Let us know if there are any special requests or notes.</p>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add notes"
                className="mt-4 min-h-28 w-full rounded-xl border border-accent-2 bg-transparent px-3 py-3 font-body text-sm text-text outline-none"
              />
              <button
                type="button"
                onClick={() => setPendingOrder({ kitName: kitName || order.name, notes, kitCount: kitQuantity, items: [baseItem] })}
                className="mt-8 rounded-xl border-none bg-text px-10 py-3 font-body text-2xl font-medium text-accent-1"
              >
                Submit order
              </button>
            </section>
          </div>
        </div>

        <PreviousOrderProductList
          products={kitMakerProducts}
          showModify
          onModify={() => navigate(`/orders/${university.loginCode}/previous/${order.id}/add-components`)}
        />
      </div>

      {pendingOrder ? (
        <OrderOverviewModal
          order={pendingOrder}
          onCancel={() => setPendingOrder(null)}
          onConfirm={() => {
            createActiveOrder(university.id, pendingOrder)
            setPendingOrder(null)
            navigate(`/orders/${university.loginCode}`)
          }}
        />
      ) : null}
    </main>
  )
}
