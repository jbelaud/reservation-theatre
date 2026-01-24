// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

const signinSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
})

export async function POST(request: NextRequest) {
    try {
        // Rate limiting: 5 tentatives par 15 minutes par IP
        const ip = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
        
        const rateLimitResult = checkRateLimit(`signin:${ip}`, {
            maxRequests: 5,
            windowMs: 15 * 60 * 1000 // 15 minutes
        })

        if (!rateLimitResult.success) {
            const resetDate = new Date(rateLimitResult.reset)
            return NextResponse.json(
                { 
                    error: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.',
                    retryAfter: resetDate.toISOString()
                },
                { 
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
                        'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
                    }
                }
            )
        }

        const body = await request.json()
        
        // Validation avec Zod
        const validation = signinSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { 
                    error: 'Données invalides', 
                    details: validation.error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                },
                { status: 400 }
            )
        }

        const { email, password } = validation.data

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
        const token = await generateToken(association.id)

        const response = NextResponse.json({
            association: {
                id: association.id,
                nom: association.nom,
                slug: association.slug,
                email: association.email
            },
            token
        })

        // Définir le cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 30, // 30 jours
            path: '/'
        })

        // Ajouter headers de rate limit
        response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
        response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

        return response

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Signin error:', error)
        }
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
