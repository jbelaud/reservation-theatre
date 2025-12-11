
import { PrismaClient } from '@prisma/client'
import { trouverPlaces } from '../lib/placement'

const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Test de réservation PMR\n')

    // 1. Récupérer l'association de test
    const association = await prisma.association.findFirst({
        where: { email: 'test@theatre.fr' }, // Assurez-vous que cet email existe ou adaptez
        include: { plansSalle: true }
    })

    if (!association) {
        console.error('❌ Association de test non trouvée')
        process.exit(1)
    }

    // 2. Créer une fausse représentation pour le test (si besoin, ou utiliser une existante)
    // On va plutôt tester l'algorithme directement avec un plan simulé pour aller vite et ne pas polluer la DB
    console.log('--- Simulation Algorithme ---')

    const planSimule = {
        configuration: 'standard', // ou 'french'
        rangees: [
            { id: 'A', sieges: 10, pmr: [1, 2] }, // A1 et A2 sont PMR
            { id: 'B', sieges: 10, pmr: [] }
        ]
    } as any

    const placesOccupees: string[] = [] // Tout est libre

    console.log('Plan simulé:', JSON.stringify(planSimule, null, 2))

    // Test 1: Réservation Standard (Non PMR)
    console.log('\n📅 Test 1: Réservation Standard (2 places)')
    const placesStandard = trouverPlaces(2, planSimule, placesOccupees, false)
    console.log('Résultat:', placesStandard)

    // Attendu: Pas A1, A2. Donc A3, A4 (si algo centre -> le centre est 5. A5, A6 devrait être pris)
    // Vérifions la logique "centre": centre de 10 = 5. Ordre: 5, 6, 4, 7, 3, 8...
    // A5, A6 sont-ils PMR ? Non. Donc ça devrait être A5, A6.

    // Test 2: Réservation PMR (2 places)
    console.log('\n♿ Test 2: Réservation PMR (2 places)')
    const placesPMR = trouverPlaces(2, planSimule, placesOccupees, true)
    console.log('Résultat:', placesPMR)
    // Attendu: A1, A2 (car ce sont les seuls PMR et ils sont contigus [1, 2])

    // Test 3: Réservation PMR (trop grande)
    console.log('\n♿ Test 3: Réservation PMR (3 places - impossible)')
    const placesPMRTrop = trouverPlaces(3, planSimule, placesOccupees, true)
    console.log('Résultat:', placesPMRTrop)
    // Attendu: null

    console.log('\n🎉 Fin du test')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
