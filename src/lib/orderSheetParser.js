import JSZip from 'jszip'

const URL_PATTERN = /^https?:\/\//i
const IMAGE_URL_PATTERN = /\.(avif|gif|jpe?g|png|svg|webp)(\?|#|$)/i
const KIT_COUNT_PATTERN = /(\d+)\s*kits?\s+in\s+total/i
const USD_TO_DKK_RATE = 6.5

function parseXml(xml) {
  return new DOMParser().parseFromString(xml, 'application/xml')
}

function getLocalName(element) {
  return element.localName || element.nodeName.split(':').pop()
}

function childrenByName(element, localName) {
  return Array.from(element.children).filter(
    (child) => getLocalName(child) === localName,
  )
}

function firstChildByName(element, localName) {
  return childrenByName(element, localName)[0]
}

function elementsByName(root, localName) {
  return Array.from(root.getElementsByTagName('*')).filter(
    (element) => getLocalName(element) === localName,
  )
}

function columnFromCellRef(ref) {
  return String(ref ?? '').match(/[A-Z]+/)?.[0] ?? ''
}

function normalizeHeader(value) {
  return String(value ?? '').trim().toLowerCase()
}

function cleanSku(value) {
  return String(value ?? '')
    .replace(/^sku:\s*/i, '')
    .trim()
}

function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  const normalized = String(value ?? '')
    .trim()
    .replace(/[^0-9,.-]/g, '')

  if (!normalized) return null

  const decimalValue =
    normalized.includes(',') && !normalized.includes('.')
      ? normalized.replace(',', '.')
      : normalized.replace(/,/g, '')
  const parsed = Number.parseFloat(decimalValue)

  return Number.isFinite(parsed) ? parsed : null
}

function convertUsdToDkk(amount) {
  return Number((amount * USD_TO_DKK_RATE).toFixed(2))
}

function isUrl(value) {
  return URL_PATTERN.test(String(value ?? '').trim())
}

function isImageUrl(value) {
  return IMAGE_URL_PATTERN.test(String(value ?? '').trim())
}

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function findKitCount(rows) {
  for (const row of rows.slice(0, 5)) {
    const text = row.values.join(' ')
    const match = text.match(KIT_COUNT_PATTERN)
    if (match) return Number.parseInt(match[1], 10)
  }

  return null
}

function findHeaderRowIndex(rows) {
  return rows.findIndex((row) => {
    const headers = row.values.map(normalizeHeader)
    return headers.includes('name') && headers.includes('amount')
  })
}

function findFirstUrl(values) {
  return values.find(isUrl) ?? ''
}

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

function readSharedStrings(zip, sharedStringsPath) {
  return zip.file(sharedStringsPath)?.async('text').then((xml) => {
    const doc = parseXml(xml)
    return elementsByName(doc, 'si').map((item) =>
      elementsByName(item, 't')
        .map((node) => node.textContent)
        .join(''),
    )
  })
}

function readRelationships(xml) {
  const doc = parseXml(xml)
  return new Map(
    elementsByName(doc, 'Relationship').map((rel) => [
      rel.getAttribute('Id'),
      rel.getAttribute('Target'),
    ]),
  )
}

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

async function getEmbeddedImagesByRow(zip, sheetPath, sheetRelTargets) {
  const drawingTarget = Array.from(sheetRelTargets.values()).find((target) =>
    target.includes('drawing'),
  )
  if (!drawingTarget) return new Map()

  const worksheetDir = sheetPath.split('/').slice(0, -1).join('/')
  const drawingPath = `${worksheetDir}/${drawingTarget}`.replace('/../', '/')
  const drawingRelsPath = drawingPath.replace(
    /\/([^/]+)$/,
    '/_rels/$1.rels',
  )
  const drawingXml = await zip.file(drawingPath)?.async('text')
  const drawingRelsXml = await zip.file(drawingRelsPath)?.async('text')
  const imagesByRow = new Map()

  if (!drawingXml || !drawingRelsXml) return imagesByRow

  const drawingDoc = parseXml(drawingXml)
  const drawingRelTargets = readRelationships(drawingRelsXml)

  for (const anchor of elementsByName(drawingDoc, 'twoCellAnchor')) {
    const from = elementsByName(anchor, 'from')[0]
    const row = elementsByName(from ?? anchor, 'row')[0]?.textContent
    const blip = elementsByName(anchor, 'blip')[0]
    const embedId = blip?.getAttribute('r:embed')
    const target = drawingRelTargets.get(embedId)

    if (row == null || !target) continue

    const imagePath = drawingPath
      .split('/')
      .slice(0, -1)
      .join('/')
      .concat(`/${target}`)
      .replace('/../', '/')
    const imageFile = zip.file(imagePath)
    if (!imageFile) continue

    const bytes = await imageFile.async('uint8array')
    const extension = target.split('.').pop()?.toLowerCase() || 'png'
    const mimeType = extension === 'jpg' ? 'image/jpeg' : `image/${extension}`
    const imageUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }))
    const excelRowNumber = Number.parseInt(row, 10) + 1

    imagesByRow.set(excelRowNumber, imageUrl)
  }

  return imagesByRow
}

