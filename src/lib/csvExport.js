function escapeCsvValue(value) {
  if (value == null) return ''
  const text = String(value)
  if (!/[",\n\r]/.test(text)) return text
  return `"${text.replaceAll('"', '""')}"`
}

export function toCsv(rows) {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(','),
    ),
  ]
  return lines.join('\n')
}

export function downloadCsv(filename, rows) {
  const csv = toCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function buildOrderCsvRows({ university, order, products = [] }) {
  const base = {
    university: university.name,
    order: order.name,
    quoteId: order.quoteId,
    orderStatus: order.status,
    totalKits: order.stats?.totalKits ?? '',
  }

  if (products.length === 0) return [base]

  return products.map((product) => ({
    ...base,
    quoteRow: product.quoteRow ?? '',
    productName: product.name,
    subtitle: product.subtitle ?? '',
    variant: product.variant ?? '',
    pcsPerKit: product.pcsPerKit ?? '',
    orderQuantity: product.orderQuantity ?? '',
    productStatus: product.status ?? '',
    customerReplyStatus: product.customerReply?.status ?? '',
    customerReplyComment: product.customerReply?.comment ?? '',
    supplierLink: product.supplierLink ?? '',
  }))
}

export function exportOrderCsv(university, order, products) {
  downloadCsv(
    `${university.name}-${order.name}`.replaceAll(' ', '-').toLowerCase(),
    buildOrderCsvRows({ university, order, products }),
  )
}
