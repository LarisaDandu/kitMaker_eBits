# eBits Kit Maker

This project is a React and Vite prototype for the eBits kit ordering workflow. It covers two main user groups:

- eBits staff, who manage university customers, quotes, kit progress, and product rows.
- University contacts, who review orders, approve or reject components, and build new kits from a catalog.

The first hand-in version was intentionally frontend-first. It used static demo data from `src/data/` and React state for the current browser session. That made it possible to demonstrate the full workflow without exposing any eBits API, logistics system, or internal backend. After hand-in, Supabase support and multiple active orders were added as separate extensions. Those additions are documented in **Post hand-in changes**.

## Running the project

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Useful scripts:

```bash
npm run lint
npm run build
npm run preview
npm run seed:supabase
```

The Vite base path is configured for GitHub Pages at `/kitMaker_eBits/`, so local URLs usually look like:

```text
http://localhost:5173/kitMaker_eBits/
```

## How The Website Functions

The first screen is the login page. It has two modes: school login and admin login.

Admin login uses the password:

```text
admin
```

School login checks the entered code against each university's `loginCode`. Current seed examples include:

```text
DTU-2026
AAU-2026
SDU-2026
AU-2026
KU-2026
```

The admin side starts at `/admin`. Staff can search and filter customers, create or edit customers, open a school dashboard, view active orders, import product rows, and delete customers with an undo option.

The school side starts at `/orders/:loginCode`. A school can see active and previous orders, open an order dashboard, review components, export CSV files, create new kits, and reorder from previous kits.

## Main Architecture

The app is organized around routes, pages, context, data modules, utility functions, and prop-driven components.

`src/App.jsx` defines the route tree:

```jsx
export default function App() {
  return (
    <UniversitiesProvider>
      <Routes>
        <Route path="/orders/:loginCode">
          <Route index element={<CustomerOrdersPage />} />
          <Route path="dashboard" element={<CustomerKitDashboardPage />} />
          <Route path="dashboard/:orderId" element={<CustomerKitDashboardPage />} />
          <Route path="dashboard/:orderId/add-components" element={<AddComponentsPage />} />
          <Route path="kit-builder" element={<CustomerKitBuilderPage />} />
          <Route path="kit-builder/custom" element={<MakeYourOwnKitPage />} />
          <Route path="kit-builder/premade" element={<PremadeKitsPage />} />
          <Route path="previous/:orderId" element={<PreviousOrderPage />} />
          <Route path="previous/:orderId/reorder" element={<ReorderPage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ClientsOverview />} />
          <Route path="customers/new" element={<CustomerFormPage />} />
          <Route path="customers/:id" element={<UniversityDetailPage />} />
          <Route path="customers/:id/edit" element={<CustomerFormPage />} />
        </Route>

        <Route path="/" element={<LoginPage />} />
      </Routes>
    </UniversitiesProvider>
  )
}
```

`UniversitiesProvider` wraps the app so pages can read and update the same university/order state. In the first hand-in version, this state came only from local seed data. In the current version, the provider can load from Supabase when environment keys exist, and falls back to seed data when they do not.

Most components in `src/components/` are intentionally simple. They render props and emit events upward. Pages own route state, filtering, sorting, cart state, and save actions. This keeps the UI components reusable and keeps domain decisions in page/context code.

For example, `UniversityList` only renders the universities it receives:

```jsx
export default function UniversityList({
  universities,
  onDelete,
  emptyMessage = 'No customers match your filters.',
}) {
  return (
    <section aria-label="Client list">
      {universities.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <div>
          {universities.map((university) => (
            <UniversityCard
              key={university.id}
              university={university}
              onDelete={(id) => onDelete(id, university.name)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
```

The page decides what the visible list should be:

```js
const filteredUniversities = useMemo(
  () =>
    filterUniversities(
      universities,
      debouncedSearchQuery,
      activeFilter,
    ),
  [universities, debouncedSearchQuery, activeFilter],
)
```

That is the general pattern throughout the app:

