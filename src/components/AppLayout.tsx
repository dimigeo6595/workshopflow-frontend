import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import Sidebar from '@/components/Sidebar'
import AppHeader from '@/components/AppHeader'
import { useState } from 'react'

const AppLayout = () => {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
            <Toaster />
        </div>
    )
}

export default AppLayout
