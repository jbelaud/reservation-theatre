// Script pour réinitialiser le plan de salle à 0 places
// Usage: npx tsx scripts/reset-plan-salle.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Réinitialisation du plan de salle...')

    // Trouver l'association de test
    const testUser = await prisma.association.findUnique({
        where: { email: 'test@theatre.fr' }
    })

    if (!testUser) {
        console.log('❌ Utilisateur de test non trouvé')
        return
    }

    // Mettre à jour le plan de salle
    const planSalle = await prisma.planSalle.update({
        where: { associationId: testUser.id },
        data: {
            capaciteTotal: 0,
            structure: JSON.stringify({
                rangees: [],
                configuration: 'standard'
            })
        }
    })

    console.log('✅ Plan de salle réinitialisé à 0 places')

    // Mettre à jour les représentations existantes
    const representations = await prisma.representation.updateMany({
        where: { associationId: testUser.id },
        data: {
            capacite: 0,
            placesOccupees: '[]'
        }
    })

    console.log(`✅ ${representations.count} représentation(s) mise(s) à jour`)
    console.log('\n🎉 Réinitialisation terminée !')
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
