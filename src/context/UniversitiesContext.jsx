import { useCallback, useMemo, useState } from 'react'
import { universities as seedUniversities, UNIVERSITY_STATUS } from '../data/universities'
import {
  getMaxKitProgressStep,
  getStatsForProgressStep,
} from '../lib/kitProgress'
import { formValuesToUniversity, generateUniversityId } from '../lib/universityUtils'
import { UniversitiesContext } from './universitiesContextValue'

export function UniversitiesProvider({ children }) {
  const [universities, setUniversities] = useState(seedUniversities)

  const getUniversity = useCallback(
    (id) => universities.find((uni) => uni.id === id),
    [universities],
  )

  const addUniversity = useCallback((formValues) => {
    const university = formValuesToUniversity(formValues, {
      id: generateUniversityId(),
    })
    setUniversities((prev) => [...prev, university])
    return university.id
  }, [])

  const updateUniversity = useCallback((id, formValues) => {
    setUniversities((prev) =>
      prev.map((uni) =>
        uni.id === id ? formValuesToUniversity(formValues, uni) : uni,
      ),
    )
  }, [])

  const removeUniversity = useCallback((id) => {
    setUniversities((prev) => prev.filter((uni) => uni.id !== id))
  }, [])

  const advanceKitOrder = useCallback((id) => {
    setUniversities((prev) =>
      prev.map((uni) => {
        if (uni.id !== id) return uni

        const maxStep = getMaxKitProgressStep()
        const currentStep = uni.kit.progressStep ?? 0
        if (currentStep >= maxStep) return uni

        const nextStep = currentStep + 1
        const { stats } = uni.kit

        return {
          ...uni,
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
      advanceKitOrder,
    }),
    [
      universities,
      getUniversity,
      addUniversity,
      updateUniversity,
      removeUniversity,
      advanceKitOrder,
    ],
  )

  return (
    <UniversitiesContext.Provider value={value}>
      {children}
    </UniversitiesContext.Provider>
  )
}
