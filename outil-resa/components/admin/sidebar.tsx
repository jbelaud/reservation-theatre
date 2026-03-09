import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Users, Armchair, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardHeader } from './dashboard-header'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Représentations', href: '/dashboard/representations', icon: Calendar },
  { name: 'Réservations', href: '/dashboard/reservations', icon: Users },
  { name: 'Plan de salle', href: '/dashboard/plan-salle', icon: Armchair },
  { name: 'Paramètres', href: '/dashboard/parametres', icon: Settings },
]

interface SidebarProps {
  associationName: string
}

export function Sidebar({ associationName }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-[#F3F4F6] border-r border-gray-200">
      <div className="flex h-20 items-center justify-center px-6">
        <Image
          src="/icon.png"
          alt="Resavo Logo"
          width={40}
          height={40}
          className="object-contain rounded-lg"
        />
        <span className="ml-2 font-bold text-xl text-primary">Resavo</span>
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
                    ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <DashboardHeader associationName={associationName} isSidebar={true} />
      </div>
    </div>
  )
}
