import { cn } from '../../lib/cn'

export default function KitSummary({ kit }) {
  return (
    <p className={cn('m-0 text-[0.95rem] text-text-secondary')}>{kit.name}</p>
  )
}
