// app/api/admin/associations/[id]/paiement/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin-auth'

// POST - Enregistrer un paiement pour une association
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Vérifier l'authentification admin
        const token = request.cookies.get('admin_token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const payload = await verifyAdminToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { montant = 299, notes } = body

        // Vérifier que l'association existe
        const association = await prisma.association.findUnique({
            where: { id }
        })

        if (!association) {
            return NextResponse.json({ error: 'Association introuvable' }, { status: 404 })
        }

        // Déterminer l'année couverte (année actuelle ou prochaine si déjà payé cette année)
        const currentYear = new Date().getFullYear()
        const existingPayment = await prisma.paiement.findFirst({
            where: {
                associationId: id,
                anneeCouverte: currentYear
            }
        })

        const anneeCouverte = existingPayment ? currentYear + 1 : currentYear

        // Créer le paiement
        const paiement = await prisma.paiement.create({
            data: {
                montant,
                anneeCouverte,
                notes,
                associationId: id
            }
        })

        // Mettre à jour la licence de l'association (+1 an à partir de maintenant)
        const newExpireDate = new Date()
        newExpireDate.setFullYear(newExpireDate.getFullYear() + 1)

        await prisma.association.update({
            where: { id },
            data: {
                licenceActive: true,
                licenceExpire: newExpireDate
            }
        })

        return NextResponse.json({
            success: true,
            paiement,
            licenceExpire: newExpireDate
        }, { status: 201 })

    } catch (error) {
        console.error('Error recording payment:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