- Components render and call callbacks.
- Pages calculate visible data and handle local UI state.
- Context handles shared university/order mutations.
- Repository files handle Supabase reads and writes.
- Utility files handle formatting, parsing, CSV export, and small data helpers.

## Data And State

The local fallback demo data lives in:

```text
src/data/universities.js
src/data/products.js
src/data/kitMakerProducts.js
src/data/kits.js
```

`universities.js` contains schools, login codes, contact details, active orders, previous orders, pricing, progress, and quote status. `products.js` contains product rows connected to universities and orders. `kitMakerProducts.js` is the product catalog used by the make-your-own flow. `kits.js` stores the labels for the order progress timeline.

The main state container is:

```text
src/context/UniversitiesContext.jsx
```

It starts with seed universities and normalizes them so every school has useful metadata and active-order structure:

```js
function withMetadata(universities) {
  const initialTimestamp = new Date().toISOString()

  return universities.map((university) => {
    const activeOrders = getActiveOrders(university)
    const primaryOrder = activeOrders[0] ?? university.kit

    return {
      ...university,
      kit: primaryOrder,
      activeOrders,
      lastUpdatedAt: university.lastUpdatedAt ?? initialTimestamp,
      deletedAt: university.deletedAt ?? null,
    }
  })
}
```

The provider stores all universities, including soft-deleted ones, then exposes only visible universities:

```js
const [allUniversities, setAllUniversities] = useState(() =>
  withMetadata(seedUniversities),
)

const universities = useMemo(
  () => allUniversities.filter((uni) => !uni.deletedAt),
  [allUniversities],
)
```

This is why undoable delete works. A deleted school is hidden by setting `deletedAt`, not immediately forgotten.

```js
const softDeleteUniversity = useCallback(async (id) => {
  const deletedAt = new Date().toISOString()

  if (hasSupabaseConfig) {
    const saved = await setUniversityDeletedAt(id, deletedAt)
    setAllUniversities((prev) => replaceUniversity(prev, saved))
    return
  }

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
```

Restoring a school is the reverse operation:

```js
const restoreUniversity = useCallback(async (id) => {
  const restoredAt = new Date().toISOString()

  if (hasSupabaseConfig) {
    const saved = await setUniversityDeletedAt(id, null)
    setAllUniversities((prev) => replaceUniversity(prev, saved))
    return
  }

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
```

So the delete process has two stages: hide first, then remove permanently if the undo timer finishes.

## Login And Routing

The login form is local state. Admin mode checks the password directly. School mode finds a matching `loginCode` and navigates to the school order area.

School pages use `useUniversityByLoginCode` to connect the URL to a school record:

```js
export function useUniversityByLoginCode(loginCode) {
  const { universities } = useUniversities()

  return useMemo(() => {
    const normalizedCode = loginCode?.trim().toLowerCase()

    return universities.find(
      (item) => item.loginCode.toLowerCase() === normalizedCode,
    )
  }, [loginCode, universities])
}
```

If the login code does not match, the page shows an "Order not found" state instead of rendering empty data.

The teacher account menu uses the same `loginCode` to link back to the right order pages. Sign out navigates to `/`, orders navigates to `/orders/:loginCode`, and dashboard navigates to `/orders/:loginCode/dashboard`.

## Admin Workflow

The admin overview is the customer-management screen. It supports:

- Search.
- Status filtering.
- Empty states.
- Last-updated timestamps.
- Customer creation and editing.
- Confirmation before delete.
- Undo after delete.
- Quote/status pills for active orders.

Filtering is plain JavaScript. The page normalizes the search query and checks the fields that matter for the admin list:

```js
function filterUniversities(list, searchQuery, statusFilter) {
  const query = searchQuery.trim().toLowerCase()

  return list.filter((uni) => {
    const matchesStatus = statusFilter === 'all' || uni.status === statusFilter
    const matchesSearch =
      !query ||
      uni.name.toLowerCase().includes(query) ||
      uni.professorName?.toLowerCase().includes(query) ||
      uni.email?.toLowerCase().includes(query) ||
      uni.ean?.toLowerCase().includes(query) ||
      uni.loginCode?.toLowerCase().includes(query) ||
      uni.kit.name.toLowerCase().includes(query) ||
      uni.kit.quoteId.includes(query)

    return matchesStatus && matchesSearch
  })
}
```

