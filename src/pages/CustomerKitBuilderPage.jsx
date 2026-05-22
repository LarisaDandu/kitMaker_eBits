import { useNavigate, useParams } from 'react-router'
import KitBuilderChoiceCard from '../components/kits/KitBuilderChoiceCard'
import KitBuilderRequestForm from '../components/kits/KitBuilderRequestForm'
import { useUniversityByLoginCode } from '../hooks/useUniversityByLoginCode'

function UserIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function CustomerKitBuilderPage() {
  const { loginCode } = useParams()
  const navigate = useNavigate()
  const university = useUniversityByLoginCode(loginCode)

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
          <div className="flex items-center gap-3 text-base max-sm:hidden">
            <span>{university.name}</span>
            <UserIcon />
          </div>
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
            onSubmit={() => window.alert('Order submitted (demo)')}
          />
        </div>
      </div>
    </main>
  )
}
