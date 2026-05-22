# eBits Kit Maker

This project is a React and Vite prototype for the eBits kit ordering workflow. It covers two main user groups: eBits staff, who manage university customers and kit progress, and university contacts, who review orders or build new kits from a catalog.

There is no backend in this version. The app uses static seed data from `src/data/`, then keeps changes in React state for the current browser session. That means customer creation, editing, soft deletion, kit progress, product review choices, cart contents, imported spreadsheets, and undo notifications all work in the UI, but they reset when the app reloads.

## Running the project

Install dependencies and start the local development server:

```bash
npm install
npm run dev
```

Useful scripts:

```bash
npm run build
npm run preview
npm run lint
```

The Vite base path is configured for GitHub Pages at `/kitMaker_eBits/`, so local URLs usually look like:

```text
http://localhost:5173/kitMaker_eBits/
```

## How the website functions

The first screen is the login page. It has two modes: university login and admin login. Admin login uses the password `admin` and sends the user to `/admin`. University login checks the entered school code against each university's `loginCode` in `src/data/universities.js`, then sends the user to `/orders/:loginCode`.

Example seed codes include:

```text
BUS-A1B2
ACA-C3D4
```

The admin side starts at `/admin`. Staff can view customers, search, filter, sort, create or edit universities, open a customer dashboard, advance a kit through its progress steps, and delete a customer with confirmation. Deletion is a soft delete first: the customer disappears from the visible list, a toast appears, and the user has a short window to undo it. If they do not undo, the customer is removed from the in-memory state.

The university side starts at `/orders/:loginCode`. The customer can see current and previous orders, open the dashboard for the active order, review components, and go into the kit builder. The kit builder has two paths: premade kits and make-your-own kits. Both use local cart state and confirmation modals. The make-your-own flow can also import a CSV or XLSX sheet and turn it into cart/product data.

## Main architecture

The app is organized around routes, pages, context, data modules, utility functions, and mostly prop-driven components.

`src/App.jsx` defines the route tree. Admin routes and order routes each get wrapped in `UniversitiesProvider`, which gives those screens access to the in-memory university state. The login page does not need that provider because it reads directly from seed data.

```jsx
function OrdersLayout() {
  return (
    <UniversitiesProvider>
      <Outlet />
    </UniversitiesProvider>
  )
}

<Route path="/orders/:loginCode" element={<OrdersLayout />}>
  <Route index element={<CustomerOrdersPage />} />
  <Route path="dashboard" element={<CustomerKitDashboardPage />} />
  <Route path="kit-builder/custom" element={<MakeYourOwnKitPage />} />
</Route>
```

Most files in `src/components/` are intentionally simple. They are close to glorified widgets: styled building blocks that receive data through props, render it, and call callbacks when the user interacts with them. They do not own the main business rules. A card component may show a delete button, but the decision about what deletion means lives higher up in a page or in context. A product list may render filtered products, but the filter logic belongs to the page.

That split is visible in the admin customer list. `UniversityList` renders whatever universities it receives. It does not know how search works, how sorting works, or how deletion is implemented.

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
        universities.map((university) => (
          <UniversityCard
            key={university.id}
            university={university}
            onDelete={(id) => onDelete(id, university.name)}
          />
        ))
      )}
    </section>
  )
}
```

The page decides which customers are visible:

```js
const filteredUniversities = useMemo(
  () =>
    filterUniversities(
      universities,
      debouncedSearchQuery,
      activeFilter,
      sortValue,
    ),
  [universities, debouncedSearchQuery, activeFilter, sortValue],
)
```

This keeps the components reusable without putting domain logic inside them. `SearchFilterPanel`, `SortSelect`, `FilterPill`, `ConfirmDialog`, `UndoToast`, and `HelpTooltip` are shared UI pieces. They handle markup, styling, and small interaction details, while pages decide what the data means.

## Data and state

The static demo data lives in:

```text
src/data/universities.js
src/data/products.js
src/data/kitMakerProducts.js
src/data/kits.js
```

`universities.js` contains school records, login codes, addresses, current kit information, pricing, progress, and previous orders. `products.js` contains product rows connected to a university by `universityId`. `kitMakerProducts.js` is the catalog used for the make-your-own kit flow. `kits.js` stores the labels for the status timeline.

The main state container is `src/context/UniversitiesContext.jsx`. It starts by adding session metadata to the seed universities:

```js
function withMetadata(universities) {
  const initialTimestamp = new Date().toISOString()

  return universities.map((university) => ({
    ...university,
    lastUpdatedAt: initialTimestamp,
    deletedAt: null,
  }))
}
```

The provider stores every university in `allUniversities`, then exposes only non-deleted records:

```js
const [allUniversities, setAllUniversities] = useState(() =>
  withMetadata(seedUniversities),
)

