import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        today.setDate(today.getDate() - 1)

        const association = await prisma.association.findUnique({
            where: { slug },
            include: {
                representations: {
                    where: {
                        date: {
                            gte: today
                        }
                    },
                    orderBy: {
                        date: 'asc'
                    },
                    include: {
                        reservations: true
                    }
                },
                plansSalle: true
            }
        })

        if (!association) {
            return NextResponse.json(
                { error: 'Association non trouvée' },
                { status: 404 }
            )
        }

        // Récupérer si pmrDouble est actif
        let pmrDouble = true
        if (association.plansSalle?.[0]?.structure) {
            try {
                const structure = JSON.parse(association.plansSalle[0].structure)
                pmrDouble = structure.pmrDouble !== false
            } catch { }
        }

        // Calculer placesRestantes pour chaque représentation
        const representationsWithStats = association.representations.map((rep: any) => {
            // Parse les places PMR réservées
            let placesPmrArray: string[] = []
            if (typeof rep.placesPmr === 'string') {
                try { placesPmrArray = JSON.parse(rep.placesPmr) } catch { }
            } else if (Array.isArray(rep.placesPmr)) {
                placesPmrArray = rep.placesPmr
            }

            // Calculer les tickets vendus (somme des nbPlaces des réservations)
            const ticketsVendus = rep.reservations?.reduce((acc: number, r: any) => acc + (r.nbPlaces || 0), 0) || 0

            // Capacité de vente dynamique :
            // Si PMR double actif : capacité = capacité de base - nb PMR réservés
            // Car chaque siège PMR prend 2 places physiques mais compte pour 1 ticket
            const nbPmrReserves = placesPmrArray.length
            const capaciteVente = pmrDouble ? rep.capacite - nbPmrReserves : rep.capacite

            const placesRestantes = capaciteVente - ticketsVendus

            // Ne pas exposer les réservations au public
            const { reservations, ...repWithoutReservations } = rep

            return {
                ...repWithoutReservations,
                placesRestantes,
                capaciteVente
            }
        })

        // Ne pas exposer plansSalle au public
        const { plansSalle, ...associationWithoutPlans } = association

        return NextResponse.json({
            ...associationWithoutPlans,
            representations: representationsWithStats
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
