import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret'
)

export async function verifyToken(token: string): Promise<{ associationId: string } | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as { associationId: string }
    } catch (error) {
        console.error('Token verification failed:', error)
        return null
    }
}

export async function generateToken(associationId: string): Promise<string> {
    return new SignJWT({ associationId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(JWT_SECRET)
}

export function generateSlug(nom: string): string {
    return nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever accents
        .replace(/[^a-z0-9]+/g, '-') // Remplacer espaces/caractères spéciaux par -
        .replace(/^-+|-+$/g, '') // Enlever - au début/fin
}
