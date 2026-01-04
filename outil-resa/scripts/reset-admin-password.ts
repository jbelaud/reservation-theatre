import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2] || 'ets.belaud@gmail.com'
    const newPassword = process.argv[3]

    if (!newPassword) {
        console.error('Usage: tsx scripts/reset-admin-password.ts <email> <newPassword>')
        process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const admin = await prisma.admin.upsert({
        where: { email },
        update: { password: hashedPassword },
        create: {
            email,
            password: hashedPassword,
        }
    })

    console.log('✅ Admin password reset successfully for:', admin.email)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
