import { UNIVERSITY_STATUS } from '../data/universities.js'

export const EMPTY_CUSTOMER_FORM = {
  name: '',
  professorName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  ean: '',
  loginCode: '',
}

export function generateUniversityId() {
  return `uni-${crypto.randomUUID().slice(0, 8)}`
}

export function generateLoginCode() {
  const segment = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${segment()}-${segment()}`
}

export function generateOrderId() {
  return `order-${crypto.randomUUID().slice(0, 8)}`
}

export function createDefaultKit() {
  return {
    id: generateOrderId(),
    name: 'New kit',
    quoteId: String(Math.floor(Math.random() * 80) + 10),
    status: UNIVERSITY_STATUS.ACTIVE_ORDER,
    stats: {
      checked: 0,
      totalComponents: 50,
      approved: 0,
      required: 0,
      rejected: 0,
      totalKits: 0,
    },
    pricing: {
      finalUnitPrice: 0,
      pricePerKit: 0,
      initialEstimatePrice: 0,
      currency: 'DKK',
    },
    progressStep: 0,
  }
}

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

export function getPrimaryActiveOrder(university) {
  return getActiveOrders(university)[0] ?? null
}

export function findUniversityOrder(university, orderId) {
  if (!university) return null
  const orders = [
    ...getActiveOrders(university),
    ...(university.previousOrders ?? []),
  ]

  return orders.find((order) => order.id === orderId) ?? null
}

export function createOrderFromRequest(orderInput = {}) {
  const items = orderInput.items ?? []
  const kitCount = Number(orderInput.kitCount ?? 1)
  const totalComponents = items.length || 1

  return {
    id: generateOrderId(),
    name: orderInput.kitName?.trim() || 'New kit',
    quoteId: String(Math.floor(Math.random() * 80) + 10),
    status: UNIVERSITY_STATUS.ACTIVE_ORDER,
    stats: {
      checked: 0,
      totalComponents,
      approved: 0,
      required: 0,
      rejected: 0,
      totalKits: kitCount,
    },
    pricing: {
      finalUnitPrice: 0,
      pricePerKit: items[0]?.price ?? 0,
      initialEstimatePrice: 0,
      currency: 'DKK',
    },
    progressStep: 0,
    products: items.map((item, index) => ({
      id: `${item.id}-${Date.now()}-${index}`,
      orderId: null,
      name: item.name,
      subtitle: item.subtitle ?? '',
      status: 'pending_review',
      pcsPerKit: item.quantity,
      quoteRow: index + 1,
      orderQuantity: kitCount,
      variant: item.variant ?? '',
      pack: item.pack ?? `${item.quantity}pcs`,
      quoteLine: item.quoteLine ?? `${item.price ?? 0} kr`,
      supplierLink: item.supplierLink ?? item.link,
    })),
    notes: orderInput.notes ?? '',
  }
}

export function universityToFormValues(university) {
  if (!university) return { ...EMPTY_CUSTOMER_FORM }

  return {
    name: university.name ?? '',
    professorName: university.professorName ?? '',
    email: university.email ?? '',
    phone: university.phone ?? '',
    addressLine1: university.addressLine1 ?? '',
    addressLine2: university.addressLine2 ?? '',
    ean: university.ean ?? '',
    loginCode: university.loginCode ?? '',
  }
}

export function formValuesToUniversity(form, existing) {
  const base = {
    id: generateUniversityId(),
    status: UNIVERSITY_STATUS.REQUIRES_CHANGES,
    kit: createDefaultKit(),
    activeOrders: [],
    previousOrders: [],
    ...existing,
  }

  return {
    ...base,
    name: form.name.trim(),
    professorName: form.professorName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    addressLine1: form.addressLine1.trim(),
    addressLine2: form.addressLine2.trim(),
    ean: form.ean.trim(),
    loginCode: form.loginCode.trim(),
  }
}
