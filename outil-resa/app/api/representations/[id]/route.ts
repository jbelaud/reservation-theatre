// app/api/representations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedAssociation, validateOwnership, getErrorMessage } from '@/lib/api-helpers'
import { parsePlacesOccupees } from '@/lib/json-helpers'

// Schéma de validation pour mettre à jour une représentation
const updateRepresentationSchema = z.object({
    titre: z.string().min(1, 'Le titre est requis').optional(),
    date: z.string().datetime('Date invalide').optional(),
    heure: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Heure invalide (format HH:MM)').optional(),
    capacite: z.number().int().positive('La capacité doit être supérieure à 0').optional(),
    description: z.string().optional(),
    structure: z.string().optional(),
})

/**
 * PUT /api/representations/[id]
 * Mettre à jour une représentation
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params
        const { id } = await params

        // Authentification
        const associationId = await getAuthenticatedAssociation(request)

        // Vérification de propriété
        await validateOwnership(id, associationId)

        // Validation des données
        const body = await request.json()
        const validatedData = updateRepresentationSchema.parse(body)

        // Préparation des données pour la mise à jour
        const updateData: any = { ...validatedData }
        if (validatedData.date) {
            updateData.date = new Date(validatedData.date)
        }

        // Mise à jour
        const representation = await prisma.representation.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(representation)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Données invalides', details: error.issues },
                { status: 400 }
            )
        }

        const message = getErrorMessage(error)
        let status = 500

        if (message === 'Non authentifié' || message === 'Token invalide') {
            status = 401
        } else if (message === 'Accès non autorisé') {
            status = 403
        } else if (message === 'Représentation non trouvée') {
            status = 404
        }

        return NextResponse.json({ error: message }, { status })
    }
}

/**
 * DELETE /api/representations/[id]
 * Supprimer une représentation
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params
        const { id } = await params

        // Authentification
        const associationId = await getAuthenticatedAssociation(request)

        // Vérification de propriété
        await validateOwnership(id, associationId)

        // Suppression (cascade sur les réservations)
        await prisma.representation.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Représentation supprimée avec succès' })
    } catch (error) {
        const message = getErrorMessage(error)
        let status = 500

        if (message === 'Non authentifié' || message === 'Token invalide') {
            status = 401
        } else if (message === 'Accès non autorisé') {
            status = 403
        } else if (message === 'Représentation non trouvée') {
            status = 404
        }

        return NextResponse.json({ error: message }, { status })
    }
}
/**
 * GET /api/representations/[id]
 * Récupérer une représentation avec ses réservations
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const associationId = await getAuthenticatedAssociation(request)

        // ⚡ OPTIMISATION: Une seule requête qui valide la propriété ET récupère les données
        const representation = await prisma.representation.findFirst({
            where: {
                id,
                associationId // Validation de propriété intégrée
            },
            include: {
                reservations: {
                    orderBy: { createdAt: 'desc' }
                },
                association: {
                    include: {
                        plansSalle: true
                    }
                }
            }
        })

        if (!representation) {
            return NextResponse.json(
                { error: 'Représentation non trouvée' },
                { status: 404 }
            )
        }

        const placesOccupeesArray = parsePlacesOccupees(representation.placesOccupees)

        const placesRestantes = representation.capacite - placesOccupeesArray.length
        const nbReservations = representation.reservations.length
        const tauxRemplissage = Math.round((placesOccupeesArray.length / representation.capacite) * 100)

        // Parser les sièges de chaque réservation (String JSON en SQLite)
        const reservationsFormatted = representation.reservations.map((r: any) => {
            let sieges: string[] = []
            if (typeof r.sieges === 'string') {
                try { sieges = JSON.parse(r.sieges) } catch { }
            } else if (Array.isArray(r.sieges)) {
                sieges = r.sieges
            }
            return { ...r, sieges }
        })

        // Déterminer la structure à utiliser (override ou défaut)
        let structure = representation.structure
        if (!structure && representation.association.plansSalle?.[0]) {
            structure = representation.association.plansSalle[0].structure
        }

        return NextResponse.json({
            ...representation,
            structure,
            placesOccupees: placesOccupeesArray,
            reservations: reservationsFormatted,
            placesRestantes,
            nbReservations,
            tauxRemplissage
        })
    } catch (error) {
        const message = getErrorMessage(error)
        let status = 500

        if (message === 'Non authentifié' || message === 'Token invalide') {
            status = 401
        } else if (message === 'Accès non autorisé') {
            status = 403
        } else if (message === 'Représentation non trouvée') {
            status = 404
        }

        return NextResponse.json({ error: message }, { status })
    }
}
