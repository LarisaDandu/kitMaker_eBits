import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import AdminHeader from '../../components/admin/AdminHeader'
import SearchFilterPanel from '../../components/admin/SearchFilterPanel'
import KitOverviewPriceCard from '../../components/kits/KitOverviewPriceCard'
import KitProgress from '../../components/kits/KitProgress'
import PreviousOrders from '../../components/kits/PreviousOrders'
import ProductList from '../../components/products/ProductList'
import UniversityInfo from '../../components/universities/UniversityInfo'
import Button from '../../components/ui/Button'
import { useUniversities } from '../../hooks/useUniversities'
import {
  PRODUCT_FILTER_OPTIONS,
  PRODUCT_STATUS,
  getProductsByUniversity,
} from '../../data/products'
import { cn } from '../../lib/cn'

function filterProducts(products, searchQuery, statusFilter) {
  const query = searchQuery.trim().toLowerCase()

  return products.filter((product) => {
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
}

export default function UniversityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getUniversity, removeUniversity, advanceKitOrder } = useUniversities()
  const university = getUniversity(id)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState(PRODUCT_STATUS.ALL)

  const allProducts = useMemo(
    () => (university ? getProductsByUniversity(university.id) : []),
    [university],
  )

  const filteredProducts = useMemo(
    () => filterProducts(allProducts, searchQuery, activeFilter),
    [allProducts, searchQuery, activeFilter],
  )

  if (!university) {
    navigate('/admin', { replace: true })
    return null
  }

  const { kit } = university
  const dashboardTitle = `${university.name} - Dashboard`

  function handleDelete() {
    if (window.confirm(`Delete ${university.name}? This cannot be undone.`)) {
      removeUniversity(university.id)
      navigate('/admin')
    }
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
          onLogout={() => window.alert('Logged out (demo)')}
        />

        <Link
          to="/admin"
          className={cn(
            '-mt-2 inline-flex w-fit font-body text-sm font-medium text-text-secondary no-underline hover:text-text hover:underline',
          )}
        >
          ← Back to clients overview
        </Link>

        <UniversityInfo
          university={university}
          onModify={() => navigate(`/admin/customers/${id}/edit`)}
          onDelete={handleDelete}
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
          searchPlaceholder="Search products..."
          filters={PRODUCT_FILTER_OPTIONS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          filterAriaLabel="Filter products by status"
          ariaLabel="Search and filter products"
          action={
            <Button onClick={() => window.alert('Add more products (demo)')}>
              + Add more
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
    </div>
  )
}
