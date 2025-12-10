import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedAssociation, getErrorMessage } from '@/lib/api-helpers'

/**
 * GET /api/association
 * Récupérer les informations de l'association connectée
 */
export async function GET(request: NextRequest) {
    try {
        const associationId = await getAuthenticatedAssociation(request)

        const association = await prisma.association.findUnique({
            where: { id: associationId },
            select: {
                id: true,
                nom: true,
                slug: true,
                email: true,
                telephone: true,
                logo: true,
                affiche: true,
                couleurTheme: true,
                licenceActive: true,
                licenceExpire: true,
                createdAt: true
            }
        })

        if (!association) {
            return NextResponse.json(
                { error: 'Association non trouvée' },
                { status: 404 }
            )
        }

        return NextResponse.json(association)

    } catch (error) {
        const message = getErrorMessage(error)
        let status = 500
        if (message === 'Non authentifié' || message === 'Token invalide') status = 401

        return NextResponse.json({ error: message }, { status })
    }
}

/**
 * PATCH /api/association
 * Mettre à jour les informations de l'association
 */
export async function PATCH(request: NextRequest) {
    try {
        const associationId = await getAuthenticatedAssociation(request)
        const body = await request.json()
        const { nom, email, telephone, couleurTheme, logo, affiche } = body

        // Préparer les données à mettre à jour
        const updateData: any = {}
        if (nom !== undefined) updateData.nom = nom
        if (email !== undefined) updateData.email = email
        if (telephone !== undefined) updateData.telephone = telephone
        if (couleurTheme !== undefined) updateData.couleurTheme = couleurTheme
        if (logo !== undefined) updateData.logo = logo
        if (affiche !== undefined) updateData.affiche = affiche

        const association = await prisma.association.update({
            where: { id: associationId },
            data: updateData,
            select: {
                id: true,
                nom: true,
                slug: true,
                email: true,
                telephone: true,
                logo: true,
                affiche: true,
                couleurTheme: true
            }
        })

        return NextResponse.json(association)

    } catch (error) {
        const message = getErrorMessage(error)
        let status = 500
        if (message === 'Non authentifié' || message === 'Token invalide') status = 401

        return NextResponse.json({ error: message }, { status })
    }
}
