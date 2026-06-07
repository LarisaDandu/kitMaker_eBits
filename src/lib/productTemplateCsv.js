import { PRODUCT_STATUS } from '../data/products'
import { downloadCsv } from './csvExport'
import { ORDER_TEMPLATE_HEADERS } from './orderSheetParser'

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

function getTemplateValue(header, quoteRow) {
  if (header === 'quote_row') return quoteRow
  if (header === 'status') return PRODUCT_STATUS.PENDING_REVIEW
  return ''
}
