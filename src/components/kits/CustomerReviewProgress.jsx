import { cn } from '../../lib/cn'
import Button from '../ui/Button'

function ProgressStat({ label, value }) {
  return (
    <div className="rounded-xl bg-background-third px-4 py-3">
      <span className="block text-sm font-medium text-text">{label}</span>
      <span className="mt-3 block text-2xl font-medium text-text">{value}</span>
    </div>
  )
}

export default function CustomerReviewProgress({
  total,
  approved,
  rejected,
  changes,
  onSubmit,
}) {
  const processed = approved + rejected + changes
  const percent = total > 0 ? (processed / total) * 100 : 0

  return (
    <section className="rounded-[20px] bg-background-secondary px-6 py-6">
      <h2 className="m-0 text-xl font-bold text-text">Review progress</h2>
      <p className="m-0 mt-4 text-base text-text">
        {processed}/{total} components processed.
      </p>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-background-third">
        <div
          className="h-full rounded-full bg-accent-2"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
        <ProgressStat label="Approved" value={`${approved}/${total}`} />
        <ProgressStat label="Rejected" value={`${rejected}/${total}`} />
        <ProgressStat label="Changes" value={`${changes}/${total}`} />
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        disabled={processed === 0}
        variant="accent"
        size="lg"
        rounded="xl"
        fullWidth
        className={cn('mt-4 max-w-[220px]', processed === 0 && 'cursor-not-allowed opacity-60')}
      >
        Submit review
      </Button>
    </section>
  )
}
