import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAdminToken } from '@/lib/admin-auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log('Admin signin attempt:', body.email)
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            )
        }

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
        const isValid = await bcrypt.compare(password, admin.password)

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

        return response

    } catch (error) {
        console.error('Admin login error:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
