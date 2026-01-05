'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Gestion Resavo', href: '/admin/dashboard/resavo', icon: Building2 },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = () => {
        // Supprimer le cookie via une API ou juste rediriger (le cookie est httpOnly, donc on doit appeler une API de logout idéalement)
        // Pour l'instant, on redirige juste vers la page de login, le cookie expirera ou sera écrasé
        document.cookie = 'admin_token=; Max-Age=0; path=/;'
        router.push('/admin')
    }

    return (
        <div className="flex h-full w-64 flex-col bg-gray-900 border-r border-gray-800 text-gray-100">
            <div className="flex h-20 items-center justify-center px-6 border-b border-gray-800">
                <h1 className="text-xl font-bold text-white">Admin Resavo</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                                        isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                                    )}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-400 rounded-xl hover:bg-red-900/20 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Déconnexion
                </button>
            </div>
        </div>
    )
}
