import { useEffect, useState } from 'react'
import { kitMakerProducts } from '../data/kitMakerProducts'
import { fetchKitCatalogProducts } from '../lib/repositories/catalogRepository'
import { hasSupabaseConfig } from '../lib/supabaseClient'

export function useKitCatalogProducts() {
  const [products, setProducts] = useState(kitMakerProducts)
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadCatalog() {
      if (!hasSupabaseConfig) return

      setIsLoading(true)
      setError('')
      try {
        const catalogProducts = await fetchKitCatalogProducts()
        if (isMounted && catalogProducts.length > 0) setProducts(catalogProducts)
      } catch (loadError) {
        if (isMounted) setError(loadError.message ?? 'Could not load catalog.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadCatalog()

    return () => {
      isMounted = false
    }
  }, [])

  return { products, isLoading, error }
}
