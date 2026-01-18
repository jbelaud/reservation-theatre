import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🎭 Création des représentations de test\n')

    // Trouver le compte test
    const testUser = await prisma.association.findUnique({
        where: { email: 'association-test@test.fr' },
        include: { plansSalle: true }
    })

    if (!testUser) {
        console.log('❌ Compte association-test@test.fr non trouvé')
        return
    }

    console.log(`✅ Compte trouvé: ${testUser.nom} (${testUser.email})`)

    // Récupérer le plan de salle
    const planSalle = testUser.plansSalle[0]
    if (!planSalle) {
        console.log('❌ Aucun plan de salle trouvé')
        return
    }

    const structure = JSON.parse(planSalle.structure)
    console.log(`\n📐 Plan de salle:`)
    console.log(`   - Capacité totale (DB): ${planSalle.capaciteTotal}`)
    console.log(`   - Configuration: ${structure.configuration}`)
    console.log(`   - PMR double: ${structure.pmrDouble}`)

    // Calculer les capacités
    const physical = structure.rangees.reduce(
        (acc: number, row: any) => acc + (row.sieges || 0),
        0
    )
    const pmrCount = structure.rangees.reduce(
        (acc: number, row: any) => acc + (row.pmr?.length || 0),
        0
    )
    
    console.log(`\n🔢 Analyse:`)
    console.log(`   - Places physiques totales: ${physical}`)
    console.log(`   - Sièges PMR: ${pmrCount}`)
    console.log(`   - Capacité vente actuelle: ${planSalle.capaciteTotal}`)
    
    // Vérifier la logique
    const expectedCapacity = structure.pmrDouble ? physical - pmrCount : physical
    console.log(`   - Capacité attendue: ${expectedCapacity}`)
    
    if (planSalle.capaciteTotal !== expectedCapacity) {
        console.log(`\n⚠️  ERREUR DÉTECTÉE: La capacité devrait être ${expectedCapacity} au lieu de ${planSalle.capaciteTotal}`)
        console.log(`   → Correction nécessaire dans l'API plan-salle`)
    }

    // Créer 5 représentations passées (janvier 2026) - 100% remplissage
    console.log(`\n📅 Création de 5 représentations passées (janvier 2026)...`)
    
    const repsPast = []
    const dates = [
        { date: new Date('2026-01-10T20:00:00'), heure: '20:00', pmr: 0 },
        { date: new Date('2026-01-15T20:00:00'), heure: '20:00', pmr: 1 },
        { date: new Date('2026-01-20T20:00:00'), heure: '20:00', pmr: 0 },
        { date: new Date('2026-01-25T20:00:00'), heure: '20:00', pmr: 3 },
        { date: new Date('2026-01-30T20:00:00'), heure: '20:00', pmr: 0 }
    ]

    for (let i = 0; i < dates.length; i++) {
        const { date, heure, pmr } = dates[i]
        
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
            structure.rangees.forEach((rangee: any) => {
                if (rangee.pmr && rangee.pmr.length > 0) {
                    rangee.pmr.slice(0, pmr).forEach((num: number) => {
                        placesPmr.push(`${rangee.id}${num}`)
                    })
                }
            })
        }

        const rep = await prisma.representation.create({
            data: {
                titre: `Représentation ${i + 1} - Janvier 2026`,
                date,
                heure,
                capacite: planSalle.capaciteTotal,
                description: pmr > 0 ? `Avec ${pmr} siège(s) PMR` : 'Sans siège PMR',
                placesOccupees: JSON.stringify(placesOccupees),
                placesPmr: JSON.stringify(placesPmr.slice(0, pmr)),
                statut: 'termine',
                associationId: testUser.id
            }
        })

        repsPast.push(rep)
        console.log(`   ✅ ${rep.titre} - ${rep.date.toLocaleDateString('fr-FR')} - ${pmr} PMR - ${placesOccupees.length}/${planSalle.capaciteTotal} places`)
    }

    // Créer 5 représentations actives (mars 2026) - 0% remplissage
    console.log(`\n📅 Création de 5 représentations actives (mars 2026)...`)
    
    const repsActive = []
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

        repsActive.push(rep)
        console.log(`   ✅ ${rep.titre} - ${rep.date.toLocaleDateString('fr-FR')} - 0/${planSalle.capaciteTotal} places`)
    }

    console.log(`\n🎉 Terminé !`)
    console.log(`   - ${repsPast.length} représentations passées créées`)
    console.log(`   - ${repsActive.length} représentations actives créées`)
}

main()
    .catch(e => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
