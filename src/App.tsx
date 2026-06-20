import { Route, Routes, Navigate } from 'react-router'
import LoginPage from '@/pages/LoginPage'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/components/AppLayout'


// Placeholders — θα γίνουν πραγματικές σελίδες σύντομα
import DashboardPage from '@/pages/DashboardPage'
const ItemsPage = () => <div><h2 className="text-2xl font-bold mb-2">Items</h2><p className="text-muted-foreground">Coming soon...</p></div>
const WorkOrdersPage = () => <div><h2 className="text-2xl font-bold mb-2">Work Orders</h2><p className="text-muted-foreground">Coming soon...</p></div>
const InventoryPage = () => <div><h2 className="text-2xl font-bold mb-2">Inventory</h2><p className="text-muted-foreground">Coming soon...</p></div>
const WorkstationsPage = () => <div><h2 className="text-2xl font-bold mb-2">Workstations</h2><p className="text-muted-foreground">Coming soon...</p></div>
const UsersPage = () => <div><h2 className="text-2xl font-bold mb-2">Users</h2><p className="text-muted-foreground">Coming soon...</p></div>

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

