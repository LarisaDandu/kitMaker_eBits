# eBits Kit Maker

This project is a React and Vite prototype for the eBits kit ordering workflow. It covers two user groups:

- eBits staff, who manage schools, kit orders, quotes, products, and progress.
- School contacts, who review kit components, request changes, and create new kit orders.

The first hand-in version was fully local. It used seed data from `src/data/` and kept changes in React state for the current browser session. After hand-in, Supabase support was added so the same prototype can also run with persisted demo data when local environment keys are present. If Supabase is not configured, the app still falls back to the local seed data.

## Running the project

Install dependencies and start the local development server:

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

## Login

The first screen is the login page. It has two modes:

- Admin login: password is `admin`, then the app routes to `/admin`.
- School login: the entered code is matched against `loginCode`, then the app routes to `/orders/:loginCode`.

Example school login codes in the current seed data include:

```text
DTU-2026
AAU-2026
SDU-2026
AU-2026
KU-2026
```

These checks still happen in the browser. For production, admin authentication and school access should move to a backend/Auth flow.

## Main routes

Routes are defined in `src/App.jsx`. The whole app is wrapped in `UniversitiesProvider`, so admin and school screens can use the same university/order state.

```jsx
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
    <Route path="/admin" element={<AdminLayout />} />
    <Route path="/" element={<LoginPage />} />
  </Routes>
</UniversitiesProvider>
```

The dashboard supports both `/dashboard` and `/dashboard/:orderId`. The route without an id stays as a compatibility route and opens the first active order.

## Data model

The current model supports multiple active kit orders for the same school.

Each university can have:

- `activeOrders`: current kit orders.
- `previousOrders`: inactive or archived kit orders.
- `kit`: compatibility alias for the first active order.

The helper below keeps old and new data shapes working together:

```js
export function getActiveOrders(university) {
  if (!university) return []
  const activeOrders = university.activeOrders?.length
    ? university.activeOrders
    : university.kit
      ? [university.kit]
      : []

  return activeOrders.map((order) =>
    order.status
      ? order
      : {
          ...order,
          status: university.status ?? UNIVERSITY_STATUS.ACTIVE_ORDER,
        },
  )
}
```

Products belong to a specific `orderId`, not only to a school. This keeps product lists separated when a school has two or more active orders.

## State and Supabase

The main state container is `src/context/UniversitiesContext.jsx`.

When Supabase keys are available, it loads schools, orders, and products from Supabase. When keys are missing, it uses local seed data.

```js
const [isLoading, setIsLoading] = useState(hasSupabaseConfig)

const loadUniversities = useCallback(async () => {
  if (!hasSupabaseConfig) return

  setIsLoading(true)
  setError('')
  try {
    setAllUniversities(await fetchUniversities())
  } catch (loadError) {
    setError(loadError.message ?? 'Could not load Supabase data.')
  } finally {
    setIsLoading(false)
  }
}, [])
```

Repository files in `src/lib/repositories/` map Supabase rows back into the shape used by the UI:

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

## Supabase setup

Create these local files in the project root. Do not commit them.

`.env.local`

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_or_publishable_key_here
```

`.env.seed.local`

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

In Supabase, the keys are under:

```text
Project Settings -> API
```

Use:

- Project URL for `VITE_SUPABASE_URL`
- anon/publishable key for `VITE_SUPABASE_PUBLISHABLE_KEY`
- service role key for `SUPABASE_SERVICE_ROLE_KEY`

The service role key is only for local seeding. It must not be used in frontend code.

The schema lives in:

```text
supabase/schema.sql
```

The main tables are:

```sql
create table if not exists public.universities (
  id text primary key,
  name text not null,
  login_code text not null unique,
  status text not null,
  deleted_at timestamptz
);

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

After creating the tables, seed the database:

```bash
npm run seed:supabase
```

The seed script reads the current Danish university demo data, active/previous orders, products, and catalog products, then upserts them into Supabase.

## Admin workflow

The admin overview starts at `/admin`. Staff can:

- Search and filter customers.
- See how many active orders each school has.
- See quote pills, including `Quote 5801 - Requires Changes` when an order or school needs changes.
- Create, edit, soft-delete, and restore customers.
- Open a school dashboard.

The school dashboard shows contact information at the top beside edit/delete actions. Each active order appears as a collapsible card, so staff can open one order without losing space for the next.

Inside an expanded order, staff can:

