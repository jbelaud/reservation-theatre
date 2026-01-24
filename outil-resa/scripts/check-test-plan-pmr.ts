import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Vérification du plan de salle Test avec PMR\n')

    const testUser = await prisma.association.findUnique({
        where: { email: 'association-test@test.fr' },
        include: { plansSalle: true }
    })

    if (!testUser) {
        console.log('❌ Association Test non trouvée')
        return
    }

    console.log(`✅ Association trouvée: ${testUser.nom}`)
    console.log(`   ID: ${testUser.id}\n`)

    const plan = testUser.plansSalle[0]
    if (!plan) {
        console.log('❌ Aucun plan de salle trouvé')
        return
    }

    console.log('📐 Plan de salle:')
    console.log(`   Capacité totale: ${plan.capaciteTotal}`)
    console.log(`   Configuration: ${plan.configuration}`)

    // Parser la structure
    let structure
    if (typeof plan.structure === 'string') {
        structure = JSON.parse(plan.structure)
    } else {
        structure = plan.structure
    }

    console.log(`\n🎭 Structure du plan:`)
    console.log(`   Configuration: ${structure.configuration}`)
    console.log(`   PMR Double: ${structure.pmrDouble}`)
    console.log(`   Nombre de rangées: ${structure.rangees?.length || 0}`)

    if (structure.rangees && structure.rangees.length > 0) {
        console.log('\n📋 Détail des rangées:')
        structure.rangees.forEach((rangee: any) => {
            const pmrInfo = rangee.pmr && rangee.pmr.length > 0 
                ? `PMR: [${rangee.pmr.join(', ')}]` 
                : 'Pas de PMR'
            console.log(`   ${rangee.id}: ${rangee.sieges} sièges - ${pmrInfo}`)
        })

        // Compter le total de places PMR
        const totalPmr = structure.rangees.reduce((acc: number, r: any) => 
            acc + (r.pmr?.length || 0), 0
        )
        console.log(`\n🦽 Total de places PMR configurées: ${totalPmr}`)
    }

    console.log('\n🎉 Vérification terminée !')
}

main()
    .catch(e => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
