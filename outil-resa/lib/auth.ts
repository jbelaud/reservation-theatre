import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

export function generateToken(associationId: string): string {
    return jwt.sign({ associationId }, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): { associationId: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { associationId: string }
    } catch {
        return null
    }
}

export function generateSlug(nom: string): string {
    return nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever accents
        .replace(/[^a-z0-9]+/g, '-') // Remplacer espaces/caractères spéciaux par -
        .replace(/^-+|-+$/g, '') // Enlever - au début/fin
}
