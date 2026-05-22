import { formatKr } from '../../lib/format'
import { cn } from '../../lib/cn'

function PriceDetailRow({ label, value }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-text py-3',
      )}
    >
      <span className="font-body text-base font-medium text-text">{label}</span>
      <span className="font-body text-base font-medium text-text">{value}</span>
    </div>
  )
}

export default function KitPrice({ pricing }) {
  const { finalUnitPrice, pricePerKit, initialEstimatePrice } = pricing

  return (
    <div
      className={cn(
        'rounded-[20px] bg-background-secondary px-6 py-6',
        'max-sm:rounded-2xl max-sm:px-4 max-sm:py-5',
      )}
    >
      <p className={cn('m-0 font-body text-base font-medium text-text')}>
        Final client price
      </p>
      <p className={cn('m-0 mt-1 font-body text-4xl font-bold leading-tight text-text')}>
        {formatKr(finalUnitPrice)}
      </p>
      <p className={cn('m-0 mt-2 font-body text-sm font-bold text-text')}>
        including VAT
      </p>

      <div className={cn('mt-5')}>
        <PriceDetailRow label="Price per kit" value={formatKr(pricePerKit)} />
        <PriceDetailRow
          label="Initial estimate price"
          value={formatKr(initialEstimatePrice)}
        />
      </div>
    </div>
  )
}
