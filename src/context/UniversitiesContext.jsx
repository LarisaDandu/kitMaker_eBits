import { useCallback, useMemo, useState } from 'react'
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
      lastUpdatedAt: initialTimestamp,
      deletedAt: null,
    }
  })
}

export function UniversitiesProvider({ children }) {
  const [allUniversities, setAllUniversities] = useState(() =>
    withMetadata(seedUniversities),
  )

  const universities = useMemo(
    () => allUniversities.filter((uni) => !uni.deletedAt),
    [allUniversities],
  )

  const getUniversity = useCallback(
    (id) => universities.find((uni) => uni.id === id),
    [universities],
  )

  const addUniversity = useCallback((formValues) => {
    const university = formValuesToUniversity(formValues, {
      id: generateUniversityId(),
      lastUpdatedAt: new Date().toISOString(),
      deletedAt: null,
    })
    setAllUniversities((prev) => [...prev, university])
    return university.id
  }, [])

  const updateUniversity = useCallback((id, formValues) => {
    setAllUniversities((prev) =>
      prev.map((uni) =>
        uni.id === id
          ? {
              ...formValuesToUniversity(formValues, uni),
              lastUpdatedAt: new Date().toISOString(),
              deletedAt: uni.deletedAt ?? null,
            }
          : uni,
      ),
    )
  }, [])

  const createActiveOrder = useCallback((universityId, orderInput) => {
    const orderDraft = createOrderFromRequest(orderInput)
    const order = {
      ...orderDraft,
      products: orderDraft.products.map((product) => ({
        ...product,
        orderId: orderDraft.id,
        universityId,
      })),
    }

    setAllUniversities((prev) =>
      prev.map((uni) => {
        if (uni.id !== universityId) return uni

        const activeOrders = [...getActiveOrders(uni), order]
        return {
          ...uni,
          status: UNIVERSITY_STATUS.ACTIVE_ORDER,
          kit: activeOrders[0],
          activeOrders,
          lastUpdatedAt: new Date().toISOString(),
        }
      }),
    )

    return order.id
  }, [])

  const removeUniversity = useCallback((id) => {
    setAllUniversities((prev) => prev.filter((uni) => uni.id !== id))
  }, [])

  const softDeleteUniversity = useCallback((id) => {
    const deletedAt = new Date().toISOString()
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

  const restoreUniversity = useCallback((id) => {
    const restoredAt = new Date().toISOString()
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

  const advanceKitOrder = useCallback((id) => {
    setAllUniversities((prev) =>
      prev.map((uni) => {
        if (uni.id !== id) return uni

        const activeOrders = getActiveOrders(uni)
        const primaryOrder = getPrimaryActiveOrder(uni)
        const maxStep = getMaxKitProgressStep()
        const currentStep = primaryOrder.progressStep ?? 0
        if (currentStep >= maxStep) return uni

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

        return {
          ...uni,
          lastUpdatedAt: new Date().toISOString(),
          status: updatedOrder.status,
          kit: updatedOrder,
          activeOrders: activeOrders.map((order) =>
            order.id === updatedOrder.id ? updatedOrder : order,
          ),
        }
      }),
    )
  }, [])

  const value = useMemo(
    () => ({
      universities,
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
