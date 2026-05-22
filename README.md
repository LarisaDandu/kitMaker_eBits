# eBits Kitmaker

Frontend prototype for ordering and managing university electronics kits. React + Vite, no backend yet—data is hard-coded in `src/data/` and kept in memory for the session.

## What you can do in the app

| Who | URL | What it’s for |
|-----|-----|----------------|
| Anyone | `/`, `/about` | Simple public pages |
| eBits staff | `/admin` | Client list, customer details, advance kit status |
| University contact | `/orders/:loginCode` | Their orders, component review, kit builder |

Customer links use a **login code in the URL** (e.g. `/orders/BUS-A1B2/dashboard`). There’s no real login—whoever has the link sees that customer’s demo data.

Try these seed codes from `src/data/universities.js`: `BUS-A1B2`, `ACA-C3D4`.

## Run it locally

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

## Where the real logic lives

Most files under `src/components/` are **UI widgets**: they take props, apply Tailwind classes, and render. They don’t own business rules.

The interesting behavior is split like this:

| Layer | Files | What it does |
|-------|--------|----------------|
| **Seed data** | `src/data/*.js` | Universities, products, kit catalog, status labels |
| **Session state** | `src/context/UniversitiesContext.jsx` | Add/edit/delete customers; bump kit `progressStep` on admin |
| **Helpers** | `src/lib/*.js` | Form mapping, login codes, kit step stats, `cn()`, DKK formatting |
| **Pages** | `src/pages/**/*.jsx` | Wire routes, filters, local state (cart, reviews), pass data into widgets |
| **Hooks** | `src/hooks/*.js` | Look up university by `loginCode` from context |

`window.alert` is used in a lot of places for actions that would hit an API later (export CSV, submit order, logout).

## Project layout

```
src/
├── App.jsx              # All routes
├── data/                # Static JSON-like modules (source of truth for demo)
├── context/             # Universities in React state
├── hooks/               # useUniversities, useUniversityByLoginCode
├── lib/                 # Small pure functions
├── pages/               # One screen per route (admin + customer + public)
└── components/
    ├── ui/              # Button, inputs, shared styles
    ├── admin/           # Header, search bar, filter pills
    ├── kits/            # Kit cards, progress bar, cart, modals
    ├── products/        # Product rows/cards
    └── universities/    # Customer form and list cards
```

Colors and fonts are in `src/index.css` (`@theme` for Tailwind v4).

## Routes (three separate areas)

```jsx
// src/App.jsx — simplified
/orders/:loginCode          → customer portal (UniversitiesProvider)
/admin                      → staff tools (same provider, separate mount)
/                           → public Layout with Home / About
```

`UniversitiesProvider` wraps **only** `/admin` and `/orders/*`, not the whole app. Public pages don’t load that context.

Note: admin and customer each get their **own** provider instance when you navigate between those trees. Edits in admin won’t show on a customer tab you already had open unless you refresh. Fine for a demo; you’d use one provider (or an API) in production.

## Data files

| File | Contents |
|------|-----------|
| `data/universities.js` | Schools, kit info, pricing, `progressStep`, `loginCode`, previous orders |
| `data/products.js` | Components per university (`universityId`), statuses, optional seed replies |
| `data/kitMakerProducts.js` | Catalog for “make your own kit” |
| `data/kits.js` | Labels for the progress timeline |

Products aren’t nested inside a university object. Pages call:

```js
getProductsByUniversity(university.id)  // filter in data/products.js
```

## What pages actually do

**Admin**

- `ClientsOverview` — reads `universities` from context, filters locally, lists cards.
- `UniversityDetailPage` — one customer, products from `products.js`, “Advance order” calls `advanceKitOrder`.
- `CustomerFormPage` — create/edit via `CustomerForm` + `formValuesToUniversity`.

**Customer** (`loginCode` from URL → `useUniversityByLoginCode`)

- `CustomerOrdersPage` — current + previous order cards.
- `CustomerKitDashboardPage` — product grid; review choices live in **page state** (`reviews`), not in `products.js`.
- `MakeYourOwnKitPage` — category filter, cart in **page state**, submit opens a modal.

If the code isn’t in a page, context, or `data/`/`lib/`, it’s probably just presentation.

## Components (honest breakdown)

### Shared UI (`components/ui/`)

- `Button`, `buttonStyles` — variants/sizes; `buttonClassName` also used on `<Link>` on Home.
- `FormField`, `FormInput` — labeled inputs for the customer form.
- `cn()` in `lib/cn.js` — `clsx` + `tailwind-merge` for class strings.

