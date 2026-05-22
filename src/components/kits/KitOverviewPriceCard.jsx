import KitOverview from './KitOverview'
import KitPrice from './KitPrice'
import AdvanceOrderButton from './AdvanceOrderButton'
import { cn } from '../../lib/cn'

const panelClass = cn(
  'rounded-[20px] bg-background-secondary px-6 py-6 max-sm:rounded-2xl max-sm:px-4',
)

export default function KitOverviewPriceCard({
  university,
  onExportCsv,
  onAdvanceOrder,
}) {
  const progressStep = university.kit.progressStep ?? 0

  return (
    <div
      className={cn('grid gap-5 lg:grid-cols-[1.4fr_1fr]')}
      aria-label="Kit overview and price"
    >
      <section className={panelClass} aria-label="Kit status and overview">
        <KitOverview university={university} onExportCsv={onExportCsv} />
      </section>

      <div className={cn('flex flex-col gap-4')} aria-label="Kit price and actions">
        <KitPrice pricing={university.kit.pricing} />
        <AdvanceOrderButton progressStep={progressStep} onAdvance={onAdvanceOrder} />
      </div>
    </div>
  )
}
