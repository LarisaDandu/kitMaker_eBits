import { Outlet } from 'react-router'
import { UniversitiesProvider } from '../../context/UniversitiesContext'

export default function AdminLayout() {
  return (
    <UniversitiesProvider>
      <Outlet />
    </UniversitiesProvider>
  )
}
