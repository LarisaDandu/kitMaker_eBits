import { NavLink, Outlet } from 'react-router'
import { cn } from '../lib/cn'

export default function Layout() {
  return (
    <div className={cn('mx-auto max-w-[960px] px-8 py-8 text-left')}>
      <header>
        <nav className="mb-8 flex gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                'font-body font-medium text-text no-underline',
                isActive && 'text-accent-2 underline',
              )
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              cn(
                'font-body font-medium text-text no-underline',
                isActive && 'text-accent-2 underline',
              )
            }
          >
            About
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                'font-body font-medium text-text no-underline',
                isActive && 'text-accent-2 underline',
              )
            }
          >
            Admin
          </NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
