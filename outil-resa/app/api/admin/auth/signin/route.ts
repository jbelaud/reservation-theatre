import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateAdminToken } from '@/lib/admin-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

const adminSigninSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
})

export async function POST(request: NextRequest) {
    try {
        // Rate limiting: 3 tentatives par 15 minutes par IP (plus strict pour admin)
        const ip = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
        
        const rateLimitResult = checkRateLimit(`admin-signin:${ip}`, {
            maxRequests: 3,
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
        const validation = adminSigninSchema.safeParse(body)
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

        // Trouver l'admin
        const admin = await prisma.admin.findUnique({
            where: { email }
        })

        if (!admin) {
            return NextResponse.json(
                { error: 'Identifiants invalides' },
                { status: 401 }
            )
        }

        // Vérifier le mot de passe
        if (!admin.password || typeof admin.password !== 'string') {
            if (process.env.NODE_ENV === 'development') {
                console.error('Admin login error: invalid password value in database')
            }
            return NextResponse.json(
                { error: 'Identifiants invalides' },
                { status: 401 }
            )
        }

        let isValid = false
        try {
            isValid = await bcrypt.compare(password, admin.password)
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Admin login error: bcrypt compare failed', error)
            }
            return NextResponse.json(
                { error: 'Identifiants invalides' },
                { status: 401 }
            )
        }

        if (!isValid) {
            return NextResponse.json(
                { error: 'Identifiants invalides' },
                { status: 401 }
            )
        }

        // Générer le token admin
        const token = await generateAdminToken(admin.id)

        const response = NextResponse.json({
            success: true,
            admin: {
                id: admin.id,
                email: admin.email,
                nom: admin.nom
            }
        })

        // Définir le cookie admin
        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 heures
            path: '/'
        })

        // Ajouter headers de rate limit
        response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
        response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

        return response

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Admin login error:', error)
        }
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
