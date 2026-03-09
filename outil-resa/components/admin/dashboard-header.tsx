'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DashboardHeaderProps {
    associationName: string
    isSidebar?: boolean
}

export function DashboardHeader({ associationName, isSidebar = false }: DashboardHeaderProps) {
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
        <div className={cn("flex items-center", isSidebar ? "w-full" : "justify-end")}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <div className={cn(
                        "flex items-center gap-3 cursor-pointer hover:bg-gray-100/50 p-1.5 rounded-lg transition-colors group",
                        isSidebar ? "w-full" : ""
                    )}>
                        <div className={cn(
                            "h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover:ring-gray-200 transition-all shrink-0 relative",
                        )}>
                            <Image
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${associationName}`}
                                alt="Avatar"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className={cn("text-left overflow-hidden", isSidebar ? "flex-1" : "hidden sm:block")}>
                            {!isSidebar && <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">Bonjour</span>}
                            <span className="block text-sm font-bold text-gray-900 truncate">{associationName}</span>
                            <span className="block text-xs text-gray-500">Administrateur</span>
                        </div>
                        <ChevronDown className={cn(
                            "h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0",
                            isOpen ? "rotate-180" : ""
                        )} />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align={isSidebar ? "center" : "end"} side={isSidebar ? "top" : "bottom"}>
                    <div className="px-2 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-100 mb-1">
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
