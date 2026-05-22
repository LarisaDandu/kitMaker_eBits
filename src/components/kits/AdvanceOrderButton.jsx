import { getMaxKitProgressStep } from '../../lib/kitProgress'
import { cn } from '../../lib/cn'
import Button from '../ui/Button'

export default function AdvanceOrderButton({ progressStep = 0, onAdvance, className }) {
  const maxStep = getMaxKitProgressStep()
  const isComplete = progressStep >= maxStep

  return (
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
      Advance order
    </Button>
  )
}
