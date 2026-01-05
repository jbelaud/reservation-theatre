import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, Percent, Copy, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-edge'
import { DashboardHeader } from '@/components/admin/dashboard-header'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface ShowWithReservations {
    id: string
    titre: string
    date: Date
    heure: string
    capacite: number
    reservations: Array<{ nbPlaces: number }>
}

async function getDashboardData(associationId: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // ⚡ OPTIMISATION: Exécuter toutes les requêtes en parallèle
    const [association, upcomingShows, showsThisMonth, reservationsThisMonth, activeShows] = await Promise.all([
        // 1. Récupérer l'association
        prisma.association.findUnique({
            where: { id: associationId },
            select: {
                nom: true,
                licenceActive: true,
                licenceExpire: true
            }
        }),

        // 2. Représentations à venir (pour la table)
        prisma.representation.findMany({
            where: {
                associationId,
                date: { gte: now }
            },
            orderBy: { date: 'asc' },
            take: 5,
            include: {
                reservations: {
                    select: { nbPlaces: true }
                }
            }
        }),

        // 3. Stats: Représentations ce mois-ci
        prisma.representation.count({
            where: {
                associationId,
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        }),

        // 4. Stats: Réservations ce mois-ci (créées ce mois-ci)
        prisma.reservation.aggregate({
            where: {
                representation: { associationId },
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            _sum: { nbPlaces: true }
        }),

        // 5. Stats: Taux de remplissage moyen (sur les représentations à venir)
        prisma.representation.findMany({
            where: { associationId, date: { gte: now } },
            include: { reservations: { select: { nbPlaces: true } } }
        })
    ])

    let totalFillRate = 0
    let showsWithCapacity = 0

        ; (activeShows as ShowWithReservations[]).forEach((show) => {
            if (show.capacite > 0) {
                const reserved = show.reservations.reduce((acc, r) => acc + r.nbPlaces, 0)
                totalFillRate += (reserved / show.capacite) * 100
                showsWithCapacity++
            }
        })

    const averageFillRate = showsWithCapacity > 0 ? Math.round(totalFillRate / showsWithCapacity) : 0

    return {
        associationName: association?.nom || 'Théâtre',
        licenceActive: association?.licenceActive ?? false,
        licenceExpire: association?.licenceExpire,
        upcomingShows: (upcomingShows as ShowWithReservations[]).map((show) => {
            const reserved = show.reservations.reduce((acc, r) => acc + r.nbPlaces, 0)
            const fillRate = show.capacite > 0 ? Math.round((reserved / show.capacite) * 100) : 0
            return {
                id: show.id,
                title: show.titre,
                date: show.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
                time: show.heure,
                reservations: reserved,
                capacity: show.capacite,
                fillRate,
                status: fillRate >= 100 ? 'Complet' : 'Disponible'
            }
        }),
        stats: {
            showsThisMonth,
            reservationsThisMonth: reservationsThisMonth._sum.nbPlaces || 0,
            fillRate: averageFillRate
        }
    }
}

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        redirect('/connexion')
    }

    const payload = await verifyToken(token)
    if (!payload) {
        redirect('/connexion')
    }

    const data = await getDashboardData(payload.associationId)

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 px-8 py-2.5 mb-8">
                <div className="flex items-center justify-between">
                    <LicenceStatus
                        active={data.licenceActive}
                        expireDate={data.licenceExpire ? data.licenceExpire.toISOString() : undefined}
                    />
                    <DashboardHeader associationName={data.associationName} />
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-8 space-y-8">
                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-3">
                    <StatCard
                        title="Représentations ce mois"
                        value={data.stats.showsThisMonth}
                        icon={Calendar}
                    />
                    <StatCard
                        title="Billets réservés"
                        value={data.stats.reservationsThisMonth}
                        icon={Users}
                    />
                    <StatCard
                        title="Taux de remplissage"
                        value={`${data.stats.fillRate}%`}
                        icon={Percent}
                    />
                </div>

                {/* Upcoming Shows Table */}
                <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="flex flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
                        <CardTitle className="text-lg font-bold text-gray-900">Prochaines Représentations</CardTitle>
                        <Link href="/dashboard/representations">
                            <Button variant="outline" size="sm" className="text-gray-600 rounded-lg border-gray-200 hover:bg-gray-50 h-8 text-xs">
                                Voir tout
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {data.upcomingShows.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-100 hover:bg-gray-100 border-gray-200">
                                        <TableHead className="w-[300px] py-3 pl-6 font-medium text-gray-600 text-xs uppercase tracking-wider">Nom du Spectacle</TableHead>
                                        <TableHead className="font-medium text-gray-600 text-xs uppercase tracking-wider">Date & Heure</TableHead>
                                        <TableHead className="font-medium text-gray-600 text-xs uppercase tracking-wider">Billets Réservés</TableHead>
                                        <TableHead className="font-medium text-gray-600 text-xs uppercase tracking-wider">Statut</TableHead>
                                        <TableHead className="text-right pr-6 font-medium text-gray-600 text-xs uppercase tracking-wider"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.upcomingShows.map((show) => (
                                        <TableRow key={show.id} className="hover:bg-gray-50/50 border-gray-50 transition-colors">
                                            <TableCell className="py-4 pl-6 font-semibold text-gray-900">{show.title}</TableCell>
                                            <TableCell className="text-gray-600 font-medium">{show.date}, {show.time}</TableCell>
                                            <TableCell className="text-gray-600 font-medium">
                                                {show.reservations}/{show.capacity}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={`rounded-full px-3 py-1 font-medium border-none ${show.status === 'Complet'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {show.status === 'Complet' ? 'Complet' : 'Disponible'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Link href={`/dashboard/representations/${show.id}`}>
                                                    <Button variant="link" className="text-blue-600 font-medium hover:text-blue-800 p-0 h-auto">
                                                        Voir détails
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-16 text-gray-500">
                                <p className="text-lg font-medium text-gray-900 mb-2">Aucune représentation à venir</p>
                                <p className="text-gray-500 mb-6">Commencez par créer votre première représentation</p>
                                <Link href="/dashboard/representations">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6">
                                        Créer une représentation
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon }: any) {
    return (
        <Card className="border border-gray-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] rounded-2xl relative overflow-hidden group hover:shadow-md transition-shadow bg-white">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 w-16 rounded-br-full" />
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
                        <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
                    </div>
                    <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function LicenceStatus({ active, expireDate }: { active: boolean, expireDate?: string }) {
    if (!active) {
        return (
            <div className="flex items-center gap-4 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                <div className="flex flex-col">
                    <span className="text-red-700 font-semibold text-sm">Licence Inactive</span>
                    <span className="text-red-500 text-xs">Votre compte est désactivé</span>
                </div>
                <Button variant="destructive" size="sm">
                    Contacter l'administrateur
                </Button>
            </div>
        )
    }

    const expire = expireDate ? new Date(expireDate) : null
    const now = new Date()
    const isExpiringSoon = expire ? (expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30 : false

    return (
        <div className={`flex items-center gap-4 px-4 py-2 rounded-lg border ${isExpiringSoon ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex flex-col">
                <span className={`font-semibold text-sm ${isExpiringSoon ? 'text-orange-700' : 'text-green-700'}`}>
                    Licence Active
                </span>
                {expire && (
                    <span className={`text-xs ${isExpiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
                        Jusqu'au {expire.toLocaleDateString('fr-FR')}
                    </span>
                )}
            </div>

            <RibModal />
        </div>
    )
}

function RibModal() {
    const rib = {
        titulaire: "ETS BELAUD",
        banque: "Banque Populaire",
        iban: "FR76 1234 5678 9012 3456 7890 123",
        bic: "BPOPFRPP"
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 text-xs border-green-200 text-green-700 hover:bg-green-100 uppercase font-semibold">
                    Payer / Voir RIB
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Informations de paiement</DialogTitle>
                    <DialogDescription>
                        Effectuez un virement pour renouveler votre licence annuelle (299€).
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2 p-4 bg-slate-50 rounded-lg border">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500">TITULAIRE DU COMPTE</p>
                            <p className="text-sm font-semibold">{rib.titulaire}</p>
                        </div>
                        <div className="space-y-1 mt-2">
                            <p className="text-xs font-medium text-gray-500">IBAN</p>
                            <div className="flex items-center justify-between bg-white p-2 rounded border">
                                <code className="text-sm font-mono">{rib.iban}</code>
                                {/* Client component needed for interactivity */}
                            </div>
                        </div>
                        <div className="flex gap-4 mt-2">
                            <div className="space-y-1 flex-1">
                                <p className="text-xs font-medium text-gray-500">BIC / SWIFT</p>
                                <p className="text-sm font-mono bg-white p-1 px-2 rounded border inline-block">{rib.bic}</p>
                            </div>
                            <div className="space-y-1 flex-1">
                                <p className="text-xs font-medium text-gray-500">BANQUE</p>
                                <p className="text-sm">{rib.banque}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-md flex gap-2">
                    <CreditCard className="w-4 h-4 flex-shrink-0" />
                    <p>Une fois le virement effectué, votre licence sera renouvelée automatiquement dans les 24h suivant la réception.</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
