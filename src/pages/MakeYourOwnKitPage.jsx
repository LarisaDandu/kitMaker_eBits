import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import FilterPill from '../components/admin/FilterPill'
import TeacherBackButton from '../components/customer/TeacherBackButton'
import TeacherAccountMenu from '../components/customer/TeacherAccountMenu'
import KitBuilderRequestForm from '../components/kits/KitBuilderRequestForm'
import KitMakerCart from '../components/kits/KitMakerCart'
import KitMakerCategories from '../components/kits/KitMakerCategories'
import KitMakerProductList from '../components/kits/KitMakerProductList'
import OrderOverviewModal from '../components/kits/OrderOverviewModal'
import ProductImportPanel from '../components/products/ProductImportPanel'
import SortSelect from '../components/ui/SortSelect'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useKitCatalogProducts } from '../hooks/useKitCatalogProducts'
import { useUniversityByLoginCode } from '../hooks/useUniversityByLoginCode'
import { useUniversities } from '../hooks/useUniversities'
import { downloadProductTemplateCsv } from '../lib/productTemplateCsv'

const SORT_OPTIONS = [
  { id: 'name', label: 'Name' },
  { id: 'priceLow', label: 'Lowest price' },
  { id: 'priceHigh', label: 'Highest price' },
]

const PRICE_FILTERS = [
  { id: 'all', label: 'All prices' },
  { id: 'under100', label: 'Under 100 kr' },
  { id: '100plus', label: '100 kr+' },
]

export default function MakeYourOwnKitPage() {
  const { loginCode } = useParams()
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('Microcontrollers')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)
  const [sortValue, setSortValue] = useState('name')
  const [priceFilter, setPriceFilter] = useState('all')
  const [view, setView] = useState('list')
  const [cartItems, setCartItems] = useState([])
  const [importSummary, setImportSummary] = useState(null)
  const [pendingOrder, setPendingOrder] = useState(null)

  const university = useUniversityByLoginCode(loginCode)
  const { createActiveOrder } = useUniversities()
  const { products: kitMakerProducts } = useKitCatalogProducts()

  const filteredProducts = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase()
    const filtered = kitMakerProducts.filter((product) => {
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'under100' && product.price < 100) ||
        (priceFilter === '100plus' && product.price >= 100)

      return (
        product.category === activeCategory &&
        matchesPrice &&
        (!normalizedQuery ||
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.subtitle.toLowerCase().includes(normalizedQuery))
      )
    })

    return [...filtered].sort((a, b) => {
      if (sortValue === 'priceLow') return a.price - b.price
      if (sortValue === 'priceHigh') return b.price - a.price
      return a.name.localeCompare(b.name)
    })
  }, [activeCategory, debouncedQuery, kitMakerProducts, priceFilter, sortValue])

  if (!university) {
    return (
      <main className="min-h-svh bg-background px-8 py-10 font-body text-text">
        <h1 className="m-0 font-headline text-4xl uppercase">Kit not found</h1>
      </main>
    )
  }

  function handleAdd(product, quantity) {
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id)
      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [...items, { ...product, quantity }]
    })
  }

  function handleUpdateItem(productId, quantity) {
    setCartItems((items) =>
      items.map((item) => (item.id === productId ? { ...item, quantity } : item)),
    )
  }

  function handleRemoveItem(productId) {
    setCartItems((items) => items.filter((item) => item.id !== productId))
  }

  function revokeImportedImageUrls(summary) {
    for (const product of summary?.products ?? []) {
      if (product.imageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(product.imageUrl)
      }
    }
  }

  function handleImport(importedSummary) {
    revokeImportedImageUrls(importSummary)
    setImportSummary(importedSummary)
    setCartItems(
      importedSummary.products.map((product) => ({
        ...product,
        id: `cart-${product.id}`,
        quantity: product.pcsPerKit,
      })),
    )
  }

  function handleResetImport() {
    revokeImportedImageUrls(importSummary)
    setImportSummary(null)
    setCartItems([])
  }

  function handleClearCart() {
    revokeImportedImageUrls(importSummary)
    setImportSummary(null)
    setCartItems([])
  }

  return (
    <main className="min-h-svh bg-background font-body text-text">
      <div className="box-border grid gap-9 px-8 py-10 lg:grid-cols-[1fr_360px] max-sm:px-4">
        <div>
          <TeacherBackButton to={`/orders/${university.loginCode}/kit-builder`} className="mb-8">
            Back
          </TeacherBackButton>
          <header className="flex items-start justify-between gap-4">
            <div>
              <h1 className="m-0 font-headline text-3xl uppercase leading-tight">
                Make your own kit
              </h1>
              <p className="m-0 mt-5 text-base text-text">
                Customize your ideal electronics kit tailored to your course
                requirements.
              </p>
            </div>
            <TeacherAccountMenu university={university} className="lg:hidden" />
          </header>

          <div className="mt-12">
            <ProductImportPanel
              title="Import kit components"
              description="Upload a CSV or Excel sheet to replace the current cart with components from the file."
              resetLabel="Clear imported cart"
              emptyLabel="No file imported"
              importSummary={importSummary}
              onImport={handleImport}
              onReset={handleResetImport}
              onDownloadTemplate={() =>
                downloadProductTemplateCsv({ filename: 'kit-components-template' })
              }
            />
          </div>

          <div className="mt-20">
            <KitMakerCategories
              active={activeCategory}
              onChange={setActiveCategory}
            />
          </div>

          <label className="mt-16 block max-w-[620px]">
            <span className="mb-4 block text-base text-text">Search by keywords</span>
            <input
              type="search"
              placeholder="Search by component name or chip variant..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl border border-accent-2 bg-transparent px-4 py-3 font-body text-base text-text outline-none"
            />
          </label>
          <p className="m-0 mt-3 min-h-5 text-sm font-medium text-text-secondary" aria-live="polite">
            {query !== debouncedQuery ? 'Searching...' : ' '}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <SortSelect
              value={sortValue}
              options={SORT_OPTIONS}
              onChange={setSortValue}
            />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by price">
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

          <div className="mt-16">
            <KitMakerProductList
              products={filteredProducts}
              view={view}
              onViewChange={setView}
              onAdd={handleAdd}
              emptyMessage="No components match your filters."
            />
          </div>

          <div className="mt-16">
            <KitBuilderRequestForm
              title="Can't find what you are looking for?"
              description="Write your desired components down below"
              submitLabel="Add to cart"
              onDownloadTemplate={() =>
                downloadProductTemplateCsv({ filename: 'custom-component-request-template' })
              }
              onSubmit={({ request }) => {
                if (!request.trim()) return
                setCartItems((items) => [
                  ...items,
                  {
                    id: `custom-${Date.now()}`,
                    name: 'Custom component request',
                    price: 0,
                    quantity: 1,
                  },
                ])
              }}
            />
          </div>
        </div>

        <div>
          <TeacherAccountMenu university={university} className="mb-10 hidden justify-end lg:flex" />
          <KitMakerCart
            key={importSummary?.fileName ?? 'manual-cart'}
            items={cartItems}
            onClear={handleClearCart}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onSubmit={setPendingOrder}
            initialKitCount={importSummary?.kitCount ?? 1}
          />
        </div>
      </div>

      {pendingOrder ? (
        <OrderOverviewModal
          order={pendingOrder}
          onCancel={() => setPendingOrder(null)}
          onConfirm={async () => {
            await createActiveOrder(university.id, pendingOrder)
            setPendingOrder(null)
            setCartItems([])
            navigate(`/orders/${university.loginCode}`)
          }}
        />
      ) : null}
    </main>
  )
}
