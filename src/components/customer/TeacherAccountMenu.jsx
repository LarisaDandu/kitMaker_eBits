import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { cn } from '../../lib/cn'

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

export default function TeacherAccountMenu({ university, className }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) return undefined

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function handleSignOut() {
    setIsOpen(false)
    navigate('/')
  }

  return (
    <div ref={menuRef} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        className="flex items-center gap-3 border-none bg-transparent p-0 font-body text-base text-text"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{university.name}</span>
        <UserIcon />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[225px] rounded-lg bg-background-secondary px-4 py-6 text-xl text-text shadow-[0_14px_35px_rgba(31,32,52,0.12)]"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="m-0 font-medium capitalize">{university.name}</p>
            <button
              type="button"
              className="border-none bg-transparent p-0 text-2xl leading-none text-text"
              aria-label="Close account menu"
              onClick={() => setIsOpen(false)}
            >
              X
            </button>
          </div>

          <div className="flex flex-col items-start gap-4">
            <button
              type="button"
              role="menuitem"
              className="border-none bg-transparent p-0 text-left text-xl text-text"
              onClick={handleSignOut}
            >
              Sign out
            </button>
            <Link
              role="menuitem"
              className="text-xl text-text no-underline"
              to={`/orders/${university.loginCode}/dashboard`}
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              role="menuitem"
              className="text-xl text-text no-underline"
              to={`/orders/${university.loginCode}`}
              onClick={() => setIsOpen(false)}
            >
              Orders
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
