import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { UNIVERSITY_STATUS, universities } from '../src/data/universities.js'
import { products } from '../src/data/products.js'
import { kitMakerProducts } from '../src/data/kitMakerProducts.js'
import {
  getActiveOrders,
} from '../src/lib/universityUtils.js'
import {
  mapCatalogToDb,
  mapOrderToDb,
  mapProductToDb,
  mapUniversityToDb,
} from '../src/lib/repositories/mappers.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvFile(fileName) {
  const filePath = path.join(root, fileName)
  if (!fs.existsSync(filePath)) return {}

  return Object.fromEntries(
    fs
      .readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index), line.slice(index + 1)]
      }),
  )
}

function normalizeSupabaseUrl(value) {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `https://${value}.supabase.co`
}

function previousOrderId(universityId, orderId) {
  return `${universityId}-${orderId}`
}

const env = {
  ...loadEnvFile('.env.local'),
  ...loadEnvFile('.env.seed.local'),
}

const supabaseUrl = normalizeSupabaseUrl(env.VITE_SUPABASE_URL)
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const universityRows = universities.map((university) =>
  mapUniversityToDb({
    ...university,
    lastUpdatedAt: new Date().toISOString(),
    deletedAt: null,
  }),
)

const activeOrderRows = universities.flatMap((university) =>
  getActiveOrders(university)
    .filter((order) => order.status !== UNIVERSITY_STATUS.INACTIVE_ORDERS)
    .map((order) =>
      mapOrderToDb(
        {
          ...order,
          archivedAt: null,
        },
        university.id,
      ),
    ),
)

const previousOrderRows = universities.flatMap((university) =>
  [
    ...(university.kit?.status === UNIVERSITY_STATUS.INACTIVE_ORDERS
      ? [university.kit]
      : []),
    ...(university.previousOrders ?? []),
  ].map((order) =>
    mapOrderToDb(
      {
        ...order,
        id: order.id.startsWith('order-')
          ? order.id
          : previousOrderId(university.id, order.id),
        quoteId: order.quoteId ?? order.id,
        stats: order.stats ?? university.kit.stats,
        pricing: order.pricing ?? university.kit.pricing,
        progressStep: order.progressStep ?? university.kit.progressStep ?? 0,
        archivedAt: new Date().toISOString(),
      },
      university.id,
    ),
  ),
)

const productRows = products.map((product) =>
  mapProductToDb(product, product.universityId, product.orderId),
)

async function upsert(table, rows) {
  if (rows.length === 0) return
  const { error } = await supabase.from(table).upsert(rows)
  if (error) throw error
  console.log(`Upserted ${rows.length} ${table}`)
}

async function resetTables() {
  for (const table of ['products', 'orders', 'kit_catalog_products', 'universities']) {
    const { error } = await supabase.from(table).delete().neq('id', '__never__')
    if (error) throw error
    console.log(`Cleared ${table}`)
  }
}

await resetTables()
await upsert('universities', universityRows)
await upsert('orders', [...activeOrderRows, ...previousOrderRows])
await upsert('products', productRows)
await upsert('kit_catalog_products', kitMakerProducts.map(mapCatalogToDb))

console.log('Supabase seed complete.')
