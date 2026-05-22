import { useContext } from 'react'
import { UniversitiesContext } from '../context/universitiesContextValue'

export function useUniversities() {
  const context = useContext(UniversitiesContext)
  if (!context) {
    throw new Error('useUniversities must be used within UniversitiesProvider')
  }
  return context
}
