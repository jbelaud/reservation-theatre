// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            )
        }

        // Trouver l'association
        const association = await prisma.association.findUnique({
            where: { email }
        })

        if (!association) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            )
        }

        // Vérifier password
        const isValid = await verifyPassword(password, association.password)
        if (!isValid) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            )
        }

        // Générer token
        const token = generateToken(association.id)

        return NextResponse.json({
            association: {
                id: association.id,
                nom: association.nom,
                slug: association.slug,
                email: association.email
            },
            token
        })

    } catch (error) {
        console.error('Signin error:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
