import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Mise à jour du plan de salle et des représentations\n')

    const testUser = await prisma.association.findUnique({
        where: { email: 'association-test@test.fr' }
    })

    if (!testUser) {
        console.log('❌ Compte association-test@test.fr non trouvé')
        return
    }

    // 1. Mettre à jour le plan de salle à 216 places
    console.log('📐 Mise à jour du plan de salle...')
    const planSalle = await prisma.planSalle.update({
        where: { associationId: testUser.id },
        data: {
            capaciteTotal: 216
        }
    })
    console.log(`✅ Plan de salle mis à jour : ${planSalle.capaciteTotal} places\n`)

    // 2. Supprimer toutes les représentations existantes
    const deleted = await prisma.representation.deleteMany({
        where: { associationId: testUser.id }
    })
    console.log(`🗑️  ${deleted.count} représentations supprimées\n`)

    // Récupérer la structure du plan
    const structure = JSON.parse(planSalle.structure)

    // 3. Créer 5 représentations passées (avant le 18 janvier 2026) - 100% remplissage
    console.log(`📅 Création de 5 représentations passées (avant le 18/01/2026)...\n`)
    
    const datesPast = [
        { date: new Date('2026-01-05T20:00:00'), heure: '20:00', pmr: 0, titre: 'Représentation 1 - Janvier 2026' },
        { date: new Date('2026-01-08T20:00:00'), heure: '20:00', pmr: 1, titre: 'Représentation 2 - Janvier 2026' },
        { date: new Date('2026-01-11T20:00:00'), heure: '20:00', pmr: 0, titre: 'Représentation 3 - Janvier 2026' },
        { date: new Date('2026-01-14T20:00:00'), heure: '20:00', pmr: 3, titre: 'Représentation 4 - Janvier 2026' },
        { date: new Date('2026-01-17T20:00:00'), heure: '20:00', pmr: 0, titre: 'Représentation 5 - Janvier 2026' }
    ]

    for (const config of datesPast) {
        const { date, heure, pmr, titre } = config
        
        // Générer toutes les places occupées (100% remplissage)
        const placesOccupees: string[] = []
        structure.rangees.forEach((rangee: { id: string; sieges: number }) => {
            for (let j = 1; j <= rangee.sieges; j++) {
                placesOccupees.push(`${rangee.id}${j}`)
            }
        })

        // Identifier les places PMR à réserver
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

        // Calcul de la capacité dynamique pour cette représentation
        const capaciteVente = 216 - pmr
        const ticketsVendus = placesOccupees.length - pmr

        const rep = await prisma.representation.create({
            data: {
                titre,
                date,
                heure,
                capacite: 216, // Capacité de base
                description: pmr > 0 ? `Avec ${pmr} siège(s) PMR` : 'Sans siège PMR',
                placesOccupees: JSON.stringify(placesOccupees),
                placesPmr: JSON.stringify(placesPmr),
                statut: 'termine',
                associationId: testUser.id
            }
        })

        console.log(`✅ ${titre}`)
        console.log(`   Date: ${rep.date.toLocaleDateString('fr-FR')}`)
        console.log(`   PMR réservés: ${pmr}`)
        console.log(`   Capacité vente: ${capaciteVente} tickets`)
        console.log(`   Tickets vendus: ${ticketsVendus}`)
        console.log(`   Taux: ${Math.round((ticketsVendus / capaciteVente) * 100)}%\n`)
    }

    // 4. Créer 5 représentations actives (mars 2026) - 0% remplissage
    console.log(`📅 Création de 5 représentations actives (mars 2026)...\n`)
    
    const datesMars = [
        { date: new Date('2026-03-05T20:00:00'), heure: '20:00', titre: 'Représentation 1 - Mars 2026' },
        { date: new Date('2026-03-10T20:00:00'), heure: '20:00', titre: 'Représentation 2 - Mars 2026' },
        { date: new Date('2026-03-15T20:00:00'), heure: '20:00', titre: 'Représentation 3 - Mars 2026' },
        { date: new Date('2026-03-20T20:00:00'), heure: '20:00', titre: 'Représentation 4 - Mars 2026' },
        { date: new Date('2026-03-25T20:00:00'), heure: '20:00', titre: 'Représentation 5 - Mars 2026' }
    ]

    for (const config of datesMars) {
        const { date, heure, titre } = config

        const rep = await prisma.representation.create({
            data: {
                titre,
                date,
                heure,
                capacite: 216, // Capacité de base
                description: 'Représentation à venir',
                placesOccupees: JSON.stringify([]),
                placesPmr: JSON.stringify([]),
                statut: 'planifie',
                associationId: testUser.id
            }
        })

        console.log(`✅ ${titre} - ${rep.date.toLocaleDateString('fr-FR')} - 0/216 places`)
    }

    console.log(`\n🎉 Terminé !`)
    console.log(`\nRécapitulatif:`)
    console.log(`- Plan de salle: 216 places physiques`)
    console.log(`- Représentations passées: 5 (100% remplies)`)
    console.log(`  • Sans PMR: capacité 216 tickets`)
    console.log(`  • 1 PMR: capacité 215 tickets`)
    console.log(`  • 3 PMR: capacité 213 tickets`)
    console.log(`- Représentations actives: 5 (0% remplies)`)
}

main()
    .catch(e => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
