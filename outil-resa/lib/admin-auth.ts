import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined in environment variables')
}

const SECRET_KEY = process.env.JWT_SECRET
const key = new TextEncoder().encode(SECRET_KEY)

export async function generateAdminToken(adminId: string) {
    return await new SignJWT({ adminId, role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key)
}

export async function verifyAdminToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key)
        if (payload.role !== 'admin') return null
        return payload
    } catch {
        return null
    }
}

export async function getAdminSession() {
    const token = (await cookies()).get('admin_token')?.value
    if (!token) return null
    return await verifyAdminToken(token)
}
