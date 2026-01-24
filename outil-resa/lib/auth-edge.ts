import { SignJWT, jwtVerify } from 'jose'

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined in environment variables')
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function verifyToken(token: string): Promise<{ associationId: string } | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as { associationId: string }
    } catch {
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
