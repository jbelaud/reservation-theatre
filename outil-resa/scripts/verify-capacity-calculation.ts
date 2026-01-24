import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Vérification du calcul de capacité\n')

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

    // Compter les sièges PMR totaux dans le plan
    const nbPmrTotal = structure.rangees.reduce((acc: number, r: any) => 
        acc + (r.pmr?.length || 0), 0
    )

    console.log(`📐 Plan de salle:`)
    console.log(`   Capacité physique totale: ${planSalle.capaciteTotal}`)
    console.log(`   Sièges PMR disponibles: ${nbPmrTotal}`)
    console.log(`   PMR Double: ${structure.pmrDouble}\n`)

    // Récupérer la représentation 1 - Mars 2026
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
    console.log(`   Date: ${new Date(representation.date).toLocaleDateString('fr-FR')}`)

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

    console.log(`\n🪑 État actuel:`)
    console.log(`   Places physiques occupées: ${placesOccupees.length}`)
    console.log(`   Sièges PMR réservés: ${placesPmr.length} → ${placesPmr.join(', ')}`)
    console.log(`   Nombre de réservations: ${representation.reservations.length}`)

    // Calculer tickets vendus
    const ticketsVendus = representation.reservations.reduce((acc, r) => acc + r.nbPlaces, 0)
    console.log(`   Tickets vendus (somme nbPlaces): ${ticketsVendus}`)

    console.log(`\n📊 Calcul de capacité:`)
    const nbPmrReserves = placesPmr.length
    const capaciteVente = representation.capacite - nbPmrReserves
    const placesRestantes = capaciteVente - ticketsVendus

    console.log(`   1. Capacité physique de base: ${representation.capacite}`)
    console.log(`   2. Sièges PMR réservés: ${nbPmrReserves}`)
    console.log(`   3. Capacité de vente = ${representation.capacite} - ${nbPmrReserves} = ${capaciteVente}`)
    console.log(`   4. Tickets vendus: ${ticketsVendus}`)
    console.log(`   5. Places restantes = ${capaciteVente} - ${ticketsVendus} = ${placesRestantes}`)

    console.log(`\n✅ Résultat:`)
    console.log(`   Capacité de vente: ${capaciteVente} tickets`)
    console.log(`   Places restantes: ${placesRestantes} tickets`)

    console.log(`\n💡 Explication:`)
    console.log(`   - Capacité physique: 216 places`)
    console.log(`   - ${nbPmrReserves} place(s) PMR réservée(s) × 2 = ${nbPmrReserves * 2} places physiques occupées`)
    console.log(`   - ${ticketsVendus - nbPmrReserves} place(s) normale(s) réservée(s)`)
    console.log(`   - Total physique occupé: ${nbPmrReserves * 2 + (ticketsVendus - nbPmrReserves)} places`)
    console.log(`   - Places physiques libres: ${216 - (nbPmrReserves * 2 + (ticketsVendus - nbPmrReserves))}`)
}

main()
    .catch(e => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
