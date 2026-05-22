import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import CustomerOrderCard from '../components/kits/CustomerOrderCard'
import PrototypeAccessModal from '../components/kits/PrototypeAccessModal'
import Button from '../components/ui/Button'
import { UNIVERSITY_STATUS } from '../data/universities'
import { useUniversityByLoginCode } from '../hooks/useUniversityByLoginCode'
import { cn } from '../lib/cn'

function UserIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function CustomerOrdersPage() {
  const { loginCode } = useParams()
  const navigate = useNavigate()
  const [showPrototypeModal, setShowPrototypeModal] = useState(false)
  const university = useUniversityByLoginCode(loginCode)

  if (!university) {
    return (
      <main className="min-h-svh bg-background px-8 py-10 font-body text-text">
        <h1 className="m-0 font-headline text-4xl uppercase">Order not found</h1>
        <p className="mt-4 max-w-[620px] text-xl">
          Please check the login code and try again.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-background font-body text-text">
      <div className="box-border w-full px-8 py-10 max-sm:px-4 max-sm:py-6">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="m-0 font-headline text-4xl uppercase leading-tight">
              Your Orders
            </h1>
            <p className="m-0 mt-6 max-w-[860px] text-2xl leading-tight max-sm:text-xl">
              You currently have one active order. Please note that if you wish
              to reorder a previous kit, you must finalize the current order
              first.
            </p>
            <Button
              type="button"
              onClick={() => setShowPrototypeModal(true)}
              variant="accent"
              size="md"
              rounded="xl"
              className="mt-8"
            >
              Create new kit
            </Button>
          </div>

          <div className="flex shrink-0 items-center gap-4 text-xl max-sm:hidden">
            <span>{university.name}</span>
            <UserIcon />
          </div>
        </header>

        <div className={cn('mt-24 flex flex-col gap-8', 'max-sm:mt-12')}>
          <CustomerOrderCard
            order={university.kit}
            status={UNIVERSITY_STATUS.ACTIVE_ORDER}
            isActive
            onExportCsv={() => window.alert('Export CSV (demo)')}
            dashboardHref={`/orders/${university.loginCode}/dashboard`}
          />

          {(university.previousOrders ?? []).map((order) => (
            <CustomerOrderCard
              key={order.id}
              order={order}
              status={order.status}
              onExportCsv={() => window.alert('Export previous order CSV (demo)')}
              detailHref={`/orders/${university.loginCode}/previous/${order.id}`}
            />
          ))}
        </div>
      </div>

      {showPrototypeModal ? (
        <PrototypeAccessModal
          onCancel={() => setShowPrototypeModal(false)}
          onContinue={() => {
            setShowPrototypeModal(false)
            navigate(`/orders/${university.loginCode}/kit-builder`)
          }}
        />
      ) : null}
    </main>
  )
}
