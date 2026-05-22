import { Link } from 'react-router'
import { cn } from '../lib/cn'
import { buttonClassName } from '../components/ui/buttonStyles'

export default function Home() {
  return (
    <section>
      <h1 className={cn('mt-0 font-headline uppercase')}>Home</h1>
      <p>Welcome to eBits Kitmaker.</p>
      <Link
        to="/admin"
        className={buttonClassName({ className: 'mt-4' })}
      >
        Open Clients Overview
      </Link>
    </section>
  )
}
