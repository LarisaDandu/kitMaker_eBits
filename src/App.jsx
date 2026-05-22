import { Outlet, Routes, Route } from 'react-router'
import Layout from './components/Layout'
import { UniversitiesProvider } from './context/UniversitiesContext'
import Home from './pages/Home'
import About from './pages/About'
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

function OrdersLayout() {
  return (
    <UniversitiesProvider>
      <Outlet />
    </UniversitiesProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/orders/:loginCode" element={<OrdersLayout />}>
        <Route index element={<CustomerOrdersPage />} />
        <Route path="dashboard" element={<CustomerKitDashboardPage />} />
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
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  )
}
