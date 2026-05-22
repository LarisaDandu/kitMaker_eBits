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
            Modify
          </Button>
          <Button type="button" variant="danger" onClick={onDelete}>
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
