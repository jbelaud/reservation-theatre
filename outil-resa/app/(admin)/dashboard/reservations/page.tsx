import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-edge'
import { ReservationsClient } from './reservations-client'
import { DashboardHeader } from '@/components/admin/dashboard-header'

export default async function ReservationsPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        redirect('/connexion')
    }

    const payload = await verifyToken(token)
    if (!payload) {
        redirect('/connexion')
    }

    const association = await prisma.association.findUnique({
        where: { id: payload.associationId },
        select: { nom: true }
    })

    const reservations = await prisma.reservation.findMany({
        where: {
            representation: {
                associationId: payload.associationId
            }
        },
        include: {
            representation: {
                select: {
                    titre: true,
                    date: true,
                    heure: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const allRepresentations = await prisma.representation.findMany({
        where: {
            associationId: payload.associationId,
        },
        orderBy: { date: 'desc' },
        select: {
            id: true,
            titre: true,
            date: true,
            heure: true
        }
    })

    const formattedRepresentations = allRepresentations.map(r => ({
        id: r.id,
        titre: r.titre,
        date: format(new Date(r.date), 'd MMM yyyy', { locale: fr }),
        rawDate: r.date.toISOString(),
        heure: r.heure
    }))

    const formattedReservations = reservations.map(r => ({
        id: r.id,
        prenom: r.prenom,
        nom: r.nom,
        telephone: r.telephone,
        email: r.email || undefined,
        nbPlaces: r.nbPlaces,
        sieges: (r.sieges as unknown as string[]) || [],
        statut: r.statut,
        createdAt: r.createdAt.toISOString(),
        representationId: r.representationId,
        representationTitle: r.representation.titre,
        representationRawDate: r.representation.date.toISOString(),
        representationDate: `${format(new Date(r.representation.date), 'd MMM yyyy', { locale: fr })} à ${r.representation.heure}`
    }))

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <div className="bg-white border-b border-gray-200 px-8 py-2.5 mb-8">
                <DashboardHeader associationName={association?.nom || 'Théâtre'} />
            </div>

            <div className="max-w-[1600px] mx-auto px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Toutes les réservations</h1>
                        <p className="text-gray-500">Gérez l'ensemble des réservations de vos représentations</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <ReservationsClient
                        reservations={formattedReservations}
                        representations={formattedRepresentations}
                    />
                </div>
            </div>
        </div>
    )
}