async function parseXlsxRows(arrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer)
  const workbookXml = await zip.file('xl/workbook.xml')?.async('text')
  const workbookRelsXml = await zip.file('xl/_rels/workbook.xml.rels')?.async('text')

  if (!workbookXml || !workbookRelsXml) {
    throw new Error('This XLSX file is missing workbook data.')
  }

  const workbookDoc = parseXml(workbookXml)
  const workbookRelTargets = readRelationships(workbookRelsXml)
  const firstSheet = elementsByName(workbookDoc, 'sheet')[0]
  const sheetRelId = firstSheet?.getAttribute('r:id')
  const sheetTarget = workbookRelTargets.get(sheetRelId)
  const sheetPath = sheetTarget?.startsWith('xl/')
    ? sheetTarget
    : `xl/${sheetTarget}`
  const sheetXml = await zip.file(sheetPath)?.async('text')

  if (!sheetXml) {
    throw new Error('No worksheet found in this file.')
  }

  const sharedStrings =
    (await readSharedStrings(zip, 'xl/sharedStrings.xml')) ?? []
  const sheetRelsPath = sheetPath.replace(/\/([^/]+)$/, '/_rels/$1.rels')
  const sheetRelsXml = await zip.file(sheetRelsPath)?.async('text')
  const sheetRelTargets = sheetRelsXml ? readRelationships(sheetRelsXml) : new Map()
  const sheetDoc = parseXml(sheetXml)
  const hyperlinkTargets = new Map()

  for (const hyperlink of elementsByName(sheetDoc, 'hyperlink')) {
    const relId = hyperlink.getAttribute('r:id')
    const target = sheetRelTargets.get(relId)
    if (target) hyperlinkTargets.set(hyperlink.getAttribute('ref'), target)
  }

  const rows = elementsByName(sheetDoc, 'row')
    .map((rowNode) => {
      const number = Number.parseInt(rowNode.getAttribute('r'), 10)
      const cells = {}

      for (const cellNode of childrenByName(rowNode, 'c')) {
        const ref = cellNode.getAttribute('r')
        const column = columnFromCellRef(ref)
        const value = getCellText(cellNode, sharedStrings).trim()
        const link = hyperlinkTargets.get(ref) ?? ''
        cells[column] = { value, link }
      }

      return {
        number,
        cells,
        values: Object.values(cells).map((cell) => cell.value),
      }
    })
    .filter((row) => row.values.some(Boolean))

  return {
    rows,
    imagesByRow: await getEmbeddedImagesByRow(zip, sheetPath, sheetRelTargets),
  }
}

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
    const rowValues = Object.values(row.cells).map((cell) => cell.value)
    const rowLinks = Object.values(row.cells).map((cell) => cell.link)
    const supplierLink = findFirstUrl([...rowLinks, ...rowValues])

    if (!name || pcsPerKit == null || priceUsd == null) continue

    const variant = isUrl(variantOrLink) ? '' : variantOrLink
    const imageUrl =
      imagesByRow.get(row.number) ||
      (isImageUrl(supplierLink) ? supplierLink : '')

    products.push({
      id: `import-${row.number}-${slugify(sku || name)}`,
      name,
      subtitle: variant || sku || 'Imported product',
      status: 'pending_review',
      pcsPerKit,
      price: convertUsdToDkk(priceUsd),
      sourcePrice: priceUsd,
      sourceCurrency: 'USD',
      currency: 'DKK',
      conversionRate: USD_TO_DKK_RATE,
      kitCount,
      orderQuantity: kitCount ? pcsPerKit * kitCount : pcsPerKit,
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

export async function parseOrderSheetFile(file) {
  if (!file) {
    throw new Error('Choose a CSV or XLSX file to import.')
  }

  const arrayBuffer = await file.arrayBuffer()
  return parseOrderSheetBuffer(arrayBuffer, file.name)
}
