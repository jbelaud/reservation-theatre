import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Debug des représentations\n')

    const testUser = await prisma.association.findUnique({
        where: { email: 'association-test@test.fr' }
    })

    if (!testUser) {
        console.log('❌ Compte non trouvé')
        return
    }

    const representations = await prisma.representation.findMany({
        where: { associationId: testUser.id },
        orderBy: { date: 'asc' }
    })

    console.log(`📊 ${representations.length} représentations trouvées\n`)

    for (const rep of representations) {
        const placesOccupees = JSON.parse(rep.placesOccupees)
        const placesPmr = JSON.parse(rep.placesPmr)
        
        const nbPmr = placesPmr.length
        const capaciteVente = rep.capacite - nbPmr
        const ticketsVendus = placesOccupees.length - nbPmr
        const placesRestantes = capaciteVente - ticketsVendus
        const taux = capaciteVente > 0 ? Math.round((ticketsVendus / capaciteVente) * 100) : 0

        console.log(`📅 ${rep.titre}`)
        console.log(`   Date: ${rep.date.toLocaleDateString('fr-FR')}`)
        console.log(`   Capacité base: ${rep.capacite}`)
        console.log(`   Places occupées (physiques): ${placesOccupees.length}`)
        console.log(`   Sièges PMR réservés: ${nbPmr}`)
        console.log(`   Capacité vente: ${capaciteVente}`)
        console.log(`   Tickets vendus: ${ticketsVendus}`)
        console.log(`   Places restantes: ${placesRestantes}`)
        console.log(`   Taux: ${taux}%`)
        console.log(`   Statut: ${rep.statut}\n`)
    }
}

main()
    .catch(e => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