The search input uses a debounced value, so the interface can briefly show that it is searching without recalculating on every keystroke:

```js
export function useDebouncedValue(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [delay, value])

  return debouncedValue
}
```

Delete does not use a native `window.confirm`. The page stores the selected customer, opens `ConfirmDialog`, soft-deletes on confirmation, then shows `UndoToast`.

```js
function handleConfirmDelete() {
  if (!pendingDelete) return

  softDeleteUniversity(pendingDelete.id)
  showUndoToast(pendingDelete)
  setPendingDelete(null)
}
```

Undo clears the timer, restores the school, and closes the toast:

```js
function handleUndoDelete() {
  if (!undoToast) return

  const timerId = deleteTimers.current.get(undoToast.id)
  if (timerId) window.clearTimeout(timerId)
  deleteTimers.current.delete(undoToast.id)
  restoreUniversity(undoToast.id)
  setUndoToast(null)
}
```

The admin school dashboard shows school contact information at the top beside the edit/delete actions. Below that, each active order is shown as a collapsible card. This keeps contact info tied to the school, while progress, pricing, products, and imports stay tied to the selected order.

## Kit Progress

Kit progress is controlled by one number: `progressStep`. The labels live in `src/data/kits.js`, and the stats for each step are generated by `src/lib/kitProgress.js`.

When staff advance an order, context finds the primary active order, calculates the next step, updates status, and recalculates the stats:

```js
const advanceKitOrder = useCallback(async (id) => {
  const university = allUniversities.find((uni) => uni.id === id)
  if (!university) return

  const activeOrders = getActiveOrders(university)
  const primaryOrder = getPrimaryActiveOrder(university)
  const maxStep = getMaxKitProgressStep()
  const currentStep = primaryOrder.progressStep ?? 0
  if (currentStep >= maxStep) return

  const nextStep = currentStep + 1
  const { stats } = primaryOrder
  const updatedOrder = {
    ...primaryOrder,
    progressStep: nextStep,
    status:
      nextStep >= maxStep
        ? UNIVERSITY_STATUS.ACTIVE_ORDER
        : nextStep >= 2
          ? UNIVERSITY_STATUS.REQUIRES_CHANGES
          : primaryOrder.status,
    stats: getStatsForProgressStep(
      nextStep,
      stats.totalComponents,
      stats.totalKits,
    ),
  }

  const savedOrder = hasSupabaseConfig
    ? await updateOrder(id, updatedOrder)
    : updatedOrder

  setAllUniversities((prev) =>
    prev.map((uni) => {
      if (uni.id !== id) return uni

      return {
        ...uni,
        lastUpdatedAt: new Date().toISOString(),
        status: savedOrder.status,
        kit: savedOrder,
        activeOrders: activeOrders.map((order) =>
          order.id === savedOrder.id ? savedOrder : order,
        ),
      }
    }),
  )
}, [allUniversities])
```

The progress UI does not store separate visual state. It derives each node from `progressStep`:

```jsx
{KIT_PROGRESS_STEPS.map((label, index) => {
  const state =
    index < progressStep
      ? 'complete'
      : index === progressStep
        ? 'current'
        : 'upcoming'

  return (
    <li key={label}>
      <StepNode state={state} />
      <span>{label}</span>
    </li>
  )
})}
```

If the number changes, the visual timeline follows.

## Product Review Dashboard

The teacher dashboard resolves a specific order from the URL. If the route has no `orderId`, it opens the first active order.

```js
const selectedOrder = orderId
  ? findUniversityOrder(university, orderId)
  : getPrimaryActiveOrder(university)
```

Products come from the selected order first. If an order does not have embedded products, the page falls back to the local product helper:

```js
const demoProducts = selectedOrder
  ? selectedOrder.products ?? getProductsByOrder(selectedOrder.id)
  : []
const products = importSummary?.products ?? demoProducts
```

