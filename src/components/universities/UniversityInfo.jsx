import Button from '../ui/Button'
import { cn } from '../../lib/cn'

function InfoRow({ label, value }) {
  if (!value) return null

  return (
    <div className="grid grid-cols-1 gap-1 border-b border-background-third py-3 last:border-b-0 sm:grid-cols-[180px_1fr] sm:gap-4">
      <span className="font-body text-sm font-medium text-text-secondary">{label}</span>
      <span className="font-body text-sm text-text">{value}</span>
    </div>
  )
}

export default function UniversityInfo({ university, onModify, onDelete }) {
  const address = [university.addressLine1, university.addressLine2]
    .filter(Boolean)
    .join(', ')

  return (
    <section
      className={cn('rounded-[20px] bg-background-secondary px-6 py-5 max-sm:rounded-2xl max-sm:px-4')}
      aria-label="University information"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <h2 className={cn('m-0 font-body text-2xl font-semibold text-text')}>
          {university.name}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onModify}>
            <EditIcon />
            Modify
          </Button>
          <Button type="button" variant="danger" onClick={onDelete}>
            <TrashIcon />
            Delete customer
          </Button>
        </div>
      </div>

      <div>
        <InfoRow label="Professor name" value={university.professorName} />
        <InfoRow label="Email address" value={university.email} />
        <InfoRow label="Phone number" value={university.phone} />
        <InfoRow label="Address" value={address} />
        <InfoRow label="EAN number" value={university.ean} />
      </div>
    </section>
  )
}

function EditIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 7l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
