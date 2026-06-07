import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import AdminHeader from '../../components/admin/AdminHeader'
import SearchFilterBar from '../../components/admin/SearchFilterBar'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import UndoToast from '../../components/ui/UndoToast'
import UniversityList from '../../components/universities/UniversityList'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useUniversities } from '../../hooks/useUniversities'
import { cn } from '../../lib/cn'
import { formatLastUpdated } from '../../lib/time'
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
  const location = useLocation()
  const {
    universities,
    removeUniversity,
    softDeleteUniversity,
    restoreUniversity,
  } = useUniversities()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebouncedValue(searchQuery)
  const [activeFilter, setActiveFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [undoToast, setUndoToast] = useState(
    () => location.state?.deletedUniversity ?? null,
  )
  const deleteTimers = useRef(new Map())

  const filteredUniversities = useMemo(
    () =>
      filterUniversities(
        universities,
        debouncedSearchQuery,
        activeFilter,
      ),
    [universities, debouncedSearchQuery, activeFilter],
  )

  const latestUpdatedAt = useMemo(
    () =>
      universities.reduce(
        (latest, university) =>
          new Date(university.lastUpdatedAt ?? 0) > new Date(latest ?? 0)
            ? university.lastUpdatedAt
            : latest,
        universities[0]?.lastUpdatedAt,
      ),
    [universities],
  )

  const startDeleteTimer = useCallback((university) => {
    const existingTimer = deleteTimers.current.get(university.id)
    if (existingTimer) window.clearTimeout(existingTimer)

    const timerId = window.setTimeout(() => {
      removeUniversity(university.id)
      deleteTimers.current.delete(university.id)
      setUndoToast((current) =>
        current?.id === university.id ? null : current,
      )
    }, 8000)

    deleteTimers.current.set(university.id, timerId)
  }, [removeUniversity])

  const showUndoToast = useCallback((university) => {
    setUndoToast(university)
    startDeleteTimer(university)
  }, [startDeleteTimer])

  useEffect(() => {
    if (location.state?.deletedUniversity) {
      navigate('.', { replace: true, state: null })
    }
  }, [location.state, navigate])

  useEffect(() => {
    if (undoToast && !deleteTimers.current.has(undoToast.id)) {
      startDeleteTimer(undoToast)
    }
  }, [startDeleteTimer, undoToast])

  useEffect(
    () => () => {
      deleteTimers.current.forEach((timerId) => window.clearTimeout(timerId))
    },
    [],
  )

  function handleRequestDelete(id, name) {
    setPendingDelete({ id, name })
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return

    softDeleteUniversity(pendingDelete.id)
    showUndoToast(pendingDelete)
    setPendingDelete(null)
  }

  function handleUndoDelete() {
    if (!undoToast) return

    const timerId = deleteTimers.current.get(undoToast.id)
    if (timerId) window.clearTimeout(timerId)
    deleteTimers.current.delete(undoToast.id)
    restoreUniversity(undoToast.id)
    setUndoToast(null)
  }

  function handleDismissUndo() {
    if (undoToast) {
      const timerId = deleteTimers.current.get(undoToast.id)
      if (timerId) window.clearTimeout(timerId)
      removeUniversity(undoToast.id)
      deleteTimers.current.delete(undoToast.id)
    }
    setUndoToast(null)
  }

  function handleLogout() {
    navigate('/')
  }

  function handleCreateCustomer() {
    navigate('/admin/customers/new')
  }

  return (
    <div className={cn('min-h-svh bg-background-secondary font-body text-left text-text')}>
      <div
        className={cn(
          'mx-auto box-border flex max-w-[1400px] flex-col gap-5 px-6 py-8 pb-12',
          'max-sm:px-4 max-sm:py-5 max-sm:pb-8',
        )}
      >
        <AdminHeader onLogout={handleLogout} />

        <p className="m-0 -mt-3 text-sm font-medium text-text-secondary">
          Last updated: {formatLastUpdated(latestUpdatedAt)}
        </p>

        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={FILTER_OPTIONS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          isSearching={searchQuery !== debouncedSearchQuery}
          onCreateCustomer={handleCreateCustomer}
        />

        <UniversityList
          universities={filteredUniversities}
          onDelete={handleRequestDelete}
        />
      </div>

      {pendingDelete ? (
        <ConfirmDialog
          title={`Delete ${pendingDelete.name}?`}
          description="This customer will be hidden from the client list. You can undo the deletion for a short time after confirming."
          confirmLabel="Delete customer"
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}

      {undoToast ? (
        <UndoToast
          message={`${undoToast.name} deleted.`}
          onAction={handleUndoDelete}
          onClose={handleDismissUndo}
        />
      ) : null}
    </div>
  )
}
