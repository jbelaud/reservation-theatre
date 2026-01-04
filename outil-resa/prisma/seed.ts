// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Démarrage du seed...')

    // Hasher le mot de passe
    const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)
    const adminEmail = process.env.ADMIN_EMAIL || 'ets.belaud@gmail.com'
    const adminPassword = process.env.ADMIN_PASSWORD
    if (isProduction && !adminPassword) {
        throw new Error('Missing required env var: ADMIN_PASSWORD')
    }

    const effectiveAdminPassword = adminPassword || 'test123'
    const hashedPassword = await bcrypt.hash(effectiveAdminPassword, 10)

    // Créer le compte admin Resavo
    const admin = await prisma.admin.upsert({
        where: { email: adminEmail },
        update: adminPassword
            ? {
                password: hashedPassword,
                nom: 'Admin Resavo'
            }
            : {
                nom: 'Admin Resavo'
            },
        create: {
            email: adminEmail,
            password: hashedPassword,
            nom: 'Admin Resavo'
        }
    })

    console.log('✅ Compte admin créé :')
    console.log('   Email:', admin.email)
    if (!isProduction) {
        console.log('   Mot de passe:', effectiveAdminPassword)
    }
    console.log('   ID:', admin.id)

    if (isProduction) {
        console.log('\n🎉 Seed terminé avec succès !')
        return
    }

    // Créer un utilisateur de test
    const testUser = await prisma.association.upsert({
        where: { email: 'test@theatre.fr' },
        update: {},
        create: {
            nom: 'Théâtre de Test',
            slug: 'theatre-de-test',
            email: 'test@theatre.fr',
            password: hashedPassword,
            telephone: '0123456789',
            licenceActive: true,
            couleurTheme: '#1e40af'
        }
    })

    console.log('✅ Utilisateur de test créé :')
    console.log('   Email: test@theatre.fr')
    console.log('   Mot de passe: test123')
    console.log('   ID:', testUser.id)

    // Créer un plan de salle vide par défaut
    const planSalle = await prisma.planSalle.upsert({
        where: { associationId: testUser.id },
        update: {},
        create: {
            nom: 'Salle principale',
            capaciteTotal: 0,
            structure: JSON.stringify({
                rangees: [],
                configuration: 'standard'
            }),
            associationId: testUser.id
        }
    })

    console.log('✅ Plan de salle créé (vide)')

    // Créer quelques représentations de test
    const representation1 = await prisma.representation.create({
        data: {
            titre: 'Le Malade Imaginaire',
            date: new Date('2025-12-15T20:00:00'),
            heure: '20:00',
            capacite: 0,
            description: 'Comédie-ballet en trois actes de Molière',
            placesOccupees: '[]',
            associationId: testUser.id
        }
    })

    const representation2 = await prisma.representation.create({
        data: {
            titre: 'Tartuffe',
            date: new Date('2025-12-20T19:30:00'),
            heure: '19:30',
            capacite: 0,
            description: 'Comédie en cinq actes de Molière',
            placesOccupees: '[]',
            associationId: testUser.id
        }
    })

    console.log('✅ Représentations de test créées')
    console.log(`   - ${representation1.titre}`)
    console.log(`   - ${representation2.titre}`)

    console.log('\n🎉 Seed terminé avec succès !')
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
