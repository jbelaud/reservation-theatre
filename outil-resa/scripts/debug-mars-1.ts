import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Debug détaillé Représentation 1 - Mars 2026\n')

    const testUser = await prisma.association.findUnique({
        where: { email: 'association-test@test.fr' }
    })

    if (!testUser) {
        console.log('❌ Association Test non trouvée')
        return
    }

    const representation = await prisma.representation.findFirst({
        where: {
            associationId: testUser.id,
            titre: 'Représentation 1 - Mars 2026'
        },
        include: {
            reservations: true
        }
    })

    if (!representation) {
        console.log('❌ Représentation non trouvée')
        return
    }

    console.log(`📅 ${representation.titre}`)
    console.log(`   Capacité de base: ${representation.capacite}`)

    // Parser places occupées
    let placesOccupees = []
    if (typeof representation.placesOccupees === 'string') {
        placesOccupees = JSON.parse(representation.placesOccupees)
    } else {
        placesOccupees = representation.placesOccupees || []
    }

    // Parser places PMR
    let placesPmr = []
    if (typeof representation.placesPmr === 'string') {
        placesPmr = JSON.parse(representation.placesPmr)
    } else {
        placesPmr = representation.placesPmr || []
    }

    console.log(`\n🪑 Places physiques occupées: ${placesOccupees.length}`)
    console.log(`   Liste: ${placesOccupees.join(', ')}`)

    console.log(`\n🦽 Places PMR réservées: ${placesPmr.length}`)
    console.log(`   Liste: ${placesPmr.join(', ')}`)

    console.log(`\n📋 Réservations: ${representation.reservations.length}`)
    let totalTicketsFromReservations = 0
    representation.reservations.forEach((res, i) => {
        totalTicketsFromReservations += res.nbPlaces
        
        let sieges = []
        if (typeof res.sieges === 'string') {
            sieges = JSON.parse(res.sieges)
        } else {
            sieges = res.sieges || []
        }

        console.log(`   ${i + 1}. ${res.prenom} ${res.nom}:`)
        console.log(`      - nbPlaces (tickets): ${res.nbPlaces}`)
        console.log(`      - sieges (physiques): ${sieges.length} → ${sieges.join(', ')}`)
    })

    console.log(`\n📊 Calcul selon la logique actuelle de l'API:`)
    const nbPmrReserves = placesPmr.length
    const capaciteVente = representation.capacite - nbPmrReserves
    const ticketsVendus = placesOccupees.length - nbPmrReserves
    const placesRestantes = capaciteVente - ticketsVendus

    console.log(`   nbPmrReserves = ${nbPmrReserves}`)
    console.log(`   capaciteVente = ${representation.capacite} - ${nbPmrReserves} = ${capaciteVente}`)
    console.log(`   ticketsVendus = ${placesOccupees.length} - ${nbPmrReserves} = ${ticketsVendus}`)
    console.log(`   placesRestantes = ${capaciteVente} - ${ticketsVendus} = ${placesRestantes}`)

    console.log(`\n✅ Total tickets vendus (somme des réservations): ${totalTicketsFromReservations}`)
    console.log(`✅ Places restantes affichées: ${placesRestantes}`)
}

main()
    .catch(e => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
