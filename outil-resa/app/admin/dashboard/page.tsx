'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Ticket } from 'lucide-react'

interface Stats {
    totalAssociations: number
    totalRepresentations: number
    activeLicences: number
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalAssociations: 0,
        totalRepresentations: 0,
        activeLicences: 0
    })

    useEffect(() => {
        // Pour l'instant on mock les stats ou on les récupère via l'API associations
        fetch('/api/admin/associations')
            .then(res => res.json())
            .then(data => {
                if (data.associations) {
                    const assocs = data.associations
                    setStats({
                        totalAssociations: assocs.length,
                        totalRepresentations: assocs.reduce((acc: number, curr: any) => acc + curr.nbRepresentations, 0),
                        activeLicences: assocs.filter((a: any) => a.licenceActive).length
                    })
                }
            })
            .catch(err => console.error(err))
    }, [])

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-gray-600 mt-2">
                    Vue d'ensemble de l'activité de la plateforme Resavo
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Associations
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalAssociations}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeLicences} licences actives
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Représentations
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRepresentations}</div>
                        <p className="text-xs text-muted-foreground">
                            Sur toute la plateforme
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Revenus estimés
                        </CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0 €</div>
                        <p className="text-xs text-muted-foreground">
                            Module de paiement non actif
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
