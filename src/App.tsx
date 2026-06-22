import { Route, Routes, Navigate } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import LoginPage from '@/pages/LoginPage'
import ProtectedRoute from '@/components/ProtectedRoute'
import CapabilityRoute from '@/components/CapabilityRoute'
import AppLayout from '@/components/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import ItemsPage from '@/pages/ItemsPage'
import WorkOrdersPage from '@/pages/WorkOrdersPage'
import InventoryPage from '@/pages/InventoryPage'
import WorkstationsPage from '@/pages/WorkstationsPage'
import UsersPage from '@/pages/UsersPage'

function App() {
    return (
        <>
            <Toaster position="top-right" />
            <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>

                        {/* Όλοι οι authenticated χρήστες */}
                        <Route path="/dashboard" element={<DashboardPage />} />

                        {/* VIEW_ITEMS: ADMIN, PROD_ENG, OPERATOR, WAREHOUSE */}
                        <Route element={<CapabilityRoute capability="VIEW_ITEMS" />}>
                            <Route path="/items" element={<ItemsPage />} />
                        </Route>

                        {/* VIEW_WORK_ORDERS: ADMIN, PROD_ENG, OPERATOR */}
                        <Route element={<CapabilityRoute capability="VIEW_WORK_ORDERS" />}>
                            <Route path="/workorders" element={<WorkOrdersPage />} />
                        </Route>

                        {/* VIEW_INVENTORY: ADMIN, PROD_ENG, WAREHOUSE */}
                        <Route element={<CapabilityRoute capability="VIEW_INVENTORY" />}>
                            <Route path="/inventory" element={<InventoryPage />} />
                        </Route>

                        {/* VIEW_MACHINES: ADMIN, PROD_ENG */}
                        <Route element={<CapabilityRoute capability="VIEW_MACHINES" />}>
                            <Route path="/workstations" element={<WorkstationsPage />} />
                        </Route>

                        {/* VIEW_USERS: ADMIN, PROD_ENG */}
                        <Route element={<CapabilityRoute capability="VIEW_USERS" />}>
                            <Route path="/users" element={<UsersPage />} />
                        </Route>

                    </Route>
                </Route>

                {/* Default redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </>
    )
}

export default App