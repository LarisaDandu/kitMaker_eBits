import LoginForm from '../components/login/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-svh bg-background px-7 py-14 max-lg:px-5 max-lg:py-8">
      <div className="mx-auto grid min-h-[calc(100svh-7rem)] w-full max-w-[1900px] grid-cols-[minmax(420px,0.95fr)_minmax(420px,0.78fr)] items-stretch gap-32 max-xl:gap-16 max-lg:min-h-0 max-lg:grid-cols-1">
        <section className="overflow-hidden rounded-[72px] max-lg:max-h-[520px] max-sm:rounded-[36px]">
          <img
            src={`${import.meta.env.BASE_URL}kitmaker_img.png`}
            alt="Electronics kit with breadboards, wires, LEDs, and robotic arms"
            className="h-full min-h-[520px] w-full object-cover max-lg:min-h-0"
          />
        </section>

        <section className="flex items-center justify-center">
          <LoginForm />
        </section>
      </div>
    </main>
  )
}