Review choices are stored in page state. Seed data can include `customerReply`, and the dashboard converts those replies into an initial lookup object:

```js
function getInitialReviews(products) {
  return products.reduce((reviews, product) => {
    if (product.customerReply) {
      reviews[product.id] = product.customerReply
    }
    return reviews
  }, {})
}
```

When the user approves, rejects, or requests changes, the page updates the review object:

```js
function handleApplyReview(productId, review) {
  setReviews((current) => {
    const next = { ...current }
    if (review) next[productId] = review
    else delete next[productId]
    return next
  })
}
```

The product card receives the current review and emits the next one. It does not decide what happens to the overall dashboard.

## Kit Builder And Cart Flow

The kit builder has two main paths:

- Premade kits.
- Make-your-own kits.

Both use local cart state and an order confirmation modal. The page owns the cart array, while the cart component displays the items and totals.

Adding an item merges duplicates by increasing quantity:

```js
function handleAdd(product, quantity) {
  setCartItems((items) => {
    const existing = items.find((item) => item.id === product.id)
    if (existing) {
      return items.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      )
    }
    return [...items, { ...product, quantity }]
  })
}
```

The cart calculates totals from the items it receives:

```js
const total = items.reduce(
  (sum, item) => sum + item.price * item.quantity * kitCount,
  0,
)
```

The teacher can also add components to an existing order. That route includes the current order in the cart as a locked base item, then lets the teacher add more catalog items around it.

## CSV And XLSX Import

The import flow is shared by the teacher dashboard, make-your-own kit page, special request forms, and admin order dashboard. The UI surface can be different, but the process is the same:

1. The user uploads a CSV/XLSX file.
2. `ProductImportPanel` checks the file and sends it to the parser.
3. `orderSheetParser.js` normalizes rows into products.
4. The page decides what to do with those products: preview them, put them in a cart, or save them to an order.

The parser lives in:

```text
src/lib/orderSheetParser.js
```

`ProductImportPanel` handles the common upload behavior. It is reused anywhere the app needs a product-sheet import, so the parsing rules stay consistent.

```js
if (file.size > maxFileSizeMb * 1024 * 1024) {
  setError(`This file is too large. Please upload a CSV or XLSX under ${maxFileSizeMb} MB.`)
  event.target.value = ''
  return
}
```

Then it sends the file to the parser:

```js
const result = await parseOrderSheetFile(file)
onImport(result)
```

The parser reads the file as an `ArrayBuffer`, then routes by file type:

```js
export async function parseOrderSheetFile(file) {
  if (!file) {
    throw new Error('Choose a CSV or XLSX file to import.')
  }

  const arrayBuffer = await file.arrayBuffer()
  return parseOrderSheetBuffer(arrayBuffer, file.name)
}
```

The entry point prefers the newer template format when the expected headers are present. If those headers are missing, it falls back to the earlier prototype parser.

```js
export async function parseOrderSheetBuffer(arrayBuffer, fileName = 'order-sheet') {
  const lowerName = fileName.toLowerCase()

  if (lowerName.endsWith('.csv')) {
    const text = new TextDecoder().decode(arrayBuffer)
    const rows = parseCsvRows(text)
    return buildTemplateProducts(rows, fileName) ?? buildProducts(rows, new Map(), fileName)
  }

  if (lowerName.endsWith('.xlsx')) {
    const { rows, imagesByRow } = await parseXlsxRows(arrayBuffer)
    return buildTemplateProducts(rows, fileName) ?? buildProducts(rows, imagesByRow, fileName)
  }

  throw new Error('Please upload a CSV or XLSX file.')
}
```

The template format is strict enough to be predictable, but still simple for a school or admin to fill in:

```js
export const ORDER_TEMPLATE_HEADERS = [
  'quote_row',
  'name',
  'subtitle',
  'variant',
  'pcs_per_kit',
  'order_quantity',
  'unit_price_dkk',
  'pack',
  'supplier_link',
  'status',
  'customer_reply_status',
  'customer_reply_comment',
]
```

Template rows become normalized product objects. The same shape is then usable by the dashboard cards, cart, CSV export, and Supabase import flow.

