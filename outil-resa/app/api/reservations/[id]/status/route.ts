import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { statut } = body

        if (!statut) {
            return NextResponse.json(
                { error: 'Statut requis' },
                { status: 400 }
            )
        }

        const reservation = await prisma.reservation.update({
            where: { id },
            data: { statut }
        })

        return NextResponse.json(reservation)

    } catch (error) {
        console.error('Update reservation status error:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
