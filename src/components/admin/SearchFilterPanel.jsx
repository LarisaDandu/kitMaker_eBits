import FilterPill from './FilterPill'
import { cn } from '../../lib/cn'

export default function SearchFilterPanel({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  activeFilter,
  onFilterChange,
  filterAriaLabel = 'Filter results',
  action,
  ariaLabel = 'Search and filter',
  className,
}) {
  return (
    <section
      className={cn(
        'rounded-[20px] bg-background-third px-6 py-5 max-sm:rounded-2xl max-sm:px-4 max-sm:py-4',
        className,
      )}
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-4',
          action ? 'max-sm:flex-col max-sm:items-stretch' : '',
        )}
      >
        <div
          className={cn(
            'flex min-w-[280px] flex-1 flex-wrap items-center gap-3',
            'max-sm:w-full max-sm:flex-col max-sm:items-stretch',
          )}
        >
          <label
            className={cn(
              'flex min-w-[200px] items-center gap-2 rounded-full border-2 border-accent-2 bg-background px-4 py-2 text-text',
              'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-2-lighter',
              'max-sm:w-full',
            )}
          >
            <SearchIcon />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                'w-full border-none bg-transparent font-body text-sm text-text outline-none',
                'placeholder:text-text-secondary',
              )}
            />
          </label>

          <div className="flex flex-wrap gap-2" role="group" aria-label={filterAriaLabel}>
            {filters.map((filter) => (
              <FilterPill
                key={filter.id}
                label={filter.label}
                active={activeFilter === filter.id}
                onClick={() => onFilterChange(filter.id)}
              />
            ))}
          </div>
        </div>

        {action ? <div className="max-sm:flex max-sm:justify-center">{action}</div> : null}
      </div>
    </section>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
