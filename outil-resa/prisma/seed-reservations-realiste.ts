// prisma/seed-reservations-realiste.ts
// Script pour créer des réservations réalistes avec l'algorithme de placement

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Noms et prénoms français
const prenoms = ['Pierre', 'Marie', 'Jean', 'Sophie', 'Michel', 'Isabelle', 'Philippe', 'Catherine', 'François', 'Anne', 'Bernard', 'Martine', 'Alain', 'Christine', 'Jacques', 'Monique', 'René', 'Nicole', 'Gérard', 'Françoise', 'Luc', 'Hélène', 'Patrick', 'Sylvie', 'Thierry', 'Brigitte']
const noms = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier']

function randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function generatePhone(): string {
    return `06${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
}

// Algorithme de placement simplifié (comme dans lib/placement.ts)
function trouverPlacesContigues(
    nbPlaces: number,
    rangees: { id: string; sieges: number }[],
    placesOccupees: string[]
): string[] | null {
    // Parcourir les rangées de l'avant vers l'arrière
    for (const rangee of rangees) {
        // Générer tous les sièges de la rangée
        const siegesRangee: string[] = []
        for (let i = 1; i <= rangee.sieges; i++) {
            siegesRangee.push(`${rangee.id}${i}`)
        }

        // Trouver des places contiguës libres
        let consecutiveStart = -1
        let consecutiveCount = 0

        for (let i = 0; i < siegesRangee.length; i++) {
            if (!placesOccupees.includes(siegesRangee[i])) {
                if (consecutiveStart === -1) {
                    consecutiveStart = i
                }
                consecutiveCount++

                if (consecutiveCount >= nbPlaces) {
                    // On a trouvé assez de places contiguës
                    return siegesRangee.slice(consecutiveStart, consecutiveStart + nbPlaces)
                }
            } else {
                // Place occupée, on repart à zéro
                consecutiveStart = -1
                consecutiveCount = 0
            }
        }
    }

    return null // Pas assez de places contiguës trouvées
}

async function main() {
    console.log('🧹 Suppression des anciennes réservations...')

    // Supprimer toutes les réservations existantes
    await prisma.reservation.deleteMany({})

    // Réinitialiser les places occupées des représentations
    await prisma.representation.updateMany({
        data: { placesOccupees: '[]' }
    })

    console.log('🎭 Création de réservations réalistes...\n')

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
        console.log('❌ Aucune représentation trouvée.')
        return
    }

    for (const rep of representations) {
        console.log(`\n📅 ${rep.titre} (${rep.date.toLocaleDateString('fr-FR')})`)

        const planSalle = rep.association.plansSalle[0]
        if (!planSalle) {
            console.log('   ⚠️ Pas de plan de salle')
            continue
        }

        // Parser la structure
        let structure: { rangees: { id: string; sieges: number }[] }
        try {
            structure = typeof planSalle.structure === 'string'
                ? JSON.parse(planSalle.structure)
                : planSalle.structure as any
        } catch {
            console.log('   ⚠️ Structure invalide')
            continue
        }

        if (!structure.rangees || structure.rangees.length === 0) {
            console.log('   ⚠️ Aucune rangée')
            continue
        }

        // Calculer la capacité totale
        const capaciteTotale = structure.rangees.reduce((acc, r) => acc + r.sieges, 0)

        // Nombre de réservations à créer (remplir ~70-85%)
        const fillRate = 0.70 + Math.random() * 0.15
        const targetPlaces = Math.floor(capaciteTotale * fillRate)

        let placesOccupees: string[] = []
        let reservationsCreees = 0

        while (placesOccupees.length < targetPlaces) {
            // Nombre de places pour cette réservation (1 à 5)
            const restantes = targetPlaces - placesOccupees.length
            const nbPlaces = Math.min(
                1 + Math.floor(Math.random() * 5),
                restantes
            )

            // Utiliser l'algorithme de placement contigu
            const sieges = trouverPlacesContigues(nbPlaces, structure.rangees, placesOccupees)

            if (!sieges) {
                // Plus de places contiguës disponibles
                console.log(`   ⚠️ Plus de places contiguës après ${placesOccupees.length} places`)
                break
            }

            const prenom = randomFrom(prenoms)
            const nom = randomFrom(noms)

            await prisma.reservation.create({
                data: {
                    prenom,
                    nom,
                    telephone: generatePhone(),
                    email: Math.random() > 0.3 ? `${prenom.toLowerCase()}.${nom.toLowerCase()}@email.fr` : null,
                    nbPlaces,
                    sieges: JSON.stringify(sieges),
                    statut: Math.random() > 0.15 ? 'confirmé' : 'présent',
                    representationId: rep.id
                }
            })

            placesOccupees = [...placesOccupees, ...sieges]
            reservationsCreees++
        }

        // Mettre à jour les places occupées de la représentation
        await prisma.representation.update({
            where: { id: rep.id },
            data: {
                placesOccupees: JSON.stringify(placesOccupees)
            }
        })

        const tauxRemplissage = Math.round((placesOccupees.length / capaciteTotale) * 100)
        console.log(`   ✅ ${reservationsCreees} réservations (${placesOccupees.length}/${capaciteTotale} places = ${tauxRemplissage}%)`)
    }

    console.log('\n🎉 Seed réaliste terminé !')
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
