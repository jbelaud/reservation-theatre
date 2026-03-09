'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Users, Armchair, Settings, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Représentations', href: '/dashboard/representations', icon: Calendar },
  { name: 'Réservations', href: '/dashboard/reservations', icon: Users },
  { name: 'Plan de salle', href: '/dashboard/plan-salle', icon: Armchair },
  { name: 'Paramètres', href: '/dashboard/parametres', icon: Settings },
]

// Fonction pour générer les initiales à partir du nom
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }
  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
}

interface SidebarProps {
  associationName: string
}

export function Sidebar({ associationName }: SidebarProps) {
  const pathname = usePathname()
  const initials = getInitials(associationName)

  return (
    <div className="flex h-full w-64 flex-col bg-[#F3F4F6] border-r border-gray-200">
      <div className="flex h-20 items-center justify-center px-6">
        <img
          src="/resavo-logo.png"
          alt="Resavo Logo"
          className="h-16 w-auto object-contain"
        />
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
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 m-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xs ring-2 ring-white">
            {initials}
          </div>
          <div className="text-sm overflow-hidden">
            <p className="font-medium text-gray-900 truncate">{associationName}</p>
            <p className="text-xs text-gray-500 truncate">Administrateur</p>
          </div>
        </div>
      </div>
    </div>
  )
}
