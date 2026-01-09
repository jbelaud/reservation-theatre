import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedAssociation, getErrorMessage } from '@/lib/api-helpers'
import { stringifyJsonField } from '@/lib/json-helpers'

/**
 * GET /api/plan-salle
 * Récupérer le plan de salle de l'association connectée
 */
export async function GET(request: NextRequest) {
    try {
        const associationId = await getAuthenticatedAssociation(request)

        const plan = await prisma.planSalle.findUnique({
            where: { associationId }
        })

        if (!plan) {
            // Si pas de plan (ne devrait pas arriver car créé à l'inscription), on en crée un vide
            const newPlan = await prisma.planSalle.create({
                data: {
                    associationId,
                    nom: 'Salle principale',
                    capaciteTotal: 0,
                    structure: stringifyJsonField({
                        rangees: [],
                        configuration: 'standard'
                    })
                }
            })
            return NextResponse.json(newPlan)
        }

        return NextResponse.json(plan)

    } catch (error) {
        const message = getErrorMessage(error)
        let status = 500
        if (message === 'Non authentifié' || message === 'Token invalide') status = 401

        return NextResponse.json({ error: message }, { status })
    }
}

/**
 * PATCH /api/plan-salle
 * Mettre à jour le plan de salle
 */
export async function PATCH(request: NextRequest) {
    try {
        const associationId = await getAuthenticatedAssociation(request)
        const body = await request.json()
        const { structure } = body

        if (!structure || !structure.rangees || !Array.isArray(structure.rangees)) {
            return NextResponse.json(
                { error: 'Structure invalide' },
                { status: 400 }
            )
        }

        // Calculer nouvelle capacité de vente (tickets)
        const physical = structure.rangees.reduce(
            (acc: number, row: { sieges: number }) => acc + (row.sieges || 0),
            0
        )
        const pmrCount = structure.rangees.reduce(
            (acc: number, row: any) => acc + (row.pmr?.length || 0),
            0
        )
        const capaciteTotal = structure.pmrDouble ? physical - pmrCount : physical

        // S'assurer que la configuration est définie
        const configuration = structure.configuration || 'standard'

        // Mettre à jour le plan de salle
        const plan = await prisma.planSalle.update({
            where: { associationId },
            data: {
                structure: stringifyJsonField({
                    rangees: structure.rangees,
                    configuration: configuration,
                    pmrDouble: structure.pmrDouble
                }),
                capaciteTotal,
                configuration: configuration
            }
        })

        // Mettre à jour la capacité de TOUTES les représentations existantes
        const updatedRepresentations = await prisma.representation.updateMany({
            where: { associationId },
            data: { capacite: capaciteTotal }
        })

        return NextResponse.json({
            ...plan,
            representationsUpdated: updatedRepresentations.count
        })

    } catch (error) {
        const message = getErrorMessage(error)
        let status = 500
        if (message === 'Non authentifié' || message === 'Token invalide') status = 401

        return NextResponse.json({ error: message }, { status })
    }
}
