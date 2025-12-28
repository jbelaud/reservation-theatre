// Script de test pour vérifier la synchronisation du plan de salle
// Usage: npx tsx scripts/test-sync-plan-salle.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Test de synchronisation du plan de salle\n')

    // Trouver l'association de test
    const testUser = await prisma.association.findUnique({
        where: { email: 'test@theatre.fr' }
    })

    if (!testUser) {
        console.log('❌ Utilisateur de test non trouvé')
        return
    }

    console.log('1️⃣ État initial des représentations :')
    const repsBefore = await prisma.representation.findMany({
        where: { associationId: testUser.id },
        select: { titre: true, capacite: true }
    })
    repsBefore.forEach(rep => {
        console.log(`   - ${rep.titre}: ${rep.capacite} places`)
    })

    console.log('\n2️⃣ Mise à jour du plan de salle à 50 places...')
    await prisma.planSalle.update({
        where: { associationId: testUser.id },
        data: {
            capaciteTotal: 50,
            structure: JSON.stringify({
                rangees: [
                    { id: 'A', sieges: 10 },
                    { id: 'B', sieges: 10 },
                    { id: 'C', sieges: 10 },
                    { id: 'D', sieges: 10 },
                    { id: 'E', sieges: 10 }
                ],
                configuration: 'standard'
            })
        }
    })

    // Simuler la synchronisation (comme le fait l'API)
    const updated = await prisma.representation.updateMany({
        where: { associationId: testUser.id },
        data: { capacite: 50 }
    })

    console.log(`✅ ${updated.count} représentation(s) mise(s) à jour`)

    console.log('\n3️⃣ État final des représentations :')
    const repsAfter = await prisma.representation.findMany({
        where: { associationId: testUser.id },
        select: { titre: true, capacite: true }
    })
    repsAfter.forEach(rep => {
        console.log(`   - ${rep.titre}: ${rep.capacite} places`)
    })

    console.log('\n🎉 Test terminé avec succès !')
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
