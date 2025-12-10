import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth-edge'

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '')

    console.log('Middleware - Path:', request.nextUrl.pathname)
    console.log('Middleware - Token found:', !!token)

    // Routes protégées
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token) {
            console.log('Middleware - No token, redirecting to /connexion')
            return NextResponse.redirect(new URL('/connexion', request.url))
        }

        const payload = await verifyToken(token)
        console.log('Middleware - Token verification result:', !!payload)

        if (!payload) {
            console.log('Middleware - Invalid token, redirecting to /connexion')
            return NextResponse.redirect(new URL('/connexion', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*']
}
