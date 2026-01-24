import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Correction des places PMR existantes\n')

    const testUser = await prisma.association.findUnique({
        where: { email: 'association-test@test.fr' },
        include: { plansSalle: true }
    })

    if (!testUser) {
        console.log('❌ Association Test non trouvée')
        return
    }

    // Récupérer la structure du plan de salle
    const planSalle = testUser.plansSalle[0]
    let structure
    if (typeof planSalle.structure === 'string') {
        structure = JSON.parse(planSalle.structure)
    } else {
        structure = planSalle.structure
    }

    console.log('📐 Plan de salle:')
    console.log(`   Configuration: ${structure.configuration}`)
    console.log(`   PMR Double: ${structure.pmrDouble}`)

    // Identifier les sièges PMR dans le plan
    const pmrSeatsInPlan: string[] = []
    structure.rangees.forEach((rangee: any) => {
        if (rangee.pmr && rangee.pmr.length > 0) {
            rangee.pmr.forEach((num: number) => {
                pmrSeatsInPlan.push(`${rangee.id}${num}`)
            })
        }
    })

    console.log(`   Sièges PMR configurés: ${pmrSeatsInPlan.join(', ')}\n`)

    // Récupérer toutes les représentations
    const representations = await prisma.representation.findMany({
        where: { associationId: testUser.id }
    })

    console.log(`📊 Traitement de ${representations.length} représentation(s):\n`)

    for (const rep of representations) {
        console.log(`📅 ${rep.titre}`)

        // Parser les places occupées
        let placesOccupees = []
        if (typeof rep.placesOccupees === 'string') {
            try {
                placesOccupees = JSON.parse(rep.placesOccupees)
            } catch {
                placesOccupees = []
            }
        } else {
            placesOccupees = rep.placesOccupees || []
        }

        // Identifier les sièges PMR dans les places occupées
        const placesPmrReservees = placesOccupees.filter((seat: string) => 
            pmrSeatsInPlan.includes(seat)
        )

        console.log(`   Places occupées: ${placesOccupees.length}`)
        console.log(`   Places PMR réservées: ${placesPmrReservees.length}`)
        
        if (placesPmrReservees.length > 0) {
            console.log(`   → ${placesPmrReservees.join(', ')}`)
        }

        // Mettre à jour le champ placesPmr
        await prisma.representation.update({
            where: { id: rep.id },
            data: {
                placesPmr: JSON.stringify(placesPmrReservees)
            }
        })

        console.log(`   ✅ Champ placesPmr mis à jour\n`)
    }

    console.log('🎉 Correction terminée !')
}

main()
    .catch(e => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
