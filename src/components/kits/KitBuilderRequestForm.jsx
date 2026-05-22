import { useId, useState } from 'react'
import { cn } from '../../lib/cn'
import Button from '../ui/Button'

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V4M7 9l5-5 5 5M5 20h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function KitBuilderRequestForm({
  onSubmit,
  title = 'Do you have a special request?',
  description = 'Write your desired components down below',
  submitLabel = 'Submit order',
}) {
  const requestId = useId()
  const fileId = useId()
  const [request, setRequest] = useState('')
  const [fileName, setFileName] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit?.({ request, fileName })
  }

  return (
    <form className="max-w-[980px]" onSubmit={handleSubmit}>
      <h2 className="m-0 text-2xl font-medium text-text">{title}</h2>
      <p className="m-0 mt-5 text-lg text-text">
        {description}
      </p>

      <label className="sr-only" htmlFor={requestId}>
        Desired components
      </label>
      <textarea
        id={requestId}
        value={request}
        onChange={(event) => setRequest(event.target.value)}
        placeholder="Type here..."
        className={cn(
          'mt-6 min-h-[260px] w-full resize-y rounded-xl border border-accent-2 bg-transparent px-5 py-5',
          'font-body text-xl text-text outline-none placeholder:text-text-secondary focus:border-text',
        )}
      />

      <div className="my-7 grid grid-cols-[1fr_auto_1fr] items-center gap-6 text-xl text-text">
        <span className="h-px bg-text-secondary" />
        <span>or</span>
        <span className="h-px bg-text-secondary" />
      </div>

      <p className="m-0 text-lg text-text">
        import a CSV / xlsx file and we will do our best to find you the
        components that fit your needs.
      </p>

      <label
        className={cn(
          'mt-6 inline-flex cursor-pointer items-center gap-3 rounded-xl border border-accent-2 px-8 py-3',
          'font-body text-xl font-medium text-text transition-opacity hover:opacity-80',
        )}
      >
        <input
          id={fileId}
          type="file"
          accept=".csv,.xlsx"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
          className="sr-only"
        />
        <UploadIcon />
        Upload file
      </label>

      {fileName ? (
        <p className="m-0 mt-3 text-sm text-text-secondary">{fileName}</p>
      ) : null}

      <Button
        type="submit"
        variant="accent"
        size="xl"
        rounded="xl"
        className="mt-7"
      >
        {submitLabel}
      </Button>
    </form>
  )
}
