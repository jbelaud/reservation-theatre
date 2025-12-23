import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        today.setDate(today.getDate() - 1)

        const association = await prisma.association.findUnique({
            where: { slug },
            include: {
                representations: {
                    where: {
                        date: {
                            gte: today
                        }
                    },
                    orderBy: {
                        date: 'asc'
                    }
                }
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
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
