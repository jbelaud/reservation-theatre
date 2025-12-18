// prisma/seed-reservations.ts
// Script pour ajouter des réservations de test aux représentations existantes

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Noms et prénoms français pour le test
const prenoms = ['Pierre', 'Marie', 'Jean', 'Sophie', 'Michel', 'Isabelle', 'Philippe', 'Catherine', 'François', 'Anne', 'Bernard', 'Martine', 'Alain', 'Christine', 'Jacques', 'Monique', 'René', 'Nicole', 'Gérard', 'Françoise']
const noms = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier']

function randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function generatePhone(): string {
    return `06${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
}

async function main() {
    console.log('🎭 Ajout de réservations de test...\n')

    // Récupérer les représentations existantes
    const representations = await prisma.representation.findMany({
        include: {
            association: {
                include: {
                    plansSalle: true
                }
            }
        }
    })

    if (representations.length === 0) {
        console.log('❌ Aucune représentation trouvée. Lancez d\'abord le seed principal.')
        return
    }

    for (const rep of representations) {
        console.log(`\n📅 ${rep.titre} (${rep.date.toLocaleDateString('fr-FR')})`)

        // Récupérer le plan de salle
        const planSalle = rep.association.plansSalle[0]
        if (!planSalle) {
            console.log('   ⚠️ Pas de plan de salle configuré')
            continue
        }

        // Parser la structure
        let structure: { rangees: { id: string; sieges: number }[] }
        try {
            structure = typeof planSalle.structure === 'string'
                ? JSON.parse(planSalle.structure)
                : planSalle.structure as any
        } catch {
            console.log('   ⚠️ Structure de salle invalide')
            continue
        }

        if (!structure.rangees || structure.rangees.length === 0) {
            console.log('   ⚠️ Aucune rangée configurée')
            continue
        }

        // Générer tous les sièges disponibles
        const allSeats: string[] = []
        for (const rangee of structure.rangees) {
            for (let i = 1; i <= rangee.sieges; i++) {
                allSeats.push(`${rangee.id}${i}`)
            }
        }

        // Nombre de réservations à créer (remplir ~70-90% de la salle)
        const fillRate = 0.7 + Math.random() * 0.2 // 70-90%
        const totalSeatsToFill = Math.floor(allSeats.length * fillRate)

        const shuffledSeats = [...allSeats].sort(() => Math.random() - 0.5)
        let currentIndex = 0
        const reservations: { prenom: string; nom: string; telephone: string; email: string; nbPlaces: number; sieges: string[] }[] = []

        while (currentIndex < totalSeatsToFill) {
            // Nombre de places pour cette réservation (1 à 5)
            const nbPlaces = Math.min(
                1 + Math.floor(Math.random() * 5),
                totalSeatsToFill - currentIndex
            )

            const sieges = shuffledSeats.slice(currentIndex, currentIndex + nbPlaces)
            currentIndex += nbPlaces

            const prenom = randomFrom(prenoms)
            const nom = randomFrom(noms)

            reservations.push({
                prenom,
                nom,
                telephone: generatePhone(),
                email: Math.random() > 0.3 ? `${prenom.toLowerCase()}.${nom.toLowerCase()}@email.fr` : '',
                nbPlaces,
                sieges
            })
        }

        // Créer les réservations dans la base
        let placesOccupees: string[] = []

        for (const resa of reservations) {
            await prisma.reservation.create({
                data: {
                    prenom: resa.prenom,
                    nom: resa.nom,
                    telephone: resa.telephone,
                    email: resa.email || null,
                    nbPlaces: resa.nbPlaces,
                    sieges: JSON.stringify(resa.sieges),
                    statut: Math.random() > 0.1 ? 'confirmé' : 'présent',
                    representationId: rep.id
                }
            })
            placesOccupees = [...placesOccupees, ...resa.sieges]
        }

        // Mettre à jour les places occupées de la représentation
        await prisma.representation.update({
            where: { id: rep.id },
            data: {
                placesOccupees: JSON.stringify(placesOccupees)
            }
        })

        console.log(`   ✅ ${reservations.length} réservations créées (${placesOccupees.length}/${allSeats.length} places)`)
    }

    console.log('\n🎉 Seed des réservations terminé !')
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
