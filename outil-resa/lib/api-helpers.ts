// lib/api-helpers.ts
import { NextRequest } from 'next/server'
import { verifyToken } from './auth'
import { prisma } from './prisma'

/**
 * Extrait et vérifie le token JWT de la requête
 * Retourne l'ID de l'association authentifiée
 */
export async function getAuthenticatedAssociation(
    request: NextRequest
): Promise<string> {
    const token =
        request.cookies.get('token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
        throw new Error('Non authentifié')
    }

    const payload = await verifyToken(token)
    if (!payload) {
        throw new Error('Token invalide')
    }

    return payload.associationId
}

/**
 * Vérifie qu'une représentation appartient à l'association
 */
export async function validateOwnership(
    representationId: string,
    associationId: string
): Promise<boolean> {
    const representation = await prisma.representation.findUnique({
        where: { id: representationId },
        select: { associationId: true },
    })

    if (!representation) {
        throw new Error('Représentation non trouvée')
    }

    if (representation.associationId !== associationId) {
        throw new Error('Accès non autorisé')
    }

    return true
}

/**
 * Gestion centralisée des erreurs API
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    return 'Une erreur est survenue'
}
