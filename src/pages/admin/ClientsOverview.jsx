import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import AdminHeader from '../../components/admin/AdminHeader'
import SearchFilterBar from '../../components/admin/SearchFilterBar'
import UniversityList from '../../components/universities/UniversityList'
import { useUniversities } from '../../hooks/useUniversities'
import { cn } from '../../lib/cn'
import { FILTER_OPTIONS } from '../../data/universities'

function filterUniversities(list, searchQuery, statusFilter) {
  const query = searchQuery.trim().toLowerCase()

  return list.filter((uni) => {
    const matchesStatus = statusFilter === 'all' || uni.status === statusFilter
    const matchesSearch =
      !query ||
      uni.name.toLowerCase().includes(query) ||
      uni.professorName?.toLowerCase().includes(query) ||
      uni.email?.toLowerCase().includes(query) ||
      uni.phone?.toLowerCase().includes(query) ||
      uni.ean?.toLowerCase().includes(query) ||
      uni.loginCode?.toLowerCase().includes(query) ||
      uni.kit.name.toLowerCase().includes(query) ||
      uni.kit.quoteId.includes(query)

    return matchesStatus && matchesSearch
  })
}

export default function ClientsOverview() {
  const navigate = useNavigate()
  const { universities, removeUniversity } = useUniversities()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredUniversities = useMemo(
    () => filterUniversities(universities, searchQuery, activeFilter),
    [universities, searchQuery, activeFilter],
  )

  function handleDelete(id, name) {
    if (window.confirm(`Delete ${name}? This cannot be undone.`)) {
      removeUniversity(id)
    }
  }

  function handleLogout() {
    window.alert('Logged out (demo)')
  }

  function handleCreateCustomer() {
    navigate('/admin/customers/new')
  }

  return (
    <div className={cn('min-h-svh bg-background-secondary font-body text-left text-text')}>
      <div
        className={cn(
          'mx-auto box-border flex max-w-[1100px] flex-col gap-5 px-6 py-8 pb-12',
          'max-sm:px-4 max-sm:py-5 max-sm:pb-8',
        )}
      >
        <AdminHeader onLogout={handleLogout} />

        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={FILTER_OPTIONS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onCreateCustomer={handleCreateCustomer}
        />

        <UniversityList
          universities={filteredUniversities}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
