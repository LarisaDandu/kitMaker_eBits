import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import AdminHeader from '../../components/admin/AdminHeader'
import SearchFilterPanel from '../../components/admin/SearchFilterPanel'
import KitOverview from '../../components/kits/KitOverview'
import KitPrice from '../../components/kits/KitPrice'
import KitProgress from '../../components/kits/KitProgress'
import PreviousOrders from '../../components/kits/PreviousOrders'
import ProductList from '../../components/products/ProductList'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import {
  PRODUCT_FILTER_OPTIONS,
  PRODUCT_STATUS,
  getProductsByOrder,
} from '../../data/products'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useUniversities } from '../../hooks/useUniversities'
import { cn } from '../../lib/cn'
import { formatLastUpdated } from '../../lib/time'
import { getActiveOrders } from '../../lib/universityUtils'

function filterProducts(products, searchQuery, statusFilter) {
  const query = searchQuery.trim().toLowerCase()

  return products
    .filter((product) => {
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
    .sort((a, b) => Number(a.quoteRow ?? 0) - Number(b.quoteRow ?? 0))
}

function ContactInfo({ university }) {
  const address = [university.addressLine1, university.addressLine2]
    .filter(Boolean)
    .join(', ')
  const rows = [
    ['Professor name', university.professorName],
    ['Email address', university.email],
    ['Phone number', university.phone],
    ['Address', address],
    ['EAN number', university.ean],
  ].filter(([, value]) => value)

  return (
    <section className="rounded-[20px] bg-background-secondary px-6 py-5">
      <h3 className="m-0 text-2xl font-semibold text-text">Contact info</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-background px-4 py-3">
            <p className="m-0 text-sm font-medium text-text-secondary">{label}</p>
            <p className="m-0 mt-1 text-base text-text">{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={cn('shrink-0 transition-transform', open && 'rotate-180')}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="m5 9 7 7 7-7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OrderDashboardCard({
  university,
  order,
  expanded,
  searchQuery,
  onSearchChange,
  debouncedSearchQuery,
  activeFilter,
  onFilterChange,
  onToggle,
}) {
  const orderUniversity = {
    ...university,
    kit: order,
    status: order.status ?? university.status,
  }
  const products = order.products ?? getProductsByOrder(order.id)
  const filteredProducts = filterProducts(
    products,
    debouncedSearchQuery,
    activeFilter,
  )

  return (
    <section className="rounded-[20px] bg-background-secondary px-6 py-6">
      <KitOverview
        university={orderUniversity}
        onExportCsv={() => window.alert('Export CSV (demo)')}
      />

      {expanded ? (
        <div className="mt-8 flex flex-col gap-6">
          <ContactInfo university={university} />

          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <KitProgress progressStep={order.progressStep ?? 0} />
            <KitPrice pricing={order.pricing} />
          </div>

          <SearchFilterPanel
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search by product name, variant, quote row..."
            filters={PRODUCT_FILTER_OPTIONS}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            filterAriaLabel="Filter products by status"
            ariaLabel={`Search and filter products for ${order.name}`}
            isSearching={searchQuery !== debouncedSearchQuery}
            className="px-4 py-4"
          />

          <ProductList
            products={filteredProducts}
            onChangeProduct={() => window.alert('Change product (demo)')}
          />
        </div>
      ) : null}

      <Button
        type="button"
        onClick={onToggle}
        variant="accent"
        size="lg"
        rounded="xl"
        className="mt-8 min-w-[240px]"
      >
        <ChevronIcon open={expanded} />
        {expanded ? 'Close order' : 'See order'}
      </Button>
    </section>
  )
}

export default function UniversityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getUniversity, softDeleteUniversity } = useUniversities()
  const university = getUniversity(id)
  const activeOrders = getActiveOrders(university)

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebouncedValue(searchQuery)
  const [activeFilter, setActiveFilter] = useState(PRODUCT_STATUS.ALL)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [expandedOrderIds, setExpandedOrderIds] = useState(() =>
    activeOrders[0]?.id ? new Set([activeOrders[0].id]) : new Set(),
  )

  if (!university || activeOrders.length === 0) {
    navigate('/admin', { replace: true })
    return null
  }

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

  function toggleOrder(orderId) {
    setExpandedOrderIds((current) => {
      const next = new Set(current)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  return (
    <div className={cn('min-h-svh bg-background font-body text-left text-text')}>
      <div
        className={cn(
          'mx-auto box-border flex max-w-[1200px] flex-col gap-6 px-6 py-8 pb-12',
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

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/admin"
            className={cn(
              'inline-flex w-fit font-body text-sm font-medium text-text-secondary no-underline hover:text-text hover:underline',
            )}
          >
            &lt; Back to clients overview
          </Link>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outlineStrong"
              rounded="xl"
              onClick={() => navigate(`/admin/customers/${id}/edit`)}
            >
              <EditIcon />
              Edit customer
            </Button>
            <Button
              type="button"
              variant="danger"
              rounded="xl"
              onClick={() => setShowDeleteDialog(true)}
            >
              <TrashIcon />
              Delete customer
            </Button>
          </div>
        </div>

        {activeOrders.map((order) => (
          <OrderDashboardCard
            key={order.id}
            university={university}
            order={order}
            expanded={expandedOrderIds.has(order.id)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            debouncedSearchQuery={debouncedSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onToggle={() => toggleOrder(order.id)}
          />
        ))}

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

function EditIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 7l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
