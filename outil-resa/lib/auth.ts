import bcrypt from 'bcryptjs'
export { verifyToken, generateToken, generateSlug } from './auth-edge'

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}


