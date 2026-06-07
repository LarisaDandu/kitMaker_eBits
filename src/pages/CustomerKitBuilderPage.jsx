import { useNavigate, useParams } from 'react-router'
import TeacherAccountMenu from '../components/customer/TeacherAccountMenu'
import KitBuilderChoiceCard from '../components/kits/KitBuilderChoiceCard'
import KitBuilderRequestForm from '../components/kits/KitBuilderRequestForm'
import { useUniversityByLoginCode } from '../hooks/useUniversityByLoginCode'
import { useUniversities } from '../hooks/useUniversities'

export default function CustomerKitBuilderPage() {
  const { loginCode } = useParams()
  const navigate = useNavigate()
  const university = useUniversityByLoginCode(loginCode)
  const { createActiveOrder } = useUniversities()

  if (!university) {
    return (
      <main className="min-h-svh bg-background px-8 py-10 font-body text-text">
        <h1 className="m-0 font-headline text-4xl uppercase">Kit not found</h1>
        <p className="mt-4 max-w-[620px] text-xl">
          Please check the login code and try again.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-background font-body text-text">
      <div className="box-border flex min-h-svh flex-col px-8 py-10 max-sm:px-4">
        <header className="flex items-center justify-between gap-4">
          <h1 className="m-0 font-headline text-4xl uppercase leading-tight max-sm:text-3xl">
            Welcome to eBits Kit Maker
          </h1>
          <TeacherAccountMenu university={university} className="max-sm:hidden" />
        </header>

        <div className="mt-36 grid gap-28 lg:grid-cols-2 max-lg:mt-16 max-lg:gap-8">
          <KitBuilderChoiceCard
            title="Choose from premade kits"
            onClick={() => navigate(`/orders/${university.loginCode}/kit-builder/premade`)}
          />
          <KitBuilderChoiceCard
            title="Make your own kit"
            onClick={() => navigate(`/orders/${university.loginCode}/kit-builder/custom`)}
          />
        </div>

        <div className="mt-36 max-lg:mt-16">
          <KitBuilderRequestForm
            onSubmit={({ request, fileName }) => {
              createActiveOrder(university.id, {
                kitName: fileName || 'Special request kit',
                notes: request,
                kitCount: 1,
                items: [
                  {
                    id: `request-${Date.now()}`,
                    name: request.trim() || fileName || 'Special component request',
                    price: 0,
                    quantity: 1,
                  },
                ],
              })
              navigate(`/orders/${university.loginCode}`)
            }}
          />
        </div>
      </div>
    </main>
  )
}
