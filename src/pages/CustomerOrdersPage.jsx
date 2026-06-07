import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import TeacherAccountMenu from '../components/customer/TeacherAccountMenu'
import CustomerOrderCard from '../components/kits/CustomerOrderCard'
import PrototypeAccessModal from '../components/kits/PrototypeAccessModal'
import Button from '../components/ui/Button'
import { UNIVERSITY_STATUS } from '../data/universities'
import { useUniversityByLoginCode } from '../hooks/useUniversityByLoginCode'
import { cn } from '../lib/cn'
import { getActiveOrders } from '../lib/universityUtils'

export default function CustomerOrdersPage() {
  const { loginCode } = useParams()
  const navigate = useNavigate()
  const [showPrototypeModal, setShowPrototypeModal] = useState(false)
  const university = useUniversityByLoginCode(loginCode)
  const activeOrders = getActiveOrders(university)

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

          <TeacherAccountMenu
            university={university}
            className="max-sm:hidden"
          />
        </header>

        <div className={cn('mt-24 flex flex-col gap-8', 'max-sm:mt-12')}>
          {activeOrders.map((order) => (
            <CustomerOrderCard
              key={order.id}
              order={order}
              status={order.status ?? UNIVERSITY_STATUS.ACTIVE_ORDER}
              isActive
              variant="compact"
              onExportCsv={() => window.alert('Export CSV (demo)')}
              dashboardHref={`/orders/${university.loginCode}/dashboard/${order.id}`}
            />
          ))}

          {(university.previousOrders ?? []).map((order) => (
            <CustomerOrderCard
              key={order.id}
              order={order}
              status={order.status}
              variant="compact"
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
