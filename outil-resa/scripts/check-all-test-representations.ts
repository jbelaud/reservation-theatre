import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Vérification de toutes les représentations Test\n')

    const testUser = await prisma.association.findUnique({
        where: { email: 'association-test@test.fr' }
    })

    if (!testUser) {
        console.log('❌ Association Test non trouvée')
        return
    }

    const representations = await prisma.representation.findMany({
        where: { associationId: testUser.id },
        include: { reservations: true },
        orderBy: { date: 'asc' }
    })

    console.log(`📊 Total: ${representations.length} représentation(s)\n`)

    representations.forEach((rep, index) => {
        console.log(`${index + 1}. ${rep.titre}`)
        console.log(`   Date: ${new Date(rep.date).toLocaleDateString('fr-FR')}`)
        console.log(`   Capacité: ${rep.capacite}`)
        
        // Parser places occupées
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

        const totalTickets = rep.reservations.reduce((acc, r) => acc + r.nbPlaces, 0)
        
        console.log(`   Places physiques occupées: ${placesOccupees.length}`)
        console.log(`   Tickets vendus: ${totalTickets}`)
        console.log(`   Réservations: ${rep.reservations.length}`)
        
        if (rep.reservations.length > 0) {
            rep.reservations.forEach((res, i) => {
                let sieges = []
                if (typeof res.sieges === 'string') {
                    try {
                        sieges = JSON.parse(res.sieges)
                    } catch {
                        sieges = []
                    }
                } else {
                    sieges = res.sieges || []
                }

                const pmrSeats = sieges.filter((s: string) => s === 'R1' || s === 'R4' || s === 'R5')
                
                console.log(`      ${i + 1}. ${res.prenom} ${res.nom}: ${res.nbPlaces} place(s)`)
                console.log(`         Sièges: ${sieges.join(', ')}`)
                if (pmrSeats.length > 0) {
                    console.log(`         🦽 PMR: ${pmrSeats.join(', ')}`)
                }
            })
        }
        console.log('')
    })
}

main()
    .catch(e => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
