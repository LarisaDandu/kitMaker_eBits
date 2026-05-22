import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import SearchFilterPanel from '../components/admin/SearchFilterPanel'
import TeacherAccountMenu from '../components/customer/TeacherAccountMenu'
import CustomerOrderCard from '../components/kits/CustomerOrderCard'
import CustomerReviewProgress from '../components/kits/CustomerReviewProgress'
import KitPrice from '../components/kits/KitPrice'
import KitProgress from '../components/kits/KitProgress'
import CustomerProductCard from '../components/products/CustomerProductCard'
import ProductImportPanel from '../components/products/ProductImportPanel'
import Button from '../components/ui/Button'
import {
  PRODUCT_STATUS,
  getProductsByUniversity,
} from '../data/products'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { UNIVERSITY_STATUS } from '../data/universities'
import { useUniversityByLoginCode } from '../hooks/useUniversityByLoginCode'
import { cn } from '../lib/cn'
import { formatLastUpdated } from '../lib/time'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'awaiting', label: 'Awaiting approval' },
  { id: PRODUCT_STATUS.REJECTED, label: 'Rejected' },
  { id: PRODUCT_STATUS.APPROVED, label: 'Approved' },
  { id: PRODUCT_STATUS.CHANGES, label: 'Changes' },
]

const SORT_OPTIONS = [
  { id: 'quoteRow', label: 'Quote row' },
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Review status' },
]

function getInitialReviews(products) {
  return products.reduce((reviews, product) => {
    if (product.customerReply) {
      reviews[product.id] = product.customerReply
    }
    return reviews
  }, {})
}

function getReviewCounts(reviews) {
  return Object.values(reviews).reduce(
    (counts, review) => {
      if (review?.status === PRODUCT_STATUS.APPROVED) counts.approved += 1
      if (review?.status === PRODUCT_STATUS.REJECTED) counts.rejected += 1
      if (review?.status === PRODUCT_STATUS.CHANGES) counts.changes += 1
      return counts
    },
    { approved: 0, rejected: 0, changes: 0 },
  )
}

function revokeImportedImageUrls(importSummary) {
  for (const product of importSummary?.products ?? []) {
    if (product.imageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(product.imageUrl)
    }
  }
}

export default function CustomerKitDashboardPage() {
  const { loginCode } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebouncedValue(searchQuery)
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortValue, setSortValue] = useState('quoteRow')
  const [importSummary, setImportSummary] = useState(null)
  const university = useUniversityByLoginCode(loginCode)

  const demoProducts = useMemo(
    () => (university ? getProductsByUniversity(university.id) : []),
    [university],
  )
  const products = importSummary?.products ?? demoProducts
  const [reviews, setReviews] = useState(() => getInitialReviews(demoProducts))

  const filteredProducts = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase()

    const filtered = products.filter((product) => {
      const review = reviews[product.id]
      const matchesStatus =
        activeFilter === 'all' ||
        (activeFilter === 'awaiting' && !review?.status) ||
        review?.status === activeFilter
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.subtitle?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.variant?.toLowerCase().includes(query)

      return matchesStatus && matchesSearch
    })

    return [...filtered].sort((a, b) => {
      if (sortValue === 'name') return a.name.localeCompare(b.name)
      if (sortValue === 'status') {
        const aStatus = reviews[a.id]?.status ?? a.status
        const bStatus = reviews[b.id]?.status ?? b.status
        return aStatus.localeCompare(bStatus)
      }
      return Number(a.quoteRow ?? 0) - Number(b.quoteRow ?? 0)
    })
  }, [activeFilter, products, reviews, debouncedSearchQuery, sortValue])

  if (!university) {
    return (
      <main className="min-h-svh bg-background px-8 py-10 font-body text-text">
        <h1 className="m-0 font-headline text-4xl uppercase">Order not found</h1>
        <p className="mt-4 max-w-[620px] text-xl">
          Please check the login code and try again.
        </p>
      </main>
    )
  }

  const counts = getReviewCounts(reviews)
  const processed = counts.approved + counts.rejected + counts.changes
  const reviewTotal = products.length || university.kit.stats.totalComponents

  function handleApplyReview(productId, review) {
    setReviews((current) => {
      const next = { ...current }
      if (review) next[productId] = review
      else delete next[productId]
      return next
    })
  }

  function handleSubmitReview() {
    window.alert(`Review submitted (${processed}/${reviewTotal} processed)`)
  }

  function handleImport(nextImportSummary) {
    revokeImportedImageUrls(importSummary)
    setImportSummary(nextImportSummary)
    setReviews(getInitialReviews(nextImportSummary.products))
    setSearchQuery('')
    setActiveFilter('all')
  }

  function handleResetImport() {
    revokeImportedImageUrls(importSummary)
    setImportSummary(null)
    setReviews(getInitialReviews(demoProducts))
    setSearchQuery('')
    setActiveFilter('all')
  }

  return (
    <main className="min-h-svh bg-background font-body text-text">
      <div className="box-border mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 pb-12 max-sm:px-4">
        <header className="flex items-center justify-between gap-4">
          <h1 className="m-0 font-headline text-3xl uppercase leading-tight">
            Order Dashboard
          </h1>
          <TeacherAccountMenu
            university={university}
            className="max-sm:hidden"
          />
        </header>
        <p className="m-0 -mt-3 text-sm font-medium text-text-secondary">
          Last updated: {formatLastUpdated(university.lastUpdatedAt)}
        </p>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <CustomerOrderCard
            order={university.kit}
            status={UNIVERSITY_STATUS.ACTIVE_ORDER}
            isActive
            onExportCsv={() => window.alert('Export CSV (demo)')}
          />

          <div className="flex flex-col gap-5">
            <KitPrice pricing={university.kit.pricing} />
            <CustomerReviewProgress
              total={reviewTotal}
              approved={counts.approved}
              rejected={counts.rejected}
              changes={counts.changes}
              onSubmit={handleSubmitReview}
            />
          </div>
        </div>

        <KitProgress progressStep={university.kit.progressStep ?? 0} />

        <ProductImportPanel
          importSummary={importSummary}
          onImport={handleImport}
          onReset={handleResetImport}
        />

        <section className="rounded-[20px] bg-background-secondary px-6 py-6 max-sm:px-4">
          <SearchFilterPanel
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by product name, SKU, variant, quote row..."
            filters={FILTERS}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            filterAriaLabel="Filter products by review status"
            ariaLabel="Search and filter products"
            isSearching={searchQuery !== debouncedSearchQuery}
            sortValue={sortValue}
            sortOptions={SORT_OPTIONS}
            onSortChange={setSortValue}
            className="px-4 py-4"
            action={
              <Button
                type="button"
                onClick={() => window.alert('Add more products (demo)')}
                variant="accent"
              >
                <PlusIcon />
                Add more
              </Button>
            }
          />

          <div
            className={cn(
              'mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3',
              filteredProducts.length === 0 && 'block',
            )}
          >
            {filteredProducts.length === 0 ? (
              <p className="m-0 py-8 text-center text-sm text-text-secondary">
                No products match your search or filter.
              </p>
            ) : (
              filteredProducts.map((product) => (
                <CustomerProductCard
                  key={product.id}
                  product={product}
                  review={reviews[product.id]}
                  onApply={handleApplyReview}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function PlusIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
