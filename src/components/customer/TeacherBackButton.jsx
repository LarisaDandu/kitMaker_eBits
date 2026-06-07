import { useNavigate } from 'react-router'
import Button from '../ui/Button'

export default function TeacherBackButton({ to, children = 'Back', className = '' }) {
  const navigate = useNavigate()

  return (
    <Button
      type="button"
      variant="outlineStrong"
      rounded="xl"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={className}
    >
      <BackIcon />
      {children}
    </Button>
  )
}

function BackIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18 9 12l6-6M10 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
