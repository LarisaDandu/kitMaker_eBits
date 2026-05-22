import { getMaxKitProgressStep } from '../../lib/kitProgress'
import { cn } from '../../lib/cn'
import Button from '../ui/Button'

export default function AdvanceOrderButton({ progressStep = 0, onAdvance, className }) {
  const maxStep = getMaxKitProgressStep()
  const isComplete = progressStep >= maxStep

  return (
    <div>
      <Button
        type="button"
        onClick={onAdvance}
        disabled={isComplete}
        variant="primary"
        size="md"
        className={cn(
          isComplete && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <ArrowRightIcon />
        Advance order
      </Button>
      {isComplete ? (
        <p className="m-0 mt-2 text-sm font-medium text-text-secondary">
          This order is already at the final step.
        </p>
      ) : null}
    </div>
  )
}

function ArrowRightIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
