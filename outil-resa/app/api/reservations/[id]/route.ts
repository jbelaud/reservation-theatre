import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

        return NextResponse.json(reservation)

    } catch (error) {
        console.error('Fetch reservation error:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
