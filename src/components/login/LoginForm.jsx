import { useId, useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../ui/Button'
import FormInput from '../ui/FormInput'
import { useUniversities } from '../../hooks/useUniversities'
import { cn } from '../../lib/cn'

const LOGIN_MODES = {
  SCHOOL: 'school',
  ADMIN: 'admin',
}

export default function LoginForm() {
  const [mode, setMode] = useState(LOGIN_MODES.SCHOOL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const inputId = useId()
  const navigate = useNavigate()
  const { universities, isLoading, error: loadError } = useUniversities()

  const isAdmin = mode === LOGIN_MODES.ADMIN
  const hasPassword = password.trim().length > 0 && !isLoading
  const title = isAdmin
    ? 'Enter the admin password to continue'
    : "Enter the school's unique code to continue"

  function switchMode() {
    setMode((currentMode) =>
      currentMode === LOGIN_MODES.SCHOOL ? LOGIN_MODES.ADMIN : LOGIN_MODES.SCHOOL,
    )
    setPassword('')
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const normalizedPassword = password.trim()

    if (isAdmin) {
      if (normalizedPassword === 'admin') {
        navigate('/admin')
        return
      }

      setError('The admin password is incorrect.')
      return
    }

    const school = universities.find(
      (university) =>
        university.loginCode.toLowerCase() === normalizedPassword.toLowerCase(),
    )

    if (school) {
      navigate(`/orders/${school.loginCode}`)
      return
    }

    setError(loadError || 'No school matches that code.')
  }

  return (
    <form
      className="flex min-h-[520px] w-full flex-col justify-between gap-12 py-2"
      onSubmit={handleSubmit}
    >
      <div>
        <h1 className="m-0 font-headline text-[clamp(2.25rem,4vw,4.4rem)] leading-none tracking-normal text-accent-2 uppercase">
          EBITS KIT MAKER LOGIN
        </h1>

        <div className="mt-28 max-w-[600px] max-lg:mt-14">
          <label
            htmlFor={inputId}
            className="mb-5 block text-xl font-bold text-text max-sm:text-base"
          >
            {title}
          </label>
          <FormInput
            id={inputId}
            type="password"
            value={password}
            autoComplete={isAdmin ? 'current-password' : 'one-time-code'}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className="h-[60px] rounded-[20px] border-accent-2 bg-transparent px-6 text-lg"
            onChange={(event) => {
              setPassword(event.target.value)
              setError('')
            }}
          />
          <p
            id={`${inputId}-error`}
            className={cn(
              'mt-3 min-h-6 text-sm font-semibold text-accent-2',
              !error && 'invisible',
            )}
          >
            {error || 'No login error'}
          </p>

          <Button
            type="submit"
            fullWidth
            rounded="md"
            className={cn(
              'mt-20 h-16 rounded-[20px] border border-accent-1 text-3xl font-normal text-accent-1-lighter max-sm:mt-12 max-sm:text-2xl',
              hasPassword
                ? 'bg-[#1f2034] hover:bg-[#171827]'
                : 'bg-[#737783] hover:bg-[#666a76]',
            )}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Login'}
          </Button>
        </div>
      </div>

      <Button
        variant="outline"
        rounded="md"
        className="h-12 w-[340px] rounded-[14px] border-2 border-accent-2 bg-transparent text-xl font-normal text-text hover:bg-background max-sm:w-full max-sm:text-base"
        onClick={switchMode}
      >
        {isAdmin ? 'Switch to uni login' : 'Switch to admin login'}
      </Button>
    </form>
  )
}