```js
products.push({
  id: `template-${row.number}-${slugify(name)}`,
  name,
  subtitle: getRowValue(row, headerMap, 'subtitle') || 'Imported product',
  status,
  pcsPerKit,
  price: unitPriceDkk ?? 0,
  currency: 'DKK',
  orderQuantity: orderQuantity ?? pcsPerKit,
  quoteRow,
  variant: getRowValue(row, headerMap, 'variant'),
  pack: getRowValue(row, headerMap, 'pack'),
  supplierLink: getRowValue(row, headerMap, 'supplier_link'),
})
```

The fallback parser still supports the earlier spreadsheet shape. It looks for a header row containing `Name` and `Amount`, reads product name, quantity, and USD price, then converts price to DKK:

```js
const USD_TO_DKK_RATE = 6.5

function convertUsdToDkk(amount) {
  return Number((amount * USD_TO_DKK_RATE).toFixed(2))
}
```

It also looks for kit count text like `30 kits in total`:

```js
const KIT_COUNT_PATTERN = /(\d+)\s*kits?\s+in\s+total/i
```

XLSX files use `JSZip` because an `.xlsx` file is a zip archive containing XML files. The parser reads the first worksheet, shared strings, links, and embedded images, then converts the rows into the same product format as CSV. The important point is that all import paths end with the same normalized product list.

## Help, Notifications, And Shared UI

Several UI components repeat the same pattern: they are small, prop-driven controls used by many pages. They do not own the business logic. They make actions look and behave consistently while pages decide what the action means.

`HelpTooltip` wraps a `?` icon and reveals short guidance on hover or keyboard focus. It is used for repeated metrics like components checked, components approved, total kits, progress, and pricing.

```jsx
<HelpTooltip label="Components checked help">
  Components reviewed so far.
</HelpTooltip>
```

`ConfirmDialog` and `UndoToast` work together for delete flows. The dialog asks for confirmation. The toast gives the user a recovery window. The page owns the selected customer and the timer.

```jsx
{pendingDelete ? (
  <ConfirmDialog
    title={`Delete ${pendingDelete.name}?`}
    description="This customer will be hidden from the client list. You can undo the deletion for a short time after confirming."
    confirmLabel="Delete customer"
    onCancel={() => setPendingDelete(null)}
    onConfirm={handleConfirmDelete}
  />
) : null}

{undoToast ? (
  <UndoToast
    message={`${undoToast.name} deleted.`}
    onAction={handleUndoDelete}
    onClose={handleDismissUndo}
  />
) : null}
```

`SearchFilterPanel`, `FilterPill`, and `SortSelect` all support list controls. They render the controls, while the page owns the actual filtering and sorting rules.

```jsx
<SortSelect
  value={sortValue}
  options={SORT_OPTIONS}
  onChange={setSortValue}
/>
```

`ViewModeToggle` is used wherever products or kits can be shown as a list or as cards. It uses image assets from `public/` for selected and unselected states:

```jsx
<ViewButton
  active={view === 'grid'}
  icon="Grid.png"
  selectedIcon="Grid selected.png"
  onClick={() => onViewChange('grid')}
  label="Show card view"
/>
```

## Styling

The project uses Tailwind CSS 4 with theme tokens in `src/index.css`:

```css
@theme {
  --color-background: #d7dfdc;
  --color-background-secondary: #e7f0ed;
  --color-background-third: #a9c6bb;

  --color-text: #1f2034;
  --color-accent-1: #9fce72;
  --color-accent-2: #fc3154;

  --font-headline: 'Bungee', cursive;
  --font-body: 'Roboto', system-ui, sans-serif;
}
```

Class names are composed with `cn()`, which combines `clsx` and `tailwind-merge`:

