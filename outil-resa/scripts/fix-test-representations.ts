import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Correction des représentations de test\n')

    const testUser = await prisma.association.findUnique({
        where: { email: 'association-test@test.fr' }
    })

    if (!testUser) {
        console.log('❌ Compte association-test@test.fr non trouvé')
        return
    }

    // Supprimer toutes les représentations existantes pour ce compte
    const deleted = await prisma.representation.deleteMany({
        where: { associationId: testUser.id }
    })
    console.log(`🗑️  ${deleted.count} représentations supprimées\n`)

    // Récupérer le plan de salle
    const planSalle = await prisma.planSalle.findUnique({
        where: { associationId: testUser.id }
    })

    if (!planSalle) {
        console.log('❌ Aucun plan de salle trouvé')
        return
    }

    const structure = JSON.parse(planSalle.structure)
    console.log(`📐 Capacité: ${planSalle.capaciteTotal} tickets\n`)

    // Créer 5 représentations passées (avant le 18 janvier 2026) - 100% remplissage
    console.log(`📅 Création de 5 représentations passées (avant le 18/01/2026)...`)
    
    const datesPast = [
        { date: new Date('2026-01-05T20:00:00'), heure: '20:00', pmr: 0 },
        { date: new Date('2026-01-08T20:00:00'), heure: '20:00', pmr: 1 },
        { date: new Date('2026-01-11T20:00:00'), heure: '20:00', pmr: 0 },
        { date: new Date('2026-01-14T20:00:00'), heure: '20:00', pmr: 3 },
        { date: new Date('2026-01-17T20:00:00'), heure: '20:00', pmr: 0 }
    ]

    for (let i = 0; i < datesPast.length; i++) {
        const { date, heure, pmr } = datesPast[i]
        
        // Générer toutes les places occupées (100% remplissage)
        const placesOccupees: string[] = []
        structure.rangees.forEach((rangee: any) => {
            for (let j = 1; j <= rangee.sieges; j++) {
                placesOccupees.push(`${rangee.id}${j}`)
            }
        })

        // Identifier les places PMR
        const placesPmr: string[] = []
        if (pmr > 0) {
            let pmrAdded = 0
            for (const rangee of structure.rangees) {
                if (rangee.pmr && rangee.pmr.length > 0 && pmrAdded < pmr) {
                    for (const num of rangee.pmr) {
                        if (pmrAdded < pmr) {
                            placesPmr.push(`${rangee.id}${num}`)
                            pmrAdded++
                        }
                    }
                }
            }
        }

        const rep = await prisma.representation.create({
            data: {
                titre: `Représentation ${i + 1} - Janvier 2026`,
                date,
                heure,
                capacite: planSalle.capaciteTotal,
                description: pmr > 0 ? `Avec ${pmr} siège(s) PMR` : 'Sans siège PMR',
                placesOccupees: JSON.stringify(placesOccupees),
                placesPmr: JSON.stringify(placesPmr),
                statut: 'termine',
                associationId: testUser.id
            }
        })

        console.log(`   ✅ ${rep.titre} - ${rep.date.toLocaleDateString('fr-FR')} - ${pmr} PMR - ${placesOccupees.length} places occupées / ${planSalle.capaciteTotal} capacité`)
    }

    // Créer 5 représentations actives (mars 2026) - 0% remplissage
    console.log(`\n📅 Création de 5 représentations actives (mars 2026)...`)
    
    const datesMars = [
        { date: new Date('2026-03-05T20:00:00'), heure: '20:00' },
        { date: new Date('2026-03-10T20:00:00'), heure: '20:00' },
        { date: new Date('2026-03-15T20:00:00'), heure: '20:00' },
        { date: new Date('2026-03-20T20:00:00'), heure: '20:00' },
        { date: new Date('2026-03-25T20:00:00'), heure: '20:00' }
    ]

    for (let i = 0; i < datesMars.length; i++) {
        const { date, heure } = datesMars[i]

        const rep = await prisma.representation.create({
            data: {
                titre: `Représentation ${i + 1} - Mars 2026`,
                date,
                heure,
                capacite: planSalle.capaciteTotal,
                description: 'Représentation à venir',
                placesOccupees: JSON.stringify([]),
                placesPmr: JSON.stringify([]),
                statut: 'planifie',
                associationId: testUser.id
            }
        })

        console.log(`   ✅ ${rep.titre} - ${rep.date.toLocaleDateString('fr-FR')} - 0/${planSalle.capaciteTotal} places`)
    }

    console.log(`\n🎉 Terminé !`)
}

main()
    .catch(e => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
