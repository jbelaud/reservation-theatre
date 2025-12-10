// Vérifier l'état actuel de la base de données
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 État actuel de la base de données\n')

    const testUser = await prisma.association.findUnique({
        where: { email: 'test@theatre.fr' },
        include: {
            plansSalle: true,
            representations: {
                select: { titre: true, capacite: true }
            }
        }
    })

    if (!testUser) {
        console.log('❌ Utilisateur non trouvé')
        return
    }

    console.log(`👤 Association: ${testUser.nom}`)
    console.log(`📧 Email: ${testUser.email}\n`)

    if (testUser.plansSalle.length > 0) {
        const plan = testUser.plansSalle[0]
        console.log(`🏛️  Plan de salle:`)
        console.log(`   Nom: ${plan.nom}`)
        console.log(`   Capacité totale: ${plan.capaciteTotal} places`)
        console.log(`   Configuration: ${plan.configuration || 'non définie'}`)

        const structure = plan.structure as any
        if (structure && structure.rangees) {
            console.log(`   Nombre de rangées: ${structure.rangees.length}`)
            console.log(`   Rangées: ${structure.rangees.map((r: any) => `${r.id}(${r.sieges})`).join(', ')}`)
        }
    }

    console.log(`\n🎭 Représentations (${testUser.representations.length}):`)
    testUser.representations.forEach(rep => {
        console.log(`   - ${rep.titre}: ${rep.capacite} places`)
    })
}

main()
    .catch(e => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
