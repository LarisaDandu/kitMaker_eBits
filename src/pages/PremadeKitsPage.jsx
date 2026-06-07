import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import FilterPill from '../components/admin/FilterPill'
import TeacherAccountMenu from '../components/customer/TeacherAccountMenu'
import KitMakerCart from '../components/kits/KitMakerCart'
import OrderOverviewModal from '../components/kits/OrderOverviewModal'
import PremadeKitList from '../components/kits/PremadeKitList'
import SortSelect from '../components/ui/SortSelect'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useUniversityByLoginCode } from '../hooks/useUniversityByLoginCode'
import { useUniversities } from '../hooks/useUniversities'

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

const SORT_OPTIONS = [
  { id: 'name', label: 'Name' },
  { id: 'priceLow', label: 'Lowest price' },
  { id: 'priceHigh', label: 'Highest price' },
  { id: 'components', label: 'Component count' },
]

const PRICE_FILTERS = [
  { id: 'all', label: 'All prices' },
  { id: 'under200', label: 'Under 200 kr' },
  { id: '200plus', label: '200 kr+' },
]

export default function PremadeKitsPage() {
  const { loginCode } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)
  const [sortValue, setSortValue] = useState('name')
  const [priceFilter, setPriceFilter] = useState('all')
  const [view, setView] = useState('list')
  const [cartItems, setCartItems] = useState([])
  const [pendingOrder, setPendingOrder] = useState(null)

  const university = useUniversityByLoginCode(loginCode)
  const { createActiveOrder } = useUniversities()

  const filteredKits = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase()
    const filtered = kits.filter((kit) => {
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'under200' && kit.price < 200) ||
        (priceFilter === '200plus' && kit.price >= 200)

      return (
        matchesPrice &&
        (!normalizedQuery || kit.name.toLowerCase().includes(normalizedQuery))
      )
    })

    return [...filtered].sort((a, b) => {
      if (sortValue === 'priceLow') return a.price - b.price
      if (sortValue === 'priceHigh') return b.price - a.price
      if (sortValue === 'components') return b.componentCount - a.componentCount
      return a.name.localeCompare(b.name)
    })
  }, [debouncedQuery, priceFilter, sortValue])

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
              placeholder="Search by kit name..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl border border-accent-2 bg-transparent px-4 py-4 font-body text-base text-text outline-none"
            />
          </label>
          <p className="m-0 mt-3 min-h-5 text-sm font-medium text-text-secondary" aria-live="polite">
            {query !== debouncedQuery ? 'Searching...' : ' '}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <SortSelect
              value={sortValue}
              options={SORT_OPTIONS}
              onChange={setSortValue}
            />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kits by price">
              {PRICE_FILTERS.map((filter) => (
                <FilterPill
                  key={filter.id}
                  label={filter.label}
                  active={priceFilter === filter.id}
                  onClick={() => setPriceFilter(filter.id)}
                />
              ))}
            </div>
          </div>

          <div className="mt-24">
            <PremadeKitList
              kits={filteredKits}
              view={view}
              onViewChange={setView}
              onAdd={handleAdd}
              emptyMessage="No kits match your filters."
            />
          </div>
        </div>

        <div>
          <TeacherAccountMenu university={university} className="mb-12 flex justify-end" />
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
            createActiveOrder(university.id, pendingOrder)
            setPendingOrder(null)
            setCartItems([])
            navigate(`/orders/${university.loginCode}`)
          }}
        />
      ) : null}
    </main>
  )
}
