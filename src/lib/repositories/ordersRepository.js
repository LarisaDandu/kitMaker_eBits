import { supabase } from '../supabaseClient'
import { mapOrderFromDb, mapOrderToDb, mapProductToDb } from './mappers'

export async function createOrderWithProducts(universityId, order) {
  const { data, error } = await supabase
    .from('orders')
    .insert(mapOrderToDb(order, universityId))
    .select('*')
    .single()

  if (error) throw error

  const products = (order.products ?? []).map((product) =>
    mapProductToDb(product, universityId, data.id),
  )

  if (products.length > 0) {
    const { error: productsError } = await supabase
      .from('products')
      .upsert(products)
    if (productsError) throw productsError
  }

  return {
    ...mapOrderFromDb(data),
    products: order.products ?? [],
  }
}

export async function updateOrder(universityId, order) {
  const { data, error } = await supabase
    .from('orders')
    .update(mapOrderToDb(order, universityId))
    .eq('id', order.id)
    .select('*, products(*)')
    .single()

  if (error) throw error
  return mapOrderFromDb(data)
}

export async function updateOrderStats(orderId, stats) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      stats,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*, products(*)')
    .single()

  if (error) throw error
  return mapOrderFromDb(data)
}