```js
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

Buttons use a central variant map in `components/ui/buttonStyles.js`. The same `buttonClassName` helper is also used on links that need button styling.

## Post Hand-In Changes

The first hand-in version focused on the frontend prototype: local data, in-browser state, admin/customer workflows, CSV/XLSX parsing, product review, cart building, and UI behavior.

After hand-in, two larger system features were added:

1. Multiple active orders per school.
2. Supabase persistence.

These are important additions, so they are separated here from the original walkthrough above.

### Multiple Active Orders

Originally, a university mostly revolved around `university.kit`, meaning one current kit. The newer structure allows a school to have more than one active order at the same time:

```js
activeOrders: [
  {
    id: 'order-dtu-2026-iot',
    name: '2026 IoT Systems Kit',
    quoteId: '5601',
    status: UNIVERSITY_STATUS.ACTIVE_ORDER,
  },
  {
    id: 'order-dtu-2026-power',
    name: '2026 Power Electronics Kit',
    quoteId: '5602',
    status: UNIVERSITY_STATUS.REQUIRES_CHANGES,
  },
]
```

The `kit` field remains as a compatibility alias for the first active order:

```js
const activeOrders = getActiveOrders(university)
const primaryOrder = activeOrders[0] ?? university.kit

return {
  ...university,
  kit: primaryOrder,
  activeOrders,
}
```

The teacher orders page now renders all active orders:

```jsx
{activeOrders.map((order) => (
  <CustomerOrderCard
    key={order.id}
    order={order}
    status={order.status ?? UNIVERSITY_STATUS.ACTIVE_ORDER}
    isActive
    variant="compact"
    onExportCsv={() => exportOrderCsv(university, order, order.products ?? [])}
    dashboardHref={`/orders/${university.loginCode}/dashboard/${order.id}`}
  />
))}
```

The dashboard route now includes `orderId`, so each order opens its own dashboard and product list:

```jsx
<Route path="dashboard" element={<CustomerKitDashboardPage />} />
<Route path="dashboard/:orderId" element={<CustomerKitDashboardPage />} />
<Route path="dashboard/:orderId/add-components" element={<AddComponentsPage />} />
```

The selected order is resolved from the URL:

```js
const selectedOrder = orderId
  ? findUniversityOrder(university, orderId)
  : getPrimaryActiveOrder(university)
```

Creating a kit from premade kits, custom kits, special requests, add-components, or reorder now adds a new active order instead of blocking creation:

```js
const createActiveOrder = useCallback(async (universityId, orderInput) => {
  const orderDraft = createOrderFromRequest(orderInput)
  const order = {
    ...orderDraft,
    products: orderDraft.products.map((product) => ({
      ...product,
      orderId: orderDraft.id,
      universityId,
    })),
  }

  const savedOrder = hasSupabaseConfig
    ? await createOrderWithProducts(universityId, order)
    : order

  setAllUniversities((prev) =>
    prev.map((uni) => {
      if (uni.id !== universityId) return uni

      const activeOrders = [...getActiveOrders(uni), savedOrder]
      return {
        ...uni,
        status: UNIVERSITY_STATUS.ACTIVE_ORDER,
        kit: activeOrders[0],
        activeOrders,
        lastUpdatedAt: new Date().toISOString(),
      }
    }),
  )

  return savedOrder.id
}, [])
```

Admin screens also reflect this. Customer cards show active-order counts and quote pills. The school detail page shows each active order as a collapsible card, with contact information moved above the order cards because it belongs to the school, not to a specific order.

### Supabase Persistence

Supabase support was added after hand-in. The app still runs without Supabase, but if `.env.local` contains valid keys, `UniversitiesContext` loads from the database.

The frontend client is created in `src/lib/supabaseClient.js`:

```js
const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey)

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseKey)
  : null
```

The schema lives in `supabase/schema.sql`. The main tables are `universities`, `orders`, `products`, and `kit_catalog_products`.

```sql
create table if not exists public.orders (
  id text primary key,
  university_id text not null references public.universities(id) on delete cascade,
  name text not null,
  quote_id text,
  status text not null,
  stats jsonb not null default '{}'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  progress_step integer default 0,
  archived_at timestamptz
);

