import { supabase } from '../supabaseClient'
import {
  mapOrderFromDb,
  mapUniversityFromDb,
  mapUniversityToDb,
} from './mappers'

function shapeUniversity(row) {
  const orders = (row.orders ?? []).map(mapOrderFromDb)
  const activeOrders = orders.filter((order) => !order.archivedAt)
  const previousOrders = orders.filter((order) => order.archivedAt)
  const kit = activeOrders[0] ?? orders[0]

  return {
    ...mapUniversityFromDb(row),
    kit,
    activeOrders,
    previousOrders,
  }
}

export async function fetchUniversities() {
  const { data, error } = await supabase
    .from('universities')
    .select('*, orders(*, products(*))')
    .order('last_updated_at', { ascending: false })
    .order('created_at', { referencedTable: 'orders', ascending: true })

  if (error) throw error
  return (data ?? []).map(shapeUniversity)
}

export async function upsertUniversity(university) {
  const { data, error } = await supabase
    .from('universities')
    .upsert(mapUniversityToDb(university))
    .select('*, orders(*, products(*))')
    .single()

  if (error) throw error
  return shapeUniversity(data)
}

export async function deleteUniversity(id) {
  const { error } = await supabase.from('universities').delete().eq('id', id)
  if (error) throw error
}

export async function setUniversityDeletedAt(id, deletedAt) {
  const { data, error } = await supabase
    .from('universities')
    .update({
      deleted_at: deletedAt,
      last_updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, orders(*, products(*))')
    .single()

  if (error) throw error
  return shapeUniversity(data)
}