const universities = useMemo(
  () => allUniversities.filter((uni) => !uni.deletedAt),
  [allUniversities],
)
```

That is why soft delete is possible. The university is not immediately removed from memory. It gets a `deletedAt` timestamp, drops out of normal lists, and can still be restored by the undo toast.

```js
const softDeleteUniversity = useCallback((id) => {
  const deletedAt = new Date().toISOString()
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

The hard removal is a separate operation:

```js
const removeUniversity = useCallback((id) => {
  setAllUniversities((prev) => prev.filter((uni) => uni.id !== id))
}, [])
```

So deletion has two stages in the prototype: hide the customer first, then remove it after the undo window has passed. In a backend version, this could become either a recoverable delete status or a normal delete endpoint with an undo strategy on top.

## Login and routing

The login page has local form state. For admin, it checks the password directly. For university login, it searches the seed universities for a matching code and routes to the order area.

The customer pages use the URL code to find the active school:

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

This hook is the bridge between the route and the data model. A wrong login code gives the customer an "Order not found" style screen instead of crashing.

The teacher account menu is another small routing feature. It lives close to the school name on teacher pages and links back to the right places using the current `loginCode`: sign out goes to `/`, dashboard goes to `/orders/:loginCode/dashboard`, and orders goes to `/orders/:loginCode`.

## Admin workflow

The admin overview is a local client-management screen. It supports search, status filters, sorting, empty states, timestamps, confirmation dialogs, and undoable deletion. The search is debounced so the UI can show a short "Searching..." state before the filtered list updates.

The filtering function is plain JavaScript:

```js
function filterUniversities(list, searchQuery, statusFilter, sortValue) {
  const query = searchQuery.trim().toLowerCase()

  const filtered = list.filter((uni) => {
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

  return [...filtered].sort((a, b) => {
    if (sortValue === 'name') return a.name.localeCompare(b.name)
    if (sortValue === 'status') return a.status.localeCompare(b.status)
    if (sortValue === 'progress') {
      return (b.kit.progressStep ?? 0) - (a.kit.progressStep ?? 0)
    }
    return new Date(b.lastUpdatedAt ?? 0) - new Date(a.lastUpdatedAt ?? 0)
  })
}
```

There is no search library involved. The code normalizes the query, checks the fields that matter for this screen, then sorts the result.

Delete no longer uses a native `window.confirm`. The page stores the pending customer, opens `ConfirmDialog`, soft-deletes after confirmation, then shows `UndoToast`.

```js
function handleConfirmDelete() {
  if (!pendingDelete) return

  softDeleteUniversity(pendingDelete.id)
  showUndoToast(pendingDelete)
  setPendingDelete(null)
}
```

The toast starts an eight-second timer. Undo clears the timer and restores the customer. Dismissing the toast removes the customer immediately.

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

The customer detail page shows the same idea from a different route. If a customer is deleted from detail view, the app navigates back to `/admin` and passes the deleted customer through route state so the overview can show the undo toast.

## Kit progress

Kit progress is controlled by one number: `progressStep`. The labels live in `src/data/kits.js`, and the stats for each step are generated in `src/lib/kitProgress.js`.

When staff click "Advance order", context updates only the matching university:

```js
const advanceKitOrder = useCallback((id) => {
  setAllUniversities((prev) =>
    prev.map((uni) => {
      if (uni.id !== id) return uni

      const maxStep = getMaxKitProgressStep()
      const currentStep = uni.kit.progressStep ?? 0
      if (currentStep >= maxStep) return uni

      const nextStep = currentStep + 1
      const { stats } = uni.kit

      return {
        ...uni,
        lastUpdatedAt: new Date().toISOString(),
        status:
          nextStep >= maxStep
            ? UNIVERSITY_STATUS.ACTIVE_ORDER
            : nextStep >= 2
              ? UNIVERSITY_STATUS.REQUIRES_CHANGES
              : uni.status,
        kit: {
          ...uni.kit,
          progressStep: nextStep,
          stats: getStatsForProgressStep(
            nextStep,
            stats.totalComponents,
            stats.totalKits,
          ),
        },
      }
    }),
  )
}, [])
```

The UI does not store a separate "current step" state. `KitProgress` derives each node from the number:

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

If the progress number changes, the visual state follows from that number.

## Product review dashboard

The teacher dashboard shows products for one university. Products come from `src/data/products.js`, but review choices are held in page state. Seed data can include `customerReply`, and the dashboard turns those replies into an initial `reviews` object:

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

When a user approves, rejects, or requests changes, the page updates the `reviews` object. The product card is still just a widget. It displays the current state and calls `onApply` when the user commits a choice.

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

The dashboard also supports searching, filtering by review status, and sorting by quote row, name, or status. Like the admin screen, the search input uses a debounced value:

```js
const [searchQuery, setSearchQuery] = useState('')
const debouncedSearchQuery = useDebouncedValue(searchQuery)
```

The hook itself is small:

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

That small delay is what lets the UI show "Searching..." before replacing the visible results.

## Kit builder

The kit-builder pages are local cart flows. They do not persist orders, but they model the structure of the interaction: choose products, update quantities, review an order modal, and confirm.

Adding a product merges duplicate rows by increasing quantity:

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

The make-your-own and add-components pages filter by category first, then by search text and price band. They can sort by name, lowest price, or highest price. Premade kits use a similar pattern, with sorting by name, price, or component count.

The cart components calculate totals from the items they receive. The pages decide what goes into the cart; the cart widget decides how to display it.

## Importing CSV and XLSX files

The parser is in `src/lib/orderSheetParser.js`. It accepts `.csv` and `.xlsx` files, reads them in the browser, extracts product rows, and returns a normalized object:

```js
{
  fileName,
  kitCount,
  products,
}
```

`ProductImportPanel` checks file size before parsing. The default limit is 5 MB:

```js
if (file.size > maxFileSizeMb * 1024 * 1024) {
  setError(
    `This file is too large. Please upload a CSV or XLSX under ${maxFileSizeMb} MB.`,
  )
  event.target.value = ''
  return
}
```

After validation, the file is read as an `ArrayBuffer` and handed to the parser:

```js
export async function parseOrderSheetFile(file) {
  if (!file) {
    throw new Error('Choose a CSV or XLSX file to import.')
  }

  const arrayBuffer = await file.arrayBuffer()
  return parseOrderSheetBuffer(arrayBuffer, file.name)
}
```

The entry point branches by extension:

```js
export async function parseOrderSheetBuffer(arrayBuffer, fileName = 'order-sheet') {
  const lowerName = fileName.toLowerCase()

  if (lowerName.endsWith('.csv')) {
    const text = new TextDecoder().decode(arrayBuffer)
    return buildProducts(parseCsvRows(text), new Map(), fileName)
  }

  if (lowerName.endsWith('.xlsx')) {
    const { rows, imagesByRow } = await parseXlsxRows(arrayBuffer)
    return buildProducts(rows, imagesByRow, fileName)
  }

  throw new Error('Please upload a CSV or XLSX file.')
}
```

CSV parsing is done manually because the expected format is simple. The parser walks each character, tracks whether it is inside quotes, handles escaped double quotes, splits on commas outside quotes, and handles both Unix and Windows line endings.

```js
function parseCsvRows(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim())
      cell = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  row.push(cell.trim())
  if (row.some(Boolean)) rows.push(row)

  return rows.map((values, index) => ({
    number: index + 1,
    cells: values.reduce((cells, value, cellIndex) => {
      const column = String.fromCharCode(65 + cellIndex)
      cells[column] = { value, link: '' }
      return cells
    }, {}),
    values,
  }))
}
```

XLSX parsing is more involved. `.xlsx` files are zip archives, so the code uses `JSZip` to read XML files inside the workbook. It reads workbook metadata, finds the first sheet, reads shared strings, follows relationship files, extracts hyperlinks, and looks for embedded images attached to rows.

The helper functions work with XML by local tag name because Excel XML often uses namespace prefixes:

```js
function getLocalName(element) {
  return element.localName || element.nodeName.split(':').pop()
}

function elementsByName(root, localName) {
  return Array.from(root.getElementsByTagName('*')).filter(
    (element) => getLocalName(element) === localName,
  )
}
```

Shared strings are important because Excel may store text in a central string table instead of directly in each cell:

```js
function getCellText(cell, sharedStrings) {
  const type = cell.getAttribute('t')
  const valueNode = firstChildByName(cell, 'v')

  if (type === 's') {
    const index = Number.parseInt(valueNode?.textContent ?? '', 10)
    return sharedStrings[index] ?? ''
  }

  if (type === 'inlineStr') {
    return Array.from(cell.getElementsByTagName('t'))
      .map((node) => node.textContent)
      .join('')
  }

  return valueNode?.textContent ?? ''
}
```

Embedded images are extracted by reading the sheet's drawing relationships. The parser maps image blobs back to Excel row numbers and creates browser object URLs for display:

```js
const bytes = await imageFile.async('uint8array')
const extension = target.split('.').pop()?.toLowerCase() || 'png'
const mimeType = extension === 'jpg' ? 'image/jpeg' : `image/${extension}`
const imageUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }))
const excelRowNumber = Number.parseInt(row, 10) + 1

imagesByRow.set(excelRowNumber, imageUrl)
```

Once rows are extracted, CSV and XLSX go through the same `buildProducts` function. This is where spreadsheet rows become app products.

```js
function buildProducts(rows, imagesByRow, fileName) {
  const kitCount = findKitCount(rows)
  const headerRowIndex = findHeaderRowIndex(rows)

  if (headerRowIndex === -1) {
    throw new Error('Could not find a header row with Name and Amount columns.')
  }

  const products = []

  for (const row of rows.slice(headerRowIndex + 1)) {
    const name = row.cells.A?.value?.trim() ?? ''
    const variantOrLink = row.cells.B?.value?.trim() ?? ''
    const sku = cleanSku(row.cells.D?.value) || cleanSku(row.cells.C?.value)
    const pcsPerKit = toNumber(row.cells.E?.value)
    const priceUsd = toNumber(row.cells.F?.value)

    if (!name || pcsPerKit == null || priceUsd == null) continue

    products.push({
      id: `import-${row.number}-${slugify(sku || name)}`,
      name,
      subtitle: variant || sku || 'Imported product',
      status: 'pending_review',
      pcsPerKit,
      price: convertUsdToDkk(priceUsd),
      quoteRow: row.number,
      sku,
      variant,
      supplierLink,
      imageUrl,
    })
  }

  if (products.length === 0) {
    throw new Error('No product rows with name, quantity, and price were found.')
  }

  return {
    fileName,
    kitCount,
    products,
  }
}
```

The parser expects a header row containing at least `Name` and `Amount`. It reads product name from column A, variant or link from B, SKU from C or D, quantity from E, and USD price from F. Prices are converted to DKK with a fixed demo exchange rate:

```js
const USD_TO_DKK_RATE = 6.5

function convertUsdToDkk(amount) {
  return Number((amount * USD_TO_DKK_RATE).toFixed(2))
}
```

It also tries to find a kit count in the first few rows using text like `30 kits in total`:

```js
const KIT_COUNT_PATTERN = /(\d+)\s*kits?\s+in\s+total/i
```

The result is used differently depending on the screen. On the customer dashboard, importing a sheet replaces the review cards for that session. In make-your-own kit, importing a sheet replaces the cart with products from the file.

## Help, notifications, and empty states

`HelpTooltip` wraps a `?` icon and reveals guidance on hover or keyboard focus. It is used on metrics like components checked, components approved, total kits, progress, and pricing.

`ConfirmDialog` is the modal used before destructive customer deletion. It receives labels and callbacks, so it is not tied to one feature.

`UndoToast` is the recovery notification after a customer is deleted. It has one action button and one dismiss button. The timer logic stays in the page, not in the toast, because the page owns the deleted customer state.

`SortSelect` is a styled `<select>` used by admin lists, product lists, and kit-builder pages. The sorting rules still live in the page that owns the data.

## Styling

The project uses Tailwind CSS 4 with theme tokens in `src/index.css`. Colors, fonts, backgrounds, and accent colors are defined there:

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

That allows conditional styles while letting `tailwind-merge` resolve duplicate Tailwind classes.

Buttons use a central variant map in `components/ui/buttonStyles.js`. The same `buttonClassName` helper is also used on links that need button styling, since React Router links and real buttons are different elements.

## Implementation notes

Most of the code is straightforward. The important part is where each kind of behavior lives.

Context owns university session state and mutations. Pages own route state, local UI state, filtering, sorting, review overlays, and cart operations. Components render props, style the interface, and emit events upward. The spreadsheet parser owns file interpretation and returns plain product data. Utility files handle formatting, class merging, progress stats, and login-code lookup.

That makes the code easier to trace. If a customer card looks wrong, check the card. If filtering is wrong, check the page helper. If imported products are wrong, check `orderSheetParser.js`. If kit progress is wrong, check the context action and `kitProgress.js`.

## Limits of the current prototype

All persistence is in memory. There is no database, no API layer, and no real authentication. Admin password checking happens in the browser. University login codes are also checked in the browser. Export and submit actions still use demo alerts in places where a real app would call an API.

Those limits are part of the prototype. The data modules can later become API calls, context actions can become mutations, and the page-level filtering can either stay client-side or move server-side depending on data size.

## Suggested next technical steps

The next step would be to define a backend contract for universities, products, review replies, and kit status changes. After that, the `UniversitiesProvider` could be replaced with API-backed state, probably using a query/mutation library. Admin authentication should move out of the frontend. Customer login codes could stay as access links or become part of an invite flow.

For testing, the project currently relies on linting, builds, and browser checks. The first automated tests should cover `orderSheetParser.js`, `kitProgress.js`, and the pure filtering/sorting helpers, because those are the places where bugs would affect data rather than only layout.