- View progress and pricing.
- Search/filter product rows.
- Download a CSV template.
- Upload CSV/XLSX product data.
- Preview the imported product count.
- Save imported products into Supabase.

Admin imports merge into the selected order. They match existing products by quote row first, then product name. Existing products are not deleted during a merge.

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

## School workflow

The school side starts at `/orders/:loginCode`.

Schools can:

- See all active orders, one card per order.
- See previous orders below the active orders.
- Export CSV for a specific order.
- Open the dashboard for a specific active order.
- Review components, approve them, reject them, request changes, and leave comments.
- Create new kit orders even when another active order already exists.
- Reorder from a previous order.
- Add components to an existing kit order.

The active order list uses compact cards. The detailed metrics stay inside the individual dashboard where there is room for review progress and product cards.

```jsx
{activeOrders.map((order) => (
  <CustomerOrderCard
    key={order.id}
    order={order}
    status={order.status ?? UNIVERSITY_STATUS.ACTIVE_ORDER}
    variant="compact"
    onExportCsv={() => exportOrderCsv(university, order, order.products ?? [])}
    dashboardHref={`/orders/${university.loginCode}/dashboard/${order.id}`}
  />
))}
```

Creating a kit goes through one context action:

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
      return { ...uni, kit: activeOrders[0], activeOrders }
    }),
  )
}, [])
```

## CSV import and export

CSV export buttons now create browser downloads instead of demo alerts.

```js
export function exportOrderCsv(university, order, products) {
  downloadCsv(
    `${university.name}-${order.name}`.replaceAll(' ', '-').toLowerCase(),
    buildOrderCsvRows({ university, order, products }),
  )
}
```

The CSV template headers are shared by admin and teacher import surfaces:

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

The parser prefers this template format when the headers are present. Legacy CSV/XLSX imports still work as a fallback for the earlier prototype format.

```js
if (lowerName.endsWith('.csv')) {
  const text = new TextDecoder().decode(arrayBuffer)
  const rows = parseCsvRows(text)
  return buildTemplateProducts(rows, fileName) ?? buildProducts(rows, new Map(), fileName)
}
```

SKU numbers were removed from the project. They are not part of the template, product cards, cart display, exports, Supabase schema, or import matching. The useful sourcing references are quote row, product name, supplier link, quantity, status, and customer reply.

## UI notes

The UI uses Tailwind CSS 4 with theme tokens in `src/index.css`.

```css
@theme {
  --color-background: #d7dfdc;
  --color-background-secondary: #e7f0ed;
  --color-background-third: #a9c6bb;
  --color-text: #1f2034;
  --color-accent-1: #9fce72;
  --color-accent-2: #fc3154;
}
```

Shared UI pieces include:

- `Button` and `buttonClassName`
- `SearchFilterPanel`
- `SortSelect`
- `FilterPill`
- `HelpTooltip`
- `ConfirmDialog`
- `UndoToast`
- `TeacherBackButton`
- `ViewModeToggle`

The list/grid controls use image assets from `public/` for selected and unselected states:

```jsx
<ViewButton
  active={view === 'grid'}
  icon="Grid.png"
  selectedIcon="Grid selected.png"
  onClick={() => onViewChange('grid')}
  label="Show card view"
/>
```

## Project structure

```text
src/
  components/       Reusable UI and workflow components
  context/          UniversitiesProvider and context value
  data/             Local fallback demo data
  hooks/            Small hooks such as login-code lookup and debounced values
  lib/              Supabase client, repositories, CSV, parser, formatting helpers
  pages/            Route-level screens
supabase/
  schema.sql        Prototype database schema and RLS policies
scripts/
  seedSupabase.mjs  Local seed script for Supabase
```

## Current limits

This is still a prototype. Supabase gives the project real persisted demo data, but the security model is intentionally permissive for local development. The RLS policies in `supabase/schema.sql` allow prototype reads and writes. Production would need Supabase Auth or another backend auth layer.

Admin password checking still happens in the browser. School login codes are still checked in the browser. Some review and submit actions are still workflow demonstrations rather than full logistics automation.

## Next technical steps

Good next steps would be:

- Replace prototype RLS policies with auth-based policies.
- Move admin authentication out of the frontend.
- Decide whether school login codes should become invite links or authenticated accounts.
- Add automated tests for CSV parsing, Supabase mappers, order creation, and product merging.
- Add production API rules for quote updates, customer replies, and kit progress changes.
