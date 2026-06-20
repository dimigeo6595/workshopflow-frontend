import { Link, useLocation, useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthProvider'
import { toast } from 'sonner'
import {
    Factory,
    LayoutDashboard,
    Package,
    ClipboardList,
    Warehouse,
    Wrench,
    Users,
    ChevronLeft,
    ChevronRight,
    LogOut,
} from 'lucide-react'

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/items', label: 'Items', icon: Package },
    { to: '/workorders', label: 'Work Orders', icon: ClipboardList },
    { to: '/inventory', label: 'Inventory', icon: Warehouse },
    { to: '/workstations', label: 'Workstations', icon: Wrench },
    { to: '/users', label: 'Users', icon: Users },
]

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
    const { pathname } = useLocation()
    const { user, logoutUser } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logoutUser()
        toast.success('Logged out!')
        navigate('/login')
    }

    return (
        <aside
            className={cn(
                'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0',
                collapsed ? 'w-16' : 'w-60',
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
                <div className="bg-primary rounded-lg p-1.5 shrink-0">
                    <Factory className="w-5 h-5 text-primary-foreground" />
                </div>
                {!collapsed && (
                    <span className="font-bold text-sidebar-foreground font-heading truncate">
            WorkshopFlow
          </span>
                )}
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => {
                    const active = pathname === to || pathname.startsWith(to + '/')
                    return (
                        <Link
                            key={to}
                            to={to}
                            title={collapsed ? label : undefined}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                collapsed && 'justify-center px-2',
                            )}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            {!collapsed && <span>{label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* User info + logout + collapse toggle */}
            <div className="border-t border-sidebar-border p-3 shrink-0 space-y-1">
                {!collapsed && user && (
                    <div className="px-3 py-2">
                        <p className="text-xs font-medium text-sidebar-foreground truncate">{user.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    title={collapsed ? 'Logout' : undefined}
                    className={cn(
                        'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
                        collapsed && 'justify-center px-2',
                    )}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>

                <button
                    onClick={onToggle}
                    className={cn(
                        'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent transition-colors',
                        collapsed && 'justify-center px-2',
                    )}
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5 shrink-0" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5 shrink-0" />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    )
}

export default Sidebar