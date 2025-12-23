import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSieges } from '@/lib/json-helpers'

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
