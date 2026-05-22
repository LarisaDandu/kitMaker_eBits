import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import KitMakerCart from '../components/kits/KitMakerCart'
import OrderOverviewModal from '../components/kits/OrderOverviewModal'
import PremadeKitList from '../components/kits/PremadeKitList'
import { useUniversityByLoginCode } from '../hooks/useUniversityByLoginCode'

const part = (id, name, quantity = 1) => ({
  id,
  name,
  quantity,
  price: 10,
  link: 'https://ebits.dk',
})

const kits = Array.from({ length: 5 }, (_, index) => ({
  id: `arduino-kit-${index + 1}`,
  name: 'Arduino starter kit',
  componentCount: 5,
  price: 150,
  parts: [
    part(`resistor-${index}`, '2 ohm Resistor', 2),
    part(`capacitor-a-${index}`, 'Capacitor'),
    part(`capacitor-b-${index}`, 'Capacitor'),
    part(`capacitor-c-${index}`, 'Capacitor'),
    part(`capacitor-d-${index}`, 'Capacitor'),
  ],
}))

function UserIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function PremadeKitsPage() {
  const { loginCode } = useParams()
  const [query, setQuery] = useState('')
  const [view, setView] = useState('list')
  const [cartItems, setCartItems] = useState([])
  const [pendingOrder, setPendingOrder] = useState(null)

  const university = useUniversityByLoginCode(loginCode)

  const filteredKits = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return kits.filter(
      (kit) => !normalizedQuery || kit.name.toLowerCase().includes(normalizedQuery),
    )
  }, [query])

  if (!university) {
    return (
      <main className="min-h-svh bg-background px-8 py-10 font-body text-text">
        <h1 className="m-0 font-headline text-4xl uppercase">Kits not found</h1>
      </main>
    )
  }

  function handleAdd(kit, quantity) {
    setCartItems((items) => {
      const existing = items.find((item) => item.id === kit.id)
      if (existing) {
        return items.map((item) =>
          item.id === kit.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [...items, { id: kit.id, name: kit.name, price: kit.price, quantity }]
    })
  }

  function handleUpdateItem(productId, quantity) {
    setCartItems((items) =>
      items.map((item) => (item.id === productId ? { ...item, quantity } : item)),
    )
  }

  return (
    <main className="min-h-svh bg-background font-body text-text">
      <div className="box-border grid gap-9 px-8 py-12 lg:grid-cols-[1fr_360px] max-sm:px-4">
        <div>
          <header>
            <h1 className="m-0 font-headline text-4xl uppercase leading-tight">
              Ebits Kits
            </h1>
            <p className="m-0 mt-6 max-w-[620px] text-xl leading-tight text-text">
              Explore our specialized teaching kits, developed by our engineering
              team to align with school curricula.
            </p>
          </header>

          <label className="mt-24 block max-w-[760px]">
            <span className="mb-5 block text-xl text-text">Search by keywords</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl border border-accent-2 bg-transparent px-4 py-4 font-body text-base text-text outline-none"
            />
          </label>

          <div className="mt-24 flex items-center gap-3 text-2xl text-text">
            <span>≡</span>
            <span>Filters</span>
          </div>

          <div className="mt-24">
            <PremadeKitList
              kits={filteredKits}
              view={view}
              onViewChange={setView}
              onAdd={handleAdd}
            />
          </div>
        </div>

        <div>
          <div className="mb-12 flex items-center justify-end gap-3 text-base">
            <span>{university.name}</span>
            <UserIcon />
          </div>
          <KitMakerCart
            items={cartItems}
            onClear={() => setCartItems([])}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={(id) =>
              setCartItems((items) => items.filter((item) => item.id !== id))
            }
            onSubmit={setPendingOrder}
          />
        </div>
      </div>

      {pendingOrder ? (
        <OrderOverviewModal
          order={pendingOrder}
          onCancel={() => setPendingOrder(null)}
          onConfirm={() => {
            setPendingOrder(null)
            setCartItems([])
            window.alert('Order submitted (demo)')
          }}
        />
      ) : null}
    </main>
  )
}
