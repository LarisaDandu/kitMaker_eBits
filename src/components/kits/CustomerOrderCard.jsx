import { Link } from 'react-router'
import { STATUS_LABELS, UNIVERSITY_STATUS } from '../../data/universities'
import { cn } from '../../lib/cn'
import Button from '../ui/Button'
import { buttonClassName } from '../ui/buttonStyles'

function CustomerStat({ label, value }) {
  return (
    <div className="flex min-h-[120px] flex-col justify-between rounded-xl border border-accent-1 bg-background-third px-5 py-4">
      <span className="font-body text-base font-medium text-text">{label}</span>
      <span className="font-body text-4xl leading-none text-text">{value}</span>
    </div>
  )
}

function ExportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v12M7 10l5 5 5-5M5 21h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StatusPill({ status }) {
  const isInactive = status === UNIVERSITY_STATUS.INACTIVE_ORDERS

  return (
    <span
      className={cn(
        'inline-flex w-fit rounded-full px-4 py-2 font-body text-base font-medium',
        isInactive
          ? 'border border-text bg-background-third text-text'
          : 'bg-accent-1-lighter text-text',
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default function CustomerOrderCard({
  order,
  status,
  isActive = false,
  onExportCsv,
  dashboardHref,
  detailHref,
  showInactiveSummary = false,
}) {
  const stats = order.stats
  const rejected = stats?.rejected ?? stats?.required ?? 0

  return (
    <article
      className={cn(
        'box-border w-full max-w-[760px] rounded-[20px] bg-background-secondary px-8 py-7',
        'max-sm:px-5 max-sm:py-6',
      )}
    >
      <StatusPill status={status} />

      {isActive ? (
        <h2 className="m-0 mt-10 font-body text-4xl font-normal leading-tight text-text max-sm:text-3xl">
          {order.name}
        </h2>
      ) : (
        <div className="mt-9 flex flex-wrap items-center justify-between gap-4">
          <h2 className="m-0 font-body text-4xl font-normal leading-tight text-text max-sm:text-3xl">
            {order.name}
          </h2>
          <div className="flex flex-wrap gap-3">
            {onExportCsv ? (
              <Button
                type="button"
                onClick={onExportCsv}
                variant="outline"
                size="md"
                rounded="xl"
              >
                <ExportIcon />
                Export CSV
              </Button>
            ) : null}
            {detailHref ? (
              <Link
                to={detailHref}
                className={buttonClassName({
                  variant: 'accent',
                  size: 'md',
                  rounded: 'xl',
                })}
              >
                View order
              </Link>
            ) : null}
          </div>
        </div>
      )}

      {isActive ? (
        <>
          <p className="m-0 mt-7 max-w-[680px] font-body text-base leading-snug text-text">
            Please review the components included in the kit. Approve the parts
            that look right, request changes where needed, and add comments if
            there is anything we should adjust.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CustomerStat
              label="Components checked"
              value={`${stats.checked}/${stats.totalComponents}`}
            />
            <CustomerStat
              label="Components approved"
              value={`${stats.approved}/${stats.totalComponents}`}
            />
            <CustomerStat
              label="Components rejected"
              value={`${rejected}/${stats.totalComponents}`}
            />
            <CustomerStat
              label="Total number of kits"
              value={String(stats.totalKits)}
            />
          </div>

          <Button
            type="button"
            onClick={onExportCsv}
            variant="outline"
            size="md"
            rounded="xl"
            className="mt-8"
          >
            <ExportIcon />
            Export CSV
          </Button>

          {dashboardHref ? (
            <Link
              to={dashboardHref}
              className={buttonClassName({
                variant: 'accent',
                size: 'md',
                rounded: 'xl',
                className: 'ml-4 mt-8 align-top max-sm:ml-0',
              })}
            >
              Open dashboard
            </Link>
          ) : null}
        </>
      ) : (
        <>
          {showInactiveSummary ? (
            <div className="mt-8 max-w-[200px]">
              <CustomerStat
                label="Total number of kits"
                value={String(order.stats?.totalKits ?? 0)}
              />
            </div>
          ) : null}
        </>
      )}
    </article>
  )
}
