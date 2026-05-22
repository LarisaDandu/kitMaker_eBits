import { Link, useParams } from 'react-router'
import TeacherAccountMenu from '../components/customer/TeacherAccountMenu'
import CustomerOrderCard from '../components/kits/CustomerOrderCard'
import KitPrice from '../components/kits/KitPrice'
import PreviousOrderProductList from '../components/kits/PreviousOrderProductList'
import { kitMakerProducts } from '../data/kitMakerProducts'
import { UNIVERSITY_STATUS } from '../data/universities'
import { useUniversityByLoginCode } from '../hooks/useUniversityByLoginCode'

export default function PreviousOrderPage() {
  const { loginCode, orderId } = useParams()
  const university = useUniversityByLoginCode(loginCode)
  const order = university?.previousOrders?.find((item) => item.id === orderId)

  if (!university || !order) {
    return (
      <main className="min-h-svh bg-background px-8 py-10 font-body text-text">
        <h1 className="m-0 font-headline text-4xl uppercase">Order not found</h1>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-background font-body text-text">
      <div className="box-border flex flex-col gap-8 px-8 py-10 max-sm:px-4">
        <header className="flex items-center justify-between gap-4">
          <h1 className="m-0 font-headline text-4xl uppercase">{order.name}</h1>
          <TeacherAccountMenu university={university} />
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <CustomerOrderCard
            order={{
              ...order,
              stats: { totalKits: university.kit.stats.totalKits },
            }}
            status={UNIVERSITY_STATUS.INACTIVE_ORDERS}
            showInactiveSummary
            onExportCsv={() => window.alert('Export CSV (demo)')}
          />
          <div className="flex flex-col gap-6">
            <KitPrice pricing={university.kit.pricing} />
            <Link
              to={`/orders/${university.loginCode}/previous/${order.id}/reorder`}
              className="inline-flex w-fit rounded-xl bg-text px-10 py-3 font-body text-2xl font-medium text-accent-1 no-underline"
            >
              Reorder
            </Link>
            <p className="m-0 flex max-w-[360px] gap-4 text-xl text-text">
              <strong>!</strong>
              <span>You can only reorder a kit if there are no active kit orders currently in progress.</span>
            </p>
          </div>
        </div>

        <PreviousOrderProductList products={kitMakerProducts} />
      </div>
    </main>
  )
}
