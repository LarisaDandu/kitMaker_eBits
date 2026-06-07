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
  maxFileSizeMb = 5,
  acceptedFileLabel = 'CSV or XLSX under 5 MB',
  onDownloadTemplate,
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

    if (file.size > maxFileSizeMb * 1024 * 1024) {
      setError(`This file is too large. Please upload a CSV or XLSX under ${maxFileSizeMb} MB.`)
      event.target.value = ''
      return
    }

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
            <ResetIcon />
            {resetLabel}
          </Button>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-accent-2 bg-transparent px-7 py-3 font-body text-base font-medium text-text transition-opacity hover:opacity-80"
        >
          <UploadIcon />
          Upload CSV/XLSX
        </label>
        {onDownloadTemplate ? (
          <Button
            type="button"
            variant="outlineStrong"
            rounded="xl"
            onClick={onDownloadTemplate}
          >
            <DownloadIcon />
            Download template CSV
          </Button>
        ) : null}
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
        <span className="text-sm font-medium text-text-secondary">
          {acceptedFileLabel}
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

function DownloadIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12M7 8l5-5 5 5M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4v6h6M20 20v-6h-6M5 15a7 7 0 0 0 11.7 3.2M19 9A7 7 0 0 0 7.3 5.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
