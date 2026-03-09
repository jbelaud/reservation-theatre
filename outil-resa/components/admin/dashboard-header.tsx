'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DashboardHeaderProps {
    associationName: string
}

export function DashboardHeader({ associationName }: DashboardHeaderProps) {
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
        <div className="flex justify-end items-center">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors group">
                        <div className="text-right hidden sm:block">
                            <span className="block text-sm font-medium text-gray-900">Bonjour, {associationName}</span>
                            <span className="block text-xs text-gray-500">Administrateur</span>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-yellow-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover:ring-gray-200 transition-all">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${associationName}`}
                                alt="Avatar"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
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
    )
}
