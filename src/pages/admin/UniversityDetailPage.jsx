import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import AdminHeader from '../../components/admin/AdminHeader'
import SearchFilterPanel from '../../components/admin/SearchFilterPanel'
import KitOverviewPriceCard from '../../components/kits/KitOverviewPriceCard'
import KitProgress from '../../components/kits/KitProgress'
import PreviousOrders from '../../components/kits/PreviousOrders'
import ProductList from '../../components/products/ProductList'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import UniversityInfo from '../../components/universities/UniversityInfo'
import {
  PRODUCT_FILTER_OPTIONS,
  PRODUCT_STATUS,
  getProductsByUniversity,
} from '../../data/products'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useUniversities } from '../../hooks/useUniversities'
import { cn } from '../../lib/cn'
import { formatLastUpdated } from '../../lib/time'

const PRODUCT_SORT_OPTIONS = [
  { id: 'quoteRow', label: 'Quote row' },
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status' },
]

function filterProducts(products, searchQuery, statusFilter, sortValue) {
  const query = searchQuery.trim().toLowerCase()

  const filtered = products.filter((product) => {
    const matchesStatus =
      statusFilter === PRODUCT_STATUS.ALL || product.status === statusFilter
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.subtitle.toLowerCase().includes(query) ||
      product.variant.toLowerCase().includes(query) ||
      String(product.quoteRow).includes(query)

    return matchesStatus && matchesSearch
  })

  return [...filtered].sort((a, b) => {
    if (sortValue === 'name') return a.name.localeCompare(b.name)
    if (sortValue === 'status') return a.status.localeCompare(b.status)
    return Number(a.quoteRow ?? 0) - Number(b.quoteRow ?? 0)
  })
}

export default function UniversityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getUniversity, softDeleteUniversity, advanceKitOrder } = useUniversities()
  const university = getUniversity(id)

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebouncedValue(searchQuery)
  const [activeFilter, setActiveFilter] = useState(PRODUCT_STATUS.ALL)
  const [sortValue, setSortValue] = useState('quoteRow')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const allProducts = useMemo(
    () => (university ? getProductsByUniversity(university.id) : []),
    [university],
  )

  const filteredProducts = useMemo(
    () =>
      filterProducts(
        allProducts,
        debouncedSearchQuery,
        activeFilter,
        sortValue,
      ),
    [allProducts, debouncedSearchQuery, activeFilter, sortValue],
  )

  if (!university) {
    navigate('/admin', { replace: true })
    return null
  }

  const { kit } = university
  const dashboardTitle = `${university.name} - Dashboard`

  function handleDelete() {
    softDeleteUniversity(university.id)
    navigate('/admin', {
      state: {
        deletedUniversity: {
          id: university.id,
          name: university.name,
        },
      },
    })
  }

  return (
    <div className={cn('min-h-svh bg-background font-body text-left text-text')}>
      <div
        className={cn(
          'mx-auto box-border flex max-w-[1200px] flex-col gap-5 px-6 py-8 pb-12',
          'max-sm:px-4 max-sm:py-5 max-sm:pb-8',
        )}
      >
        <AdminHeader
          title={dashboardTitle}
          onLogout={() => navigate('/')}
        />

        <p className="m-0 -mt-3 text-sm font-medium text-text-secondary">
          Last updated: {formatLastUpdated(university.lastUpdatedAt)}
        </p>

        <Link
          to="/admin"
          className={cn(
            '-mt-2 inline-flex w-fit font-body text-sm font-medium text-text-secondary no-underline hover:text-text hover:underline',
          )}
        >
          &lt; Back to clients overview
        </Link>

        <UniversityInfo
          university={university}
          onModify={() => navigate(`/admin/customers/${id}/edit`)}
          onDelete={() => setShowDeleteDialog(true)}
        />

        <KitOverviewPriceCard
          university={university}
          onExportCsv={() => window.alert('Export CSV (demo)')}
          onAdvanceOrder={() => advanceKitOrder(university.id)}
        />

        <KitProgress progressStep={kit.progressStep ?? 0} />

        <SearchFilterPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by product name, variant, quote row..."
          filters={PRODUCT_FILTER_OPTIONS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          filterAriaLabel="Filter products by status"
          ariaLabel="Search and filter products"
          isSearching={searchQuery !== debouncedSearchQuery}
          sortValue={sortValue}
          sortOptions={PRODUCT_SORT_OPTIONS}
          onSortChange={setSortValue}
          action={
            <Button onClick={() => window.alert('Add more products (demo)')}>
              <PlusIcon />
              Add more
            </Button>
          }
        />

        <ProductList
          products={filteredProducts}
          onChangeProduct={() => window.alert('Change product (demo)')}
        />

        <PreviousOrders
          orders={university.previousOrders ?? []}
          onExportCsv={() => window.alert('Export previous order CSV (demo)')}
        />
      </div>

      {showDeleteDialog ? (
        <ConfirmDialog
          title={`Delete ${university.name}?`}
          description="This customer will be hidden from the client list. You can undo the deletion from the clients overview."
          confirmLabel="Delete customer"
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
