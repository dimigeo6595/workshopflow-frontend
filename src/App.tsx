import { Route, Routes, Navigate } from 'react-router'
import LoginPage from '@/pages/LoginPage'
import ProtectedRoute from '@/components/ProtectedRoute'
// Layout and pages will be added progressively
// import AppLayout from '@/components/AppLayout'
// import DashboardPage from '@/pages/DashboardPage'

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected — all app routes go here */}
      <Route element={<ProtectedRoute />}>
        {/*
          Will become:
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/workorders" element={<WorkOrdersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/workstations" element={<WorkstationsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        */}

        {/* Temporary placeholder until AppLayout is built */}
        <Route
          path="/dashboard"
          element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">Dashboard (coming soon)</h1>
            </div>
          }
        />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
