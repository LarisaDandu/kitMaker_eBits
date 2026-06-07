import { supabase } from '../supabaseClient'
import { mapCatalogFromDb } from './mappers'

export async function fetchKitCatalogProducts() {
  const { data, error } = await supabase
    .from('kit_catalog_products')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapCatalogFromDb)
}
