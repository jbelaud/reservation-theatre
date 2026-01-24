// app/api/reservations/batch-delete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedAssociation, getErrorMessage } from '@/lib/api-helpers'

const batchDeleteSchema = z.object({
    ids: z.array(z.string()).min(1, 'Au moins un ID est requis')
})

/**
 * POST /api/reservations/batch-delete
 * Supprimer plusieurs réservations en une seule requête
 */
export async function POST(request: NextRequest) {
    try {
        // Authentification
        const associationId = await getAuthenticatedAssociation(request)

        // Validation des données
        const body = await request.json()
        const { ids } = batchDeleteSchema.parse(body)

        // Vérifier que toutes les réservations appartiennent à l'association
        const reservations = await prisma.reservation.findMany({
            where: {
                id: { in: ids },
                representation: { associationId }
            },
            include: {
                representation: {
                    select: { id: true, placesOccupees: true, placesPmr: true }
                }
            }
        })

        if (reservations.length !== ids.length) {
            return NextResponse.json(
                { error: 'Certaines réservations n\'existent pas ou ne vous appartiennent pas' },
                { status: 403 }
            )
        }

        // Regrouper les réservations par représentation pour mettre à jour les places occupées
        const representationUpdates: Record<string, string[]> = {}

        for (const reservation of reservations) {
            const repId = reservation.representationId
            if (!representationUpdates[repId]) {
                representationUpdates[repId] = []
            }

            // Parser les sièges de la réservation
            let sieges: string[] = []
            if (typeof reservation.sieges === 'string') {
                try { sieges = JSON.parse(reservation.sieges) } catch { sieges = [] }
            } else if (Array.isArray(reservation.sieges)) {
                sieges = reservation.sieges
            }

            representationUpdates[repId].push(...sieges)
        }

        // Transaction pour supprimer les réservations et mettre à jour les places
        await prisma.$transaction(async (tx) => {
            // Supprimer les réservations
            await tx.reservation.deleteMany({
                where: { id: { in: ids } }
            })

            // Mettre à jour les places occupées pour chaque représentation
            for (const [repId, siegesToRemove] of Object.entries(representationUpdates)) {
                const representation = await tx.representation.findUnique({
                    where: { id: repId },
                    select: { placesOccupees: true }
                })

                if (representation) {
                    // Parser les places occupées actuelles
                    let currentOccupees: string[] = []
                    if (typeof representation.placesOccupees === 'string') {
                        try { currentOccupees = JSON.parse(representation.placesOccupees) } catch { currentOccupees = [] }
                    }

                    // Retirer les sièges des places occupées
                    const newOccupees = currentOccupees.filter(s => !siegesToRemove.includes(s))

                    // Mettre à jour la représentation
                    await tx.representation.update({
                        where: { id: repId },
                        data: {
                            placesOccupees: JSON.stringify(newOccupees)
                        }
                    })
                }
            }
        })

        return NextResponse.json({ 
            success: true, 
            deletedCount: ids.length 
        })
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
