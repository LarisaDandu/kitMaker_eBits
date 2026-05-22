import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import KitBuilderRequestForm from '../components/kits/KitBuilderRequestForm'
import KitMakerCart from '../components/kits/KitMakerCart'
import KitMakerCategories from '../components/kits/KitMakerCategories'
import KitMakerProductList from '../components/kits/KitMakerProductList'
import OrderOverviewModal from '../components/kits/OrderOverviewModal'
import ProductImportPanel from '../components/products/ProductImportPanel'
import { kitMakerProducts } from '../data/kitMakerProducts'
import { useUniversityByLoginCode } from '../hooks/useUniversityByLoginCode'

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

export default function MakeYourOwnKitPage() {
  const { loginCode } = useParams()
  const [activeCategory, setActiveCategory] = useState('Microcontrollers')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('list')
  const [cartItems, setCartItems] = useState([])
  const [importSummary, setImportSummary] = useState(null)
  const [pendingOrder, setPendingOrder] = useState(null)

  const university = useUniversityByLoginCode(loginCode)

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return kitMakerProducts.filter(
      (product) =>
        product.category === activeCategory &&
        (!normalizedQuery ||
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.subtitle.toLowerCase().includes(normalizedQuery)),
    )
  }, [activeCategory, query])

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
            <div className="flex items-center gap-3 text-base lg:hidden">
              <span>{university.name}</span>
              <UserIcon />
            </div>
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
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl border border-accent-2 bg-transparent px-4 py-3 font-body text-base text-text outline-none"
            />
          </label>

          <div className="mt-16">
            <KitMakerProductList
              products={filteredProducts}
              view={view}
              onViewChange={setView}
              onAdd={handleAdd}
            />
          </div>

          <div className="mt-16">
            <KitBuilderRequestForm
              title="Can't find what you are looking for?"
              description="Write your desired components down below"
              submitLabel="Add to cart"
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
          <div className="mb-10 hidden items-center justify-end gap-3 text-base lg:flex">
            <span>{university.name}</span>
            <UserIcon />
          </div>
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
