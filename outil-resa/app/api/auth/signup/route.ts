// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, generateSlug } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { nom, email, password, slug: customSlug } = body

        // Validation basique
        if (!nom || !email || !password) {
            return NextResponse.json(
                { error: 'Champs requis manquants' },
                { status: 400 }
            )
        }

        // Vérifier email unique
        const existingEmail = await prisma.association.findUnique({
            where: { email }
        })
        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email déjà utilisé' },
                { status: 400 }
            )
        }

        // Générer ou vérifier slug
        const slug = customSlug || generateSlug(nom)
        const existingSlug = await prisma.association.findUnique({
            where: { slug }
        })
        if (existingSlug) {
            return NextResponse.json(
                { error: 'Ce nom est déjà pris, choisissez-en un autre' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Créer association + plan de salle par défaut
        const association = await prisma.association.create({
            data: {
                nom,
                slug,
                email,
                password: hashedPassword,
                plansSalle: {
                    create: {
                        nom: 'Salle principale',
                        capaciteTotal: 100,
                        structure: {
                            rangees: [
                                { id: 'A', sieges: 12 },
                                { id: 'B', sieges: 14 },
                                { id: 'C', sieges: 14 },
                                { id: 'D', sieges: 12 },
                                { id: 'E', sieges: 12 },
                                { id: 'F', sieges: 12 },
                                { id: 'G', sieges: 12 },
                                { id: 'H', sieges: 12 }
                            ]
                        }
                    }
                }
            },
            include: {
                plansSalle: true
            }
        })

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
        }, { status: 201 })

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
