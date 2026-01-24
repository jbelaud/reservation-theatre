import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Vérification de la représentation Mars 2026\n')

    const testUser = await prisma.association.findUnique({
        where: { email: 'association-test@test.fr' }
    })

    if (!testUser) {
        console.log('❌ Association Test non trouvée')
        return
    }

    // Trouver la représentation Mars 2026
    const representation = await prisma.representation.findFirst({
        where: {
            associationId: testUser.id,
            titre: { contains: 'Mars 2026' }
        },
        include: {
            reservations: true
        }
    })

    if (!representation) {
        console.log('❌ Représentation Mars 2026 non trouvée')
        return
    }

    console.log(`📅 Représentation: ${representation.titre}`)
    console.log(`   Date: ${representation.date}`)
    console.log(`   Capacité totale: ${representation.capacite} places`)
    console.log(`   Statut: ${representation.statut}`)

    // Parser les places occupées
    let placesOccupees = []
    if (typeof representation.placesOccupees === 'string') {
        placesOccupees = JSON.parse(representation.placesOccupees)
    } else {
        placesOccupees = representation.placesOccupees || []
    }

    console.log(`\n🪑 Places physiques occupées: ${placesOccupees.length}`)
    if (placesOccupees.length > 0) {
        console.log(`   Sièges: ${placesOccupees.join(', ')}`)
    }

    // Analyser les réservations
    console.log(`\n📋 Réservations: ${representation.reservations.length}`)
    let totalTicketsVendus = 0
    let totalPlacesPmr = 0

    representation.reservations.forEach((res, index) => {
        totalTicketsVendus += res.nbPlaces

        // Parser les sièges
        let sieges = []
        if (typeof res.sieges === 'string') {
            sieges = JSON.parse(res.sieges)
        } else {
            sieges = res.sieges || []
        }

        // Compter les places PMR dans cette réservation
        const pmrSeats = sieges.filter((s: string) => {
            // Vérifier si c'est un siège PMR (rangée R, sièges 1, 4, 5)
            return s === 'R1' || s === 'R4' || s === 'R5'
        })

        if (pmrSeats.length > 0) {
            totalPlacesPmr += pmrSeats.length
        }

        console.log(`   ${index + 1}. ${res.prenom} ${res.nom}:`)
        console.log(`      - ${res.nbPlaces} place(s) vendues`)
        console.log(`      - ${sieges.length} siège(s) physiques: ${sieges.join(', ')}`)
        if (pmrSeats.length > 0) {
            console.log(`      - ${pmrSeats.length} place(s) PMR: ${pmrSeats.join(', ')}`)
        }
    })

    console.log(`\n📊 Résumé:`)
    console.log(`   Capacité physique totale: 216 places`)
    console.log(`   Places physiques occupées: ${placesOccupees.length}`)
    console.log(`   Tickets vendus (billetterie): ${totalTicketsVendus}`)
    console.log(`   Places PMR réservées: ${totalPlacesPmr}`)
    
    const placesPhysiquesRestantes = 216 - placesOccupees.length
    const ticketsDisponibles = representation.capacite - totalTicketsVendus
    
    console.log(`\n✅ Disponibilité:`)
    console.log(`   Places physiques restantes: ${placesPhysiquesRestantes}`)
    console.log(`   Tickets disponibles à la vente: ${ticketsDisponibles}`)

    console.log(`\n💡 Logique attendue avec PMR Double:`)
    console.log(`   - Si ${totalPlacesPmr} place(s) PMR réservée(s)`)
    console.log(`   - Alors ${totalPlacesPmr * 2} place(s) physique(s) occupée(s) pour PMR`)
    console.log(`   - Plus ${totalTicketsVendus - totalPlacesPmr} place(s) standard`)
    console.log(`   - Total physique occupé devrait être: ${totalPlacesPmr * 2 + (totalTicketsVendus - totalPlacesPmr)}`)
    console.log(`   - Capacité de vente restante: ${216 - (totalPlacesPmr * 2 + (totalTicketsVendus - totalPlacesPmr))}`)
}

main()
    .catch(e => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