### Reused chrome

- `SearchFilterPanel` — search input + filter pills; parent owns query state and filter logic.
- `SearchFilterBar` — admin wrapper that adds “Create customer”.
- `AdminHeader` — title + logout (demo alert).

### Kit / order widgets (`components/kits/`)

Mostly display `university.kit` or cart props:

- `KitProgress` — draws steps from `KIT_PROGRESS_STEPS` + `progressStep` number.
- `KitOverview`, `KitPrice`, `CustomerOrderCard` — show fields from the kit object.
- `KitMakerCart`, `QuantityStepper` — cart UI; totals calculated in the cart component from props.
- `AdvanceOrderButton` — disabled when step is max; click handled on the page/context.
- Modals — confirm/cancel only.

### Product widgets (`components/products/`)

- `ProductCard` / `ProductList` — admin list styling.
- `CustomerProductCard` — same idea plus approve/reject/changes UI; calls `onApply` up to the dashboard page.

### University widgets (`components/universities/`)

- `UniversityCard`, `UniversityList`, `UniversityInfo` — show/delete/navigate.
- `CustomerForm` — controlled form; submit goes back to the page.

None of these fetch from a server. They receive data from the parent page or from constants in `data/`.

## Behavior worth knowing

### Login code in the URL

```js
// hooks/useUniversityByLoginCode.js
universities.find(
  (item) => item.loginCode.toLowerCase() === loginCode.trim().toLowerCase()
)
```

Wrong or missing code → “Order not found” screen.

### Advancing a kit (admin)

`progressStep` is an index into six strings in `data/kits.js`. Clicking advance increments it and fills stats from presets in `lib/kitProgress.js` (demo numbers, not a real inventory system).

```js
// context/UniversitiesContext.jsx — idea
kit: {
  ...uni.kit,
  progressStep: nextStep,
  stats: getStatsForProgressStep(nextStep, ...),
}
```

`KitProgress` only reads `progressStep` and marks steps complete / current / upcoming.

### Customer reviews

Seed data may include `customerReply` on a product. The dashboard also keeps `reviews` in `useState` so you can approve/reject during the session without editing `products.js`.

### Kit builder cart

`MakeYourOwnKitPage` holds `cartItems`. Adding the same product again increases quantity. Submit shows `OrderOverviewModal`; confirm clears cart and shows an alert.

## Code worth a closer look

These are the parts that do more than “render props.” They’re still small—nothing magic—but they’re written in a way that’s easy to follow and would survive a backend swap later.

### 1. `advanceKitOrder` — one place updates kit + status

Admin “Advance order” runs this in context. It only touches the matching university, bails if already at the last step, and keeps kit totals while swapping in preset stats for the new step.

```js
// src/context/UniversitiesContext.jsx
const advanceKitOrder = useCallback((id) => {
  setUniversities((prev) =>
    prev.map((uni) => {
      if (uni.id !== id) return uni

      const maxStep = getMaxKitProgressStep()
      const currentStep = uni.kit.progressStep ?? 0
      if (currentStep >= maxStep) return uni

      const nextStep = currentStep + 1
      const { stats } = uni.kit

      return {
        ...uni,
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

The demo stats table lives separately so the UI doesn’t invent numbers inline:

```js
// src/lib/kitProgress.js
export function getStatsForProgressStep(step, totalComponents, totalKits) {
  const preset = KIT_STEP_STATS[Math.min(step, KIT_STEP_STATS.length - 1)]
  return {
    checked: preset.checked,
    approved: preset.approved,
    required: preset.required,
    rejected: preset.required,
    totalComponents,
    totalKits,
  }
}
```

### 2. `KitProgress` — one number drives the whole timeline

Step labels come from `data/kits.js`. The component only needs `progressStep` (0–5). Each dot is derived with a simple comparison—no parallel state for “which step is active.”

```jsx
// src/components/kits/KitProgress.jsx
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

Same data feeds admin detail and customer dashboard; only the styling wrapper changes.

### 3. Customer reviews — seed data + session overlay

Products in `products.js` can ship with a `customerReply`. The dashboard also builds a `reviews` object so clicks don’t mutate the seed file.

Bootstrap from seed:

```js
// src/pages/CustomerKitDashboardPage.jsx
function getInitialReviews(products) {
  return products.reduce((reviews, product) => {
    if (product.customerReply) {
      reviews[product.id] = product.customerReply
    }
    return reviews
  }, {})
}
```

