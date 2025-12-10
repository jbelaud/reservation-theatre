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
                        placesOccupees: [],
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
            const placesOccupeesArray = Array.isArray(rep.placesOccupees)
                ? rep.placesOccupees
                : []
            const placesRestantes = rep.capacite - placesOccupeesArray.length

            return {
                ...rep,
                nbReservations: rep._count.reservations,
                placesRestantes,
                tauxRemplissage: Math.round((placesOccupeesArray.length / rep.capacite) * 100),
            }
        })

        return NextResponse.json(representationsWithStats)
    } catch (error) {
        const message = getErrorMessage(error)
        const status = message === 'Non authentifié' || message === 'Token invalide' ? 401 : 500

        return NextResponse.json({ error: message }, { status })
    }
}
