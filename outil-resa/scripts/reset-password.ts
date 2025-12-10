
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Resetting password for test@theatre.fr...')

    const hashedPassword = await bcrypt.hash('test123', 10)

    const user = await prisma.association.update({
        where: { email: 'test@theatre.fr' },
        data: { password: hashedPassword }
    })

    console.log('✅ Password reset successfully for:', user.email)
    console.log('   New password: test123')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
