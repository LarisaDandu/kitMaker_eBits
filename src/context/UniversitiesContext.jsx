import { useCallback, useMemo, useState } from 'react'
import { universities as seedUniversities, UNIVERSITY_STATUS } from '../data/universities'
import {
  getMaxKitProgressStep,
  getStatsForProgressStep,
} from '../lib/kitProgress'
import { formValuesToUniversity, generateUniversityId } from '../lib/universityUtils'
import { UniversitiesContext } from './universitiesContextValue'

function withMetadata(universities) {
  const initialTimestamp = new Date().toISOString()

  return universities.map((university) => ({
    ...university,
    lastUpdatedAt: initialTimestamp,
    deletedAt: null,
  }))
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

        const maxStep = getMaxKitProgressStep()
        const currentStep = uni.kit.progressStep ?? 0
        if (currentStep >= maxStep) return uni

        const nextStep = currentStep + 1
        const { stats } = uni.kit

        return {
          ...uni,
          lastUpdatedAt: new Date().toISOString(),
          status:
            nextStep >= maxStep
              ? UNIVERSITY_STATUS.ACTIVE_ORDER
              : nextStep >= 2
                ? UNIVERSITY_STATUS.REQUIRES_CHANGES
                : uni.status,
          kit: {
            ...uni.kit,
            progressStep: nextStep,
            stats: getStatsForProgressStep(
              nextStep,
              stats.totalComponents,
              stats.totalKits,
            ),
          },
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
    ],
  )

  return (
    <UniversitiesContext.Provider value={value}>
      {children}
    </UniversitiesContext.Provider>
  )
}
