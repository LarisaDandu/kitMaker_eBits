import { useId, useRef, useState } from 'react'
import { parseOrderSheetFile } from '../../lib/orderSheetParser'
import Button from '../ui/Button'

export default function ProductImportPanel({
  importSummary,
  onImport,
  onReset,
  title = 'Import product sheet',
  description = "Upload a CSV or Excel sheet to replace this session's approval cards with products from the file.",
  resetLabel = 'Reset to demo products',
  emptyLabel = 'No file imported',
}) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError('')
    setIsParsing(true)

    try {
      const result = await parseOrderSheetFile(file)
      onImport(result)
    } catch (parseError) {
      setError(parseError.message || 'Could not import this file.')
    } finally {
      setIsParsing(false)
      event.target.value = ''
    }
  }

  function handleReset() {
    setFileName('')
    setError('')
    onReset()
    inputRef.current?.focus()
  }

  return (
    <section className="rounded-[20px] bg-background-secondary px-6 py-6 max-sm:px-4">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 className="m-0 text-xl font-bold text-text">{title}</h2>
          <p className="m-0 mt-2 max-w-[680px] text-sm leading-snug text-text-secondary">
            {description}
          </p>
        </div>

        {importSummary ? (
          <Button
            type="button"
            variant="outline"
            rounded="xl"
            onClick={handleReset}
          >
            {resetLabel}
          </Button>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-accent-2 bg-transparent px-7 py-3 font-body text-base font-medium text-text transition-opacity hover:opacity-80"
        >
          Upload CSV/XLSX
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
          className="sr-only"
        />

        <span className="text-sm text-text-secondary">
          {isParsing
            ? 'Parsing file...'
            : fileName || importSummary?.fileName || emptyLabel}
        </span>
      </div>

      {importSummary ? (
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-text">
          <span className="rounded-full bg-background-third px-3 py-1.5">
            {importSummary.products.length} products
          </span>
          <span className="rounded-full bg-background-third px-3 py-1.5">
            {importSummary.kitCount ? `${importSummary.kitCount} kits` : 'Kit count unknown'}
          </span>
        </div>
      ) : null}

      {error ? (
        <p className="m-0 mt-4 rounded-xl border border-accent-2 bg-accent-2-lighter px-4 py-3 text-sm font-medium text-text">
          {error}
        </p>
      ) : null}
    </section>
  )
}
