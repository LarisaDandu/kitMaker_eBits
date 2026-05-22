import { useMemo } from 'react'
import { useUniversities } from './useUniversities'

export function useUniversityByLoginCode(loginCode) {
  const { universities } = useUniversities()

  return useMemo(() => {
    const normalizedCode = loginCode?.trim().toLowerCase()

    return universities.find(
      (item) => item.loginCode.toLowerCase() === normalizedCode,
    )
  }, [loginCode, universities])
}
