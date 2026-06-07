import { supabase } from '../supabaseClient'
import { mapProductFromDb, mapProductToDb } from './mappers'

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function productImportId(orderId, product) {
  if (product.quoteRow != null) return `prod-${orderId}-row-${product.quoteRow}`
  const nameSlug = slugify(product.name)
  if (nameSlug) return `prod-${orderId}-${nameSlug}`
  return `prod-${orderId}-${crypto.randomUUID().slice(0, 8)}`
}

export async function fetchProductsByOrder(orderId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('order_id', orderId)
    .order('quote_row', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapProductFromDb)
}

export async function upsertProducts(products) {
  if (products.length === 0) return []

  const { data, error } = await supabase
    .from('products')
    .upsert(products.map((product) => mapProductToDb(product)))
    .select('*')

  if (error) throw error
  return (data ?? []).map(mapProductFromDb)
}

export async function mergeProductsForOrder({ universityId, orderId, products }) {
  const existingProducts = await fetchProductsByOrder(orderId)
  const byQuoteRow = new Map(
    existingProducts
      .filter((product) => product.quoteRow != null)
      .map((product) => [String(product.quoteRow), product]),
  )
  const byName = new Map(
    existingProducts
      .filter((product) => product.name)
      .map((product) => [product.name.toLowerCase(), product]),
  )

  const mergedProducts = products.map((product) => {
    const existing =
      (product.quoteRow != null ? byQuoteRow.get(String(product.quoteRow)) : null) ??
      (product.name ? byName.get(product.name.toLowerCase()) : null)

    return {
      ...existing,
      ...product,
      id: existing?.id ?? productImportId(orderId, product),
      universityId,
      orderId,
    }
  })

  const savedProducts = await upsertProducts(mergedProducts)
  return fetchProductsByOrder(orderId).then((currentProducts) => ({
    savedProducts,
    products: currentProducts,
  }))
}
