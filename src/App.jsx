import { Routes, Route } from 'react-router'
import { UniversitiesProvider } from './context/UniversitiesContext'
import LoginPage from './pages/LoginPage'
import AddComponentsPage from './pages/AddComponentsPage'
import CustomerKitBuilderPage from './pages/CustomerKitBuilderPage'
import CustomerKitDashboardPage from './pages/CustomerKitDashboardPage'
import CustomerOrdersPage from './pages/CustomerOrdersPage'
import MakeYourOwnKitPage from './pages/MakeYourOwnKitPage'
import PremadeKitsPage from './pages/PremadeKitsPage'
import PreviousOrderPage from './pages/PreviousOrderPage'
import ReorderPage from './pages/ReorderPage'
import AdminLayout from './pages/admin/AdminLayout'
import ClientsOverview from './pages/admin/ClientsOverview'
import CustomerFormPage from './pages/admin/CustomerFormPage'
import UniversityDetailPage from './pages/admin/UniversityDetailPage'

export default function App() {
  return (
    <UniversitiesProvider>
      <Routes>
        <Route path="/orders/:loginCode">
          <Route index element={<CustomerOrdersPage />} />
          <Route path="dashboard" element={<CustomerKitDashboardPage />} />
          <Route path="dashboard/:orderId" element={<CustomerKitDashboardPage />} />
          <Route path="dashboard/:orderId/add-components" element={<AddComponentsPage />} />
          <Route path="kit-builder" element={<CustomerKitBuilderPage />} />
          <Route path="kit-builder/custom" element={<MakeYourOwnKitPage />} />
          <Route path="kit-builder/premade" element={<PremadeKitsPage />} />
          <Route path="previous/:orderId" element={<PreviousOrderPage />} />
          <Route path="previous/:orderId/reorder" element={<ReorderPage />} />
          <Route
            path="previous/:orderId/add-components"
            element={<AddComponentsPage />}
          />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ClientsOverview />} />
          <Route path="customers/new" element={<CustomerFormPage />} />
          <Route path="customers/:id" element={<UniversityDetailPage />} />
          <Route path="customers/:id/edit" element={<CustomerFormPage />} />
        </Route>
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </UniversitiesProvider>
  )
}
