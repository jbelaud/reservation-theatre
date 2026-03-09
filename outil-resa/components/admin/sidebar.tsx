'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Calendar, Users, Armchair, Settings, ChevronDown, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/connexion')
      router.refresh()
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-[#F3F4F6] border-r border-gray-200">
      <div className="flex h-20 items-center justify-center px-6">
        <Link href="/">
          <Image
            src="/resavo-logo.png"
            alt="Resavo Logo"
            width={150}
            height={60}
            className="h-16 w-auto object-contain cursor-pointer"
          />
        </Link>
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

      <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors group w-full">
              <div className="h-9 w-9 rounded-full bg-yellow-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover:ring-gray-200 transition-all shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${associationName}`}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="block text-sm font-bold text-gray-900 truncate">{associationName}</span>
                <span className="block text-xs text-gray-500">Administrateur</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="center" side="top">
            <div className="px-2 py-1.5 text-sm font-medium text-gray-500 border-b border-gray-100 mb-1">
              Mon compte
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => router.push('/dashboard/parametres')}
            >
              <User className="mr-2 h-4 w-4" />
              Profil
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
