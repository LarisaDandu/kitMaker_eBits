import { useCallback, useEffect, useMemo, useState } from 'react'
import { universities as seedUniversities, UNIVERSITY_STATUS } from '../data/universities'
import {
  getMaxKitProgressStep,
  getStatsForProgressStep,
} from '../lib/kitProgress'
import {
  createOrderFromRequest,
  formValuesToUniversity,
  generateUniversityId,
  getActiveOrders,
  getPrimaryActiveOrder,
} from '../lib/universityUtils'
import { hasSupabaseConfig } from '../lib/supabaseClient'
import {
  deleteUniversity,
  fetchUniversities,
  setUniversityDeletedAt,
  upsertUniversity,
} from '../lib/repositories/universitiesRepository'
import {
  createOrderWithProducts,
  updateOrder,
} from '../lib/repositories/ordersRepository'
import { UniversitiesContext } from './universitiesContextValue'

function withMetadata(universities) {
  const initialTimestamp = new Date().toISOString()

  return universities.map((university) => {
    const activeOrders = getActiveOrders(university)
    const primaryOrder = activeOrders[0] ?? university.kit

    return {
      ...university,
      kit: primaryOrder,
      activeOrders,
      lastUpdatedAt: university.lastUpdatedAt ?? initialTimestamp,
      deletedAt: university.deletedAt ?? null,
    }
  })
}

function replaceUniversity(list, nextUniversity) {
  return list.map((university) =>
    university.id === nextUniversity.id ? nextUniversity : university,
  )
}

export function UniversitiesProvider({ children }) {
  const [allUniversities, setAllUniversities] = useState(() =>
    withMetadata(seedUniversities),
  )
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig)
  const [error, setError] = useState('')

  const loadUniversities = useCallback(async () => {
    if (!hasSupabaseConfig) return

    setIsLoading(true)
    setError('')
    try {
      setAllUniversities(await fetchUniversities())
    } catch (loadError) {
      setError(loadError.message ?? 'Could not load Supabase data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(loadUniversities)
  }, [loadUniversities])

  const universities = useMemo(
    () => allUniversities.filter((uni) => !uni.deletedAt),
    [allUniversities],
  )

  const getUniversity = useCallback(
    (id) => universities.find((uni) => uni.id === id),
    [universities],
  )

  const addUniversity = useCallback(async (formValues) => {
    const university = formValuesToUniversity(formValues, {
      id: generateUniversityId(),
      lastUpdatedAt: new Date().toISOString(),
      deletedAt: null,
    })

    if (hasSupabaseConfig) {
      const saved = await upsertUniversity(university)
      setAllUniversities((prev) => [...prev, saved])
      return saved.id
    }

    setAllUniversities((prev) => [...prev, university])
    return university.id
  }, [])

  const updateUniversity = useCallback(async (id, formValues) => {
    const existing = allUniversities.find((uni) => uni.id === id)
    const updated = {
      ...formValuesToUniversity(formValues, existing),
      lastUpdatedAt: new Date().toISOString(),
      deletedAt: existing?.deletedAt ?? null,
    }

    if (hasSupabaseConfig) {
      const saved = await upsertUniversity(updated)
      setAllUniversities((prev) => replaceUniversity(prev, saved))
      return
    }

    setAllUniversities((prev) => replaceUniversity(prev, updated))
  }, [allUniversities])

  const createActiveOrder = useCallback(async (universityId, orderInput) => {
    const orderDraft = createOrderFromRequest(orderInput)
    const order = {
      ...orderDraft,
      products: orderDraft.products.map((product) => ({
        ...product,
        orderId: orderDraft.id,
        universityId,
      })),
    }

    const savedOrder = hasSupabaseConfig
      ? await createOrderWithProducts(universityId, order)
      : order

    setAllUniversities((prev) =>
      prev.map((uni) => {
        if (uni.id !== universityId) return uni

        const activeOrders = [...getActiveOrders(uni), savedOrder]
        return {
          ...uni,
          status: UNIVERSITY_STATUS.ACTIVE_ORDER,
          kit: activeOrders[0],
          activeOrders,
          lastUpdatedAt: new Date().toISOString(),
        }
      }),
    )

    return savedOrder.id
  }, [])

  const removeUniversity = useCallback(async (id) => {
    if (hasSupabaseConfig) await deleteUniversity(id)
    setAllUniversities((prev) => prev.filter((uni) => uni.id !== id))
  }, [])

  const softDeleteUniversity = useCallback(async (id) => {
    const deletedAt = new Date().toISOString()

    if (hasSupabaseConfig) {
      const saved = await setUniversityDeletedAt(id, deletedAt)
      setAllUniversities((prev) => replaceUniversity(prev, saved))
      return
    }

    setAllUniversities((prev) =>
      prev.map((uni) =>
        uni.id === id
          ? {
              ...uni,
              deletedAt,
              lastUpdatedAt: deletedAt,
            }
          : uni,
      ),
    )
  }, [])

  const restoreUniversity = useCallback(async (id) => {
    const restoredAt = new Date().toISOString()

    if (hasSupabaseConfig) {
      const saved = await setUniversityDeletedAt(id, null)
      setAllUniversities((prev) => replaceUniversity(prev, saved))
      return
    }

    setAllUniversities((prev) =>
      prev.map((uni) =>
        uni.id === id
          ? {
              ...uni,
              deletedAt: null,
              lastUpdatedAt: restoredAt,
            }
          : uni,
      ),
    )
  }, [])

  const advanceKitOrder = useCallback(async (id) => {
    const university = allUniversities.find((uni) => uni.id === id)
    if (!university) return

    const activeOrders = getActiveOrders(university)
    const primaryOrder = getPrimaryActiveOrder(university)
    const maxStep = getMaxKitProgressStep()
    const currentStep = primaryOrder.progressStep ?? 0
    if (currentStep >= maxStep) return

    const nextStep = currentStep + 1
    const { stats } = primaryOrder
    const updatedOrder = {
      ...primaryOrder,
      progressStep: nextStep,
      status:
        nextStep >= maxStep
          ? UNIVERSITY_STATUS.ACTIVE_ORDER
          : nextStep >= 2
            ? UNIVERSITY_STATUS.REQUIRES_CHANGES
            : primaryOrder.status,
      stats: getStatsForProgressStep(
        nextStep,
        stats.totalComponents,
        stats.totalKits,
      ),
    }

    const savedOrder = hasSupabaseConfig
      ? await updateOrder(id, updatedOrder)
      : updatedOrder

    setAllUniversities((prev) =>
      prev.map((uni) => {
        if (uni.id !== id) return uni

        return {
          ...uni,
          lastUpdatedAt: new Date().toISOString(),
          status: savedOrder.status,
          kit: savedOrder,
          activeOrders: activeOrders.map((order) =>
            order.id === savedOrder.id ? savedOrder : order,
          ),
        }
      }),
    )
  }, [allUniversities])

  const value = useMemo(
    () => ({
      universities,
      isLoading,
      error,
      reloadUniversities: loadUniversities,
      getUniversity,
      addUniversity,
      updateUniversity,
      removeUniversity,
      softDeleteUniversity,
      restoreUniversity,
      advanceKitOrder,
      createActiveOrder,
    }),
    [
      universities,
      isLoading,
      error,
      loadUniversities,
      getUniversity,
      addUniversity,
      updateUniversity,
      removeUniversity,
      softDeleteUniversity,
      restoreUniversity,
      advanceKitOrder,
      createActiveOrder,
    ],
  )

  return (
    <UniversitiesContext.Provider value={value}>
      {children}
    </UniversitiesContext.Provider>
  )
}