create table if not exists public.products (
  id text primary key,
  university_id text not null references public.universities(id) on delete cascade,
  order_id text references public.orders(id) on delete cascade,
  name text not null,
  status text not null,
  quote_row integer,
  order_quantity integer,
  supplier_link text,
  customer_reply jsonb
);
```

The repository loads nested data and reshapes it for the UI:

```js
export async function fetchUniversities() {
  const { data, error } = await supabase
    .from('universities')
    .select('*, orders(*, products(*))')
    .order('last_updated_at', { ascending: false })
    .order('created_at', { referencedTable: 'orders', ascending: true })

  if (error) throw error
  return (data ?? []).map(shapeUniversity)
}
```

The shape function separates active and previous orders:

```js
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
```

Orders and products are written through repository helpers. Creating an order inserts the order and its products together:

```js
export async function createOrderWithProducts(universityId, order) {
  const { data, error } = await supabase
    .from('orders')
    .insert(mapOrderToDb(order, universityId))
    .select('*, products(*)')
    .single()

  if (error) throw error

  const products = (order.products ?? []).map((product) =>
    mapProductToDb(product, universityId, data.id),
  )

  if (products.length > 0) {
    const { error: productsError } = await supabase
      .from('products')
      .insert(products)

    if (productsError) throw productsError
  }

  return mapOrderFromDb({ ...data, products })
}
```

Admin product import merges into a selected order. It matches by quote row first and product name second, and does not delete existing rows:

```js
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
```

### Supabase Setup

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_or_publishable_key_here
```

Create `.env.seed.local` in the project root:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

In Supabase, the keys are found under:

```text
Project Settings -> API
```

Use the service role key only for local seeding. Do not put it in frontend code.

After running the SQL in `supabase/schema.sql`, seed the database with:

```bash
npm run seed:supabase
```

The seed script reads the current Danish university demo data, orders, products, and catalog products, then upserts them into Supabase.

### CSV Template And Real CSV Exports

CSV export buttons now create real browser downloads:

```js
export function exportOrderCsv(university, order, products) {
  downloadCsv(
    `${university.name}-${order.name}`.replaceAll(' ', '-').toLowerCase(),
    buildOrderCsvRows({ university, order, products }),
  )
}
```

The template download uses shared headers:

```js
export const ORDER_TEMPLATE_HEADERS = [
  'quote_row',
  'name',
  'subtitle',
  'variant',
  'pcs_per_kit',
  'order_quantity',
  'unit_price_dkk',
  'pack',
  'supplier_link',
  'status',
  'customer_reply_status',
  'customer_reply_comment',
]
```

The template is generated in the browser, so it does not require Supabase Storage:

```js
export function downloadProductTemplateCsv({
  filename = 'product-import-template',
  quoteRow = '',
} = {}) {
  downloadCsv(filename, [
    Object.fromEntries(
      ORDER_TEMPLATE_HEADERS.map((header) => [
        header,
        getTemplateValue(header, quoteRow),
      ]),
    ),
  ])
}
```

SKU numbers were removed after hand-in. The workflow now uses quote row, product name, supplier link, quantity, status, and customer reply as the relevant sourcing data.

## Project Structure

```text
src/
  components/       Reusable UI and workflow components
  context/          UniversitiesProvider and context value
  data/             Local fallback demo data
  hooks/            Login-code lookup, debounced search, catalog loading
  lib/              Supabase client, repositories, CSV, parser, formatting helpers
  pages/            Route-level screens
supabase/
  schema.sql        Prototype database schema and RLS policies
scripts/
  seedSupabase.mjs  Local seed script for Supabase
```

## Current Limits

This is still a prototype. Supabase gives the project persisted demo data, but the RLS policies in `supabase/schema.sql` are prototype-friendly and permissive. Production would need Supabase Auth or another backend auth layer.

Admin password checking still happens in the browser. School login codes are still checked in the browser. Some review and submit actions remain workflow demonstrations rather than full logistics automation.

## Next Technical Steps

Good next steps would be:

- Replace prototype RLS policies with auth-based policies.
- Move admin authentication out of the frontend.
- Decide whether school login codes should become invite links or authenticated accounts.
- Add automated tests for CSV parsing, Supabase mappers, order creation, and product merging.
- Add production API rules for quote updates, customer replies, and kit progress changes.
