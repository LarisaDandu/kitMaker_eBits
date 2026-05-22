import Button from '../ui/Button'
import { cn } from '../../lib/cn'

export default function AdminHeader({ title = 'Clients Overview', onLogout }) {
  return (
    <header className={cn('flex flex-wrap items-center justify-between gap-4')}>
      <h1
        className={cn(
          'm-0 font-headline text-[clamp(1.5rem,4vw,2rem)] font-normal uppercase tracking-wide text-text',
        )}
      >
        {title}
      </h1>
      <Button type="button" onClick={onLogout}>
        Log out
      </Button>
    </header>
  )
}
