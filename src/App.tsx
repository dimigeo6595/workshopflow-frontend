import { Route, Routes, Navigate } from 'react-router'
import LoginPage from '@/pages/LoginPage'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/components/AppLayout'



import DashboardPage from '@/pages/DashboardPage'
import ItemsPage from '@/pages/ItemsPage'
import WorkOrdersPage from '@/pages/WorkOrdersPage'
import InventoryPage from '@/pages/InventoryPage'
import WorkstationsPage from '@/pages/WorkstationsPage'
import UsersPage from '@/pages/UsersPage'

function App() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected — πρώτα ελέγχει auth, μετά δείχνει layout */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/items" element={<ItemsPage />} />
                    <Route path="/workorders" element={<WorkOrdersPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/workstations" element={<WorkstationsPage />} />
                    <Route path="/users" element={<UsersPage />} />

                </Route>
            </Route>

            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

export default App

