import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET_KEY = process.env.JWT_SECRET || 'votre-secret-tres-securise'
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
    } catch (error) {
        return null
    }
}

export async function getAdminSession() {
    const token = (await cookies()).get('admin_token')?.value
    if (!token) return null
    return await verifyAdminToken(token)
}