Filter “Awaiting approval” checks the overlay, not the product row:

```js
const review = reviews[product.id]
const matchesStatus =
  activeFilter === 'all' ||
  (activeFilter === 'awaiting' && !review?.status) ||
  review?.status === activeFilter
```

Apply / undo stays on the page; the card just calls `onApply`:

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

`CustomerProductCard` is mostly UI, but `CustomerDecision` is a nice self-contained bit: `useId()` for radio groups (so many cards on one page don’t clash), draft state until Apply, then read-only until “Change” clears via `onApply(id, null)`.

### 4. `formValuesToUniversity` — edit form without wiping the kit

Create and edit share one mapper. New customers get a default kit; edits spread the form over the existing record so `kit` and `previousOrders` stay put.

```js
// src/lib/universityUtils.js
export function formValuesToUniversity(form, existing) {
  const base = existing ?? {
    id: generateUniversityId(),
    status: UNIVERSITY_STATUS.REQUIRES_CHANGES,
    kit: createDefaultKit(),
    previousOrders: [],
  }

  return {
    ...base,
    name: form.name.trim(),
    professorName: form.professorName.trim(),
    // ...other fields trimmed the same way
    loginCode: form.loginCode.trim(),
  }
}
```

`updateUniversity` in context is then a one-liner map: `formValuesToUniversity(formValues, uni)`.

### 5. `filterUniversities` — boring on purpose

Search + status filter is a plain function outside the component. Easy to read, easy to test later, wrapped in `useMemo` so the list doesn’t re-filter every render for no reason.

```js
// src/pages/admin/ClientsOverview.jsx
function filterUniversities(list, searchQuery, statusFilter) {
  const query = searchQuery.trim().toLowerCase()

  return list.filter((uni) => {
    const matchesStatus = statusFilter === 'all' || uni.status === statusFilter
    const matchesSearch =
      !query ||
      uni.name.toLowerCase().includes(query) ||
      uni.loginCode?.toLowerCase().includes(query) ||
      uni.kit.name.toLowerCase().includes(query) ||
      uni.kit.quoteId.includes(query)
      // ...more fields

    return matchesStatus && matchesSearch
  })
}

const filteredUniversities = useMemo(
  () => filterUniversities(universities, searchQuery, activeFilter),
  [universities, searchQuery, activeFilter],
)
```

`UniversityDetailPage` and the customer dashboard do the same pattern for products with their own filter helpers.

### 6. Kit builder cart — merge duplicate lines

Cart state lives on `MakeYourOwnKitPage`. Adding the same catalog item again bumps quantity instead of a second row.

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

`KitMakerCart` multiplies `price * quantity * kitCount` for the estimate—that’s arithmetic in the widget, but the line-item rules stay in the page.

### 7. Routes + scoped provider

Customer URLs nest under one layout that adds context; public routes don’t.

```jsx
// src/App.jsx
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
  {/* ... */}
</Route>
```

`useUniversityByLoginCode` is the glue from `:loginCode` to context:

```js
return useMemo(() => {
  const normalizedCode = loginCode?.trim().toLowerCase()
  return universities.find(
    (item) => item.loginCode.toLowerCase() === normalizedCode,
  )
}, [loginCode, universities])
```

And `useUniversities` fails fast if someone uses the hook outside a provider—helps catch wiring mistakes early:

```js
if (!context) {
  throw new Error('useUniversities must be used within UniversitiesProvider')
}
```

### 8. Small utilities that show up everywhere

**`cn()`** — conditional classes without Tailwind conflicts:

```js
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

**`buttonClassName`** — same styles on `<button>` and `<Link>` (see `Home.jsx`) so you don’t duplicate variant maps.

**`formatKr`** — Danish locale for prices:

```js
export function formatKr(amount) {
  return `${new Intl.NumberFormat('da-DK').format(amount)}kr`
}
```

**`SearchFilterPanel`** — shared search + pills; pages pass `action` for their own button (create customer, add products). Filter logic stays in the page, not buried in the widget.

## Stack

- React 19, React Router 7
- Vite 8
- Tailwind CSS 4
- `clsx`, `tailwind-merge`

## If you add a backend later

Reasonable order of work:

1. Replace `src/data/*` with API calls; keep similar shapes (`getProductsByUniversity`, university + kit object).
2. One shared store for universities (or React Query) instead of two provider mounts.
3. Real auth for admin; keep or replace login-code links for customers.
4. Persist reviews, cart, and “advance order” on the server instead of alerts and local state.
