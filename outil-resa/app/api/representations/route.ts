// app/api/representations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedAssociation, getErrorMessage } from '@/lib/api-helpers'

// Schéma de validation pour créer une représentation (multi-dates)
const createRepresentationSchema = z.object({
    titre: z.string().min(1, 'Le titre est requis'),
    dates: z.array(z.string().datetime('Date invalide')).min(1, 'Au moins une date est requise'),
    heure: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Heure invalide (format HH:MM)'),
    capacite: z.number().int().positive('La capacité doit être supérieure à 0'),
    description: z.string().optional(),
})

/**
 * POST /api/representations
 * Créer une ou plusieurs nouvelles représentations
 */
export async function POST(request: NextRequest) {
    try {
        // Authentification
        const associationId = await getAuthenticatedAssociation(request)

        // Validation des données
        const body = await request.json()
        const validatedData = createRepresentationSchema.parse(body)

        // Création des représentations en transaction
        const representations = await prisma.$transaction(
            validatedData.dates.map((dateStr) =>
                prisma.representation.create({
                    data: {
                        titre: validatedData.titre,
                        date: new Date(dateStr),
                        heure: validatedData.heure,
                        capacite: validatedData.capacite,
                        description: validatedData.description,
                        placesOccupees: "[]",
                        associationId,
                    },
                })
            )
        )

        return NextResponse.json(representations, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Données invalides', details: error.issues },
                { status: 400 }
            )
        }

        const message = getErrorMessage(error)
        const status = message === 'Non authentifié' || message === 'Token invalide' ? 401 : 500

        return NextResponse.json({ error: message }, { status })
    }
}

/**
 * GET /api/representations
 * Lister toutes les représentations de l'association
 */
export async function GET(request: NextRequest) {
    try {
        // Authentification
        const associationId = await getAuthenticatedAssociation(request)

        // Récupérer le plan de salle pour connaître le nombre total de sièges PMR
        const planSalle = await prisma.planSalle.findUnique({
            where: { associationId }
        })

        let nbPmrTotal = 0
        if (planSalle) {
            try {
                const structure = JSON.parse(planSalle.structure)
                nbPmrTotal = structure.rangees.reduce(
                    (acc: number, row: any) => acc + (row.pmr?.length || 0),
                    0
                )
            } catch (e) {
                // Si erreur de parsing, on laisse à 0
            }
        }

        // Récupération des représentations avec statistiques
        const representations = await prisma.representation.findMany({
            where: { associationId },
            include: {
                _count: {
                    select: { reservations: true },
                },
            },
            orderBy: { date: 'asc' },
        })

        // Calcul des places restantes pour chaque représentation
        const representationsWithStats = representations.map((rep: any) => {
            // Parse les places occupées (String JSON)
            let placesOccupeesArray: string[] = []
            if (typeof rep.placesOccupees === 'string') {
                try { placesOccupeesArray = JSON.parse(rep.placesOccupees) } catch { }
            } else if (Array.isArray(rep.placesOccupees)) {
                placesOccupeesArray = rep.placesOccupees
            }

            // Parse les places PMR réservées
            let placesPmrArray: string[] = []
            if (typeof rep.placesPmr === 'string') {
                try { placesPmrArray = JSON.parse(rep.placesPmr) } catch { }
            } else if (Array.isArray(rep.placesPmr)) {
                placesPmrArray = rep.placesPmr
            }

            // Logique de capacité dynamique :
            // - Capacité de base = rep.capacite (ex: 216 places physiques)
            // - Si 1 siège PMR réservé : capacité vente = 216 - 1 = 215 tickets
            // - Si 3 sièges PMR réservés : capacité vente = 216 - 3 = 213 tickets
            // Car chaque siège PMR prend 2 places physiques mais compte pour 1 ticket
            const nbPmrReserves = placesPmrArray.length
            const capaciteVente = rep.capacite - nbPmrReserves

            // Calculer le nombre de tickets vendus (somme des nbPlaces des réservations)
            const ticketsVendus = rep.reservations?.reduce((acc: number, r: any) => acc + (r.nbPlaces || 0), 0) || 0

            const placesRestantes = capaciteVente - ticketsVendus

            return {
                ...rep,
                placesOccupees: placesOccupeesArray,
                nbReservations: rep._count.reservations,
                placesRestantes,
                capaciteVente, // Capacité dynamique pour cette représentation
                nbPmrReserves, // Nombre de sièges PMR réservés
                nbPmrTotal, // Nombre total de sièges PMR disponibles dans le plan de salle
                tauxRemplissage: capaciteVente > 0 ? Math.round((ticketsVendus / capaciteVente) * 100) : 0,
            }
        })

        return NextResponse.json(representationsWithStats)
    } catch (error) {
        const message = getErrorMessage(error)
        const status = message === 'Non authentifié' || message === 'Token invalide' ? 401 : 500

        return NextResponse.json({ error: message }, { status })
    }
}
