
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking user test@theatre.fr...')
    const user = await prisma.association.findUnique({
        where: { email: 'test@theatre.fr' }
    })

    if (!user) {
        console.log('❌ User NOT found in database.')
        return
    }

    console.log('✅ User found:', user.id)
    console.log('   Email:', user.email)
    console.log('   Stored Hash (start):', user.password.substring(0, 10) + '...')

    const isMatch = await bcrypt.compare('test123', user.password)
    console.log('   Password "test123" match:', isMatch ? '✅ YES' : '❌ NO')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
