import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { parseSieges } from '@/lib/json-helpers'
import { getAuthenticatedAssociation, getErrorMessage } from '@/lib/api-helpers'

const updateReservationSchema = z.object({
    nbPlaces: z.number().int().positive().optional(),
    sieges: z.array(z.string()).optional()
})

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: {
                representation: {
                    include: {
                        association: {
                            select: {
                                nom: true,
                                slug: true,
                                telephone: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })

        if (!reservation) {
            return NextResponse.json(
                { error: 'Réservation introuvable' },
                { status: 404 }
            )
        }

        const sieges = parseSieges(reservation.sieges)

        return NextResponse.json({
            ...reservation,
            sieges
        })

    } catch (error) {
        console.error('Fetch reservation error:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/reservations/[id]
 * Modifier une réservation (nbPlaces et/ou sièges)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authentification
        const associationId = await getAuthenticatedAssociation(request)
        const { id } = await params

        // Validation des données
        const body = await request.json()
        const validatedData = updateReservationSchema.parse(body)

        // Vérifier que la réservation existe et appartient à l'association
        const existingReservation = await prisma.reservation.findFirst({
            where: {
                id,
                representation: { associationId }
            },
            include: {
                representation: {
                    select: { id: true, placesOccupees: true }
                }
            }
        })

        if (!existingReservation) {
            return NextResponse.json(
                { error: 'Réservation introuvable ou non autorisée' },
                { status: 404 }
            )
        }

        // Parser les anciens sièges
        const oldSieges = parseSieges(existingReservation.sieges)
        const newSieges = validatedData.sieges || oldSieges
        const newNbPlaces = validatedData.nbPlaces || existingReservation.nbPlaces

        // Mettre à jour les places occupées de la représentation
        let currentOccupees: string[] = []
        if (typeof existingReservation.representation.placesOccupees === 'string') {
            try { currentOccupees = JSON.parse(existingReservation.representation.placesOccupees) } catch { currentOccupees = [] }
        }

        // Retirer les anciens sièges et ajouter les nouveaux
        const updatedOccupees = currentOccupees.filter(s => !oldSieges.includes(s))
        updatedOccupees.push(...newSieges)

        // Transaction pour mettre à jour la réservation et les places occupées
        const updatedReservation = await prisma.$transaction(async (tx) => {
            // Mettre à jour la représentation
            await tx.representation.update({
                where: { id: existingReservation.representationId },
                data: {
                    placesOccupees: JSON.stringify(updatedOccupees)
                }
            })

            // Mettre à jour la réservation
            return tx.reservation.update({
                where: { id },
                data: {
                    nbPlaces: newNbPlaces,
                    sieges: JSON.stringify(newSieges)
                }
            })
        })

        return NextResponse.json({
            ...updatedReservation,
            sieges: newSieges
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
