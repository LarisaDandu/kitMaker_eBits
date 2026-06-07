import { KIT_STATUS_LABELS, UNIVERSITY_STATUS } from '../../data/universities'
import { cn } from '../../lib/cn'
import HelpTooltip from '../ui/HelpTooltip'

function StatBox({ label, value, help }) {
  return (
    <div
      className={cn(
        'flex min-w-[120px] flex-1 flex-col gap-1 rounded-xl bg-background px-4 py-3',
      )}
    >
      <span className="flex items-center gap-2 text-sm font-medium text-text-secondary">
        {label}
        <HelpTooltip label={`${label} help`}>{help}</HelpTooltip>
      </span>
      <span className="text-base font-semibold text-text">{value}</span>
    </div>
  )
}

export default function KitOverview({ university, onExportCsv }) {
  const { kit, status } = university
  const { stats } = kit
  const kitStatusLabel = KIT_STATUS_LABELS[status] ?? status
  const requiresChanges = status === UNIVERSITY_STATUS.REQUIRES_CHANGES

  const statItems = [
    {
      label: 'Components checked',
      value: `${stats.checked}/${stats.totalComponents}`,
      help: 'Components reviewed so far.',
    },
    {
      label: 'Components approved',
      value: `${stats.approved}/${stats.totalComponents}`,
      help: 'Components accepted for this quote.',
    },
    {
      label: 'Components required',
      value: `${stats.required ?? 0}/${stats.totalComponents}`,
      help: 'Components needing changes or follow-up.',
    },
    {
      label: 'Total number of kits',
      value: String(stats.totalKits),
      help: 'Complete kits requested by the school.',
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'rounded-full px-3 py-1.5 text-sm font-medium',
            status === UNIVERSITY_STATUS.ACTIVE_ORDER
              ? 'bg-accent-1-lighter text-text'
              : requiresChanges
                ? 'bg-accent-2-lighter text-text'
                : 'bg-background-third text-text-secondary',
          )}
        >
          {kitStatusLabel}
        </span>
        <span
          className={cn(
            'rounded-full border px-3 py-1.5 text-sm font-medium text-text',
            requiresChanges
              ? 'border-accent-2 bg-accent-2-lighter'
              : 'border-text bg-background-third',
          )}
        >
          Quote {kit.quoteId}
          {requiresChanges ? ' - Requires Changes' : ''}
        </span>
      </div>

      <h3 className={cn('m-0 mb-4 font-body text-xl font-semibold text-text')}>
        {kit.name}
      </h3>

      <div className="mb-5 flex flex-wrap gap-2">
        {statItems.map((item) => (
          <StatBox
            key={item.label}
            label={item.label}
            value={item.value}
            help={item.help}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onExportCsv}
        className={cn(
          'mt-auto inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border-2 border-accent-2 bg-background px-5 py-2.5 font-body text-sm font-medium text-accent-2 transition-opacity hover:opacity-90',
        )}
      >
        <ExportIcon />
        Export CSV
      </button>
    </div>
  )
}

function ExportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v12M7 10l5 5 5-5M5 21h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
