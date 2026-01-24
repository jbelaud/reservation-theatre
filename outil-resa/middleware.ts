import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth-edge'

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '')

    // Routes protégées
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/connexion', request.url))
        }

        const payload = await verifyToken(token)

        if (!payload) {
            return NextResponse.redirect(new URL('/connexion', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*']
}
