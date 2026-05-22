import SearchFilterPanel from './SearchFilterPanel'
import Button from '../ui/Button'

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  filters,
  activeFilter,
  onFilterChange,
  onCreateCustomer,
}) {
  return (
    <SearchFilterPanel
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search clients..."
      filters={filters}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      filterAriaLabel="Filter clients by status"
      ariaLabel="Search and filter clients"
      action={
        <Button onClick={onCreateCustomer} className="max-sm:justify-center">
          <PlusIcon />
          Create new customer
        </Button>
      }
    />
  )
}

function PlusIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
