// Test rapide de mise à jour du plan de salle
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Test de mise à jour à 216 places\n')

    const testUser = await prisma.association.findUnique({
        where: { email: 'test@theatre.fr' }
    })

    if (!testUser) {
        console.log('❌ Utilisateur non trouvé')
        return
    }

    // Simuler ce que fait l'API
    const structure = {
        rangees: [
            { id: 'A', sieges: 18 },
            { id: 'B', sieges: 18 },
            { id: 'C', sieges: 18 },
            { id: 'D', sieges: 18 },
            { id: 'E', sieges: 18 },
            { id: 'F', sieges: 18 },
            { id: 'G', sieges: 18 },
            { id: 'H', sieges: 18 },
            { id: 'I', sieges: 18 },
            { id: 'J', sieges: 18 },
            { id: 'K', sieges: 18 },
            { id: 'L', sieges: 18 }
        ],
        configuration: 'standard'
    }

    const capaciteTotal = structure.rangees.reduce((acc, r) => acc + r.sieges, 0)
    console.log(`Capacité calculée: ${capaciteTotal} places`)

    // Mettre à jour le plan
    const plan = await prisma.planSalle.update({
        where: { associationId: testUser.id },
        data: {
            structure: {
                rangees: structure.rangees,
                configuration: structure.configuration
            },
            capaciteTotal,
            configuration: structure.configuration
        }
    })

    console.log(`✅ Plan de salle mis à jour: ${plan.capaciteTotal} places`)

    // Mettre à jour les représentations
    const updated = await prisma.representation.updateMany({
        where: { associationId: testUser.id },
        data: { capacite: capaciteTotal }
    })

    console.log(`✅ ${updated.count} représentation(s) mise(s) à jour`)

    // Vérifier
    const reps = await prisma.representation.findMany({
        where: { associationId: testUser.id },
        select: { titre: true, capacite: true }
    })

    console.log('\n📊 Représentations:')
    reps.forEach(rep => {
        console.log(`   - ${rep.titre}: ${rep.capacite} places`)
    })

    console.log('\n🎉 Test terminé !')
}

main()
    .catch(e => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
