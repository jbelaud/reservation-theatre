'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CheckCircle, Euro } from 'lucide-react'

interface Stats {
    totalAssociations: number
    activeLicences: number
    revenusEstimes: number
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalAssociations: 0,
        activeLicences: 0,
        revenusEstimes: 0
    })

    useEffect(() => {
        fetch('/api/admin/associations')
            .then(res => res.json())
            .then(data => {
                if (data.associations) {
                    const assocs = data.associations
                    const activeLicences = assocs.filter((a: any) => a.licenceActive).length
                    setStats({
                        totalAssociations: assocs.length,
                        activeLicences,
                        revenusEstimes: activeLicences * 299
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
                            Comptes créés sur la plateforme
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Licences Actives
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeLicences}</div>
                        <p className="text-xs text-muted-foreground">
                            Associations avec licence valide
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">
                            Revenus Annuels Estimés
                        </CardTitle>
                        <Euro className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{stats.revenusEstimes} €</div>
                        <p className="text-xs text-green-600">
                            {stats.activeLicences} licence{stats.activeLicences > 1 ? 's' : ''} × 299€/an
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
