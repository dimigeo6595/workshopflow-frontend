import { useLocation } from 'react-router'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useAuth } from '@/context/AuthProvider'

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/items': 'Items',
    '/workorders': 'Work Orders',
    '/inventory': 'Inventory',
    '/workstations': 'Workstations',
    '/users': 'Users',
}

const AppHeader = () => {
    const { pathname } = useLocation()
    const { user } = useAuth()
    const { theme, setTheme } = useTheme()

    const title =
        pageTitles[pathname] ??
        pageTitles[Object.keys(pageTitles).find(k => pathname.startsWith(k)) ?? ''] ??
        'WorkshopFlow'

    return (
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">

            {/* Τίτλος σελίδας */}
            <h1 className="text-lg font-semibold font-heading">{title}</h1>

            {/* Δεξιά μεριά */}
            <div className="flex items-center gap-4">

                {/* Dark / Light toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Avatar χρήστη */}
                {user && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium hidden sm:block">{user.username}</span>
                    </div>
                )}
            </div>
        </header>
    )
}

export default AppHeader
