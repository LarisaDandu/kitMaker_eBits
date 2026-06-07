import { UNIVERSITY_STATUS } from '../../data/universities.js'

export function mapUniversityFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    professorName: row.professor_name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    addressLine1: row.address_line1 ?? '',
    addressLine2: row.address_line2 ?? '',
    ean: row.ean ?? '',
    loginCode: row.login_code,
    status: row.status,
    lastUpdatedAt: row.last_updated_at,
    deletedAt: row.deleted_at,
  }
}

export function mapUniversityToDb(university) {
  return {
    id: university.id,
    name: university.name,
    professor_name: university.professorName,
    email: university.email,
    phone: university.phone,
    address_line1: university.addressLine1,
    address_line2: university.addressLine2,
    ean: university.ean,
    login_code: university.loginCode,
    status: university.status,
    last_updated_at: university.lastUpdatedAt,
    deleted_at: university.deletedAt ?? null,
  }
}

export function mapOrderFromDb(row) {
  return {
    id: row.id,
    universityId: row.university_id,
    name: row.name,
    quoteId: row.quote_id,
    status: row.status,
    stats: row.stats ?? {},
    pricing: row.pricing ?? {},
    progressStep: row.progress_step ?? 0,
    notes: row.notes ?? '',
    archivedAt: row.archived_at,
    products: (row.products ?? []).map(mapProductFromDb),
  }
}

export function mapOrderToDb(order, universityId) {
  return {
    id: order.id,
    university_id: universityId ?? order.universityId,
    name: order.name,
    quote_id: order.quoteId,
    status: order.status,
    stats: order.stats ?? {},
    pricing: order.pricing ?? {},
    progress_step: order.progressStep ?? 0,
    notes: order.notes ?? null,
    archived_at:
      order.archivedAt ??
      (order.status === UNIVERSITY_STATUS.INACTIVE_ORDERS ? new Date().toISOString() : null),
    updated_at: new Date().toISOString(),
  }
}

export function mapProductFromDb(row) {
  return {
    id: row.id,
    universityId: row.university_id,
    orderId: row.order_id,
    name: row.name,
    subtitle: row.subtitle ?? '',
    status: row.status,
    pcsPerKit: row.pcs_per_kit ?? 1,
    quoteRow: row.quote_row,
    orderQuantity: row.order_quantity,
    variant: row.variant ?? '',
    pack: row.pack ?? '',
    quoteLine: row.quote_line ?? '',
    supplierLink: row.supplier_link ?? '',
    customerReply: row.customer_reply,
  }
}

export function mapProductToDb(product, universityId, orderId) {
  return {
    id: product.id,
    university_id: universityId ?? product.universityId,
    order_id: orderId ?? product.orderId,
    name: product.name,
    subtitle: product.subtitle ?? '',
    status: product.status,
    pcs_per_kit: product.pcsPerKit ?? product.quantity ?? 1,
    quote_row: product.quoteRow ?? null,
    order_quantity: product.orderQuantity ?? null,
    variant: product.variant ?? '',
    pack: product.pack ?? '',
    quote_line: product.quoteLine ?? '',
    supplier_link: product.supplierLink ?? product.link ?? '',
    customer_reply: product.customerReply ?? null,
    updated_at: new Date().toISOString(),
  }
}

export function mapCatalogFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    fullName: row.full_name,
    subtitle: row.subtitle,
    category: row.category,
    price: Number(row.price ?? 0),
    link: row.link,
    details: row.details ?? [],
    imageUrl: row.image_url,
  }
}

export function mapCatalogToDb(product) {
  return {
    id: product.id,
    name: product.name,
    full_name: product.fullName,
    subtitle: product.subtitle,
    category: product.category,
    price: product.price,
    link: product.link,
    details: product.details ?? [],
    image_url: product.imageUrl ?? null,
  }
}
