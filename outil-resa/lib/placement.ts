interface PlanSalle {
    rangees: Array<{
        id: string
        sieges: number
        pmr?: number[]
    }>
    configuration?: 'standard' | 'french'
    pmrDouble?: boolean
}

export function trouverPlaces(
    nbPlaces: number,
    plan: PlanSalle,
    placesOccupees: string[],
    nbPmr: number = 0
): string[] | null {

    const placesLibres = new Set<string>()

    plan.rangees.forEach(rangee => {
        for (let i = 1; i <= rangee.sieges; i++) {
            const placeId = `${rangee.id}${i}`
            if (!placesOccupees.includes(placeId)) {
                placesLibres.add(placeId)
            }
        }
    })

    const isFrench = plan.configuration === 'french'
    const pmrDouble = plan.pmrDouble === true
    const totalSlotsNeeded = nbPlaces + (pmrDouble ? nbPmr : 0)

    // Stratégie 1: Une seule rangée
    for (const rangee of plan.rangees) {
        let places: string[]
        if (isFrench) {
            places = chercherPlacesFrancaises(rangee, totalSlotsNeeded, placesLibres, nbPmr)
        } else {
            places = chercherConsecutifsCentre(rangee, totalSlotsNeeded, placesLibres, nbPmr)
        }

        if (places.length === totalSlotsNeeded) {
            return places
        }
    }

    // Stratégie 2: Deux rangées si pair (et petit groupe)
    // Note: On reste sur nbPlaces pour la logique de parité du groupe, 
    // mais chercherSur2Rangees doit gérer les slots
    if (nbPlaces % 2 === 0 && nbPlaces <= 6) {
        const places = chercherSur2Rangees(plan, totalSlotsNeeded, placesLibres, isFrench, nbPmr)
        if (places) return places
    }

    return null
}

/**
 * Mode Standard : Cherche places consécutives (1, 2, 3...) depuis le centre
 */
function chercherConsecutifsCentre(
    rangee: { id: string; sieges: number; pmr?: number[] },
    nbPlaces: number,
    placesLibres: Set<string>,
    nbPmr: number
): string[] {

    const centre = Math.ceil(rangee.sieges / 2)
    const ordreRecherche: number[] = []

    for (let offset = 0; offset < rangee.sieges; offset++) {
        if (centre - offset >= 1) {
            ordreRecherche.push(centre - offset)
        }
        if (centre + offset <= rangee.sieges && offset > 0) {
            ordreRecherche.push(centre + offset)
        }
    }

    for (const debut of ordreRecherche) {
        if (debut + nbPlaces - 1 > rangee.sieges) continue

        const places: string[] = []
        let foundPmrCount = 0
        let valide = true

        for (let i = 0; i < nbPlaces; i++) {
            const num = debut + i
            const placeId = `${rangee.id}${num}`

            // Vérification disponibilité
            if (!placesLibres.has(placeId)) {
                valide = false
                break
            }

            // Comptage PMR
            if (rangee.pmr?.includes(num)) {
                foundPmrCount++
            }

            places.push(placeId)
        }

        if (valide) {
            // Règles PMR
            if (nbPmr > 0) {
                // Si demande PMR : il faut au moins le nombre demandé
                if (foundPmrCount < nbPmr) valide = false
            } else {
                // Si pas de demande PMR : on ne doit pas prendre de place PMR
                if (foundPmrCount > 0) valide = false
            }
        }

        if (valide) return places
    }

    return []
}

/**
 * Mode Français : Cherche places de même parité (1, 3, 5...) depuis le centre (1, 2)
 */
function chercherPlacesFrancaises(
    rangee: { id: string; sieges: number; pmr?: number[] },
    nbPlaces: number,
    placesLibres: Set<string>,
    nbPmr: number
): string[] {
    // 1. Générer les séries possibles
    const maxSiege = rangee.sieges

    // Série Impaire (Côté Jardin/Cour selon convention) : 1, 3, 5...
    const placesImpaires = findBestBlockInParity(rangee, 1, maxSiege, nbPlaces, placesLibres, nbPmr)

    // Série Paire : 2, 4, 6...
    const placesPaires = findBestBlockInParity(rangee, 2, maxSiege, nbPlaces, placesLibres, nbPmr)

    // Si on a trouvé des deux côtés, on prend le "meilleur" (somme des numéros la plus basse = plus proche du centre)
    if (placesImpaires.length > 0 && placesPaires.length > 0) {
        const scoreImpair = placesImpaires.reduce((sum, id) => sum + parseInt(id.replace(rangee.id, '')), 0)
        const scorePair = placesPaires.reduce((sum, id) => sum + parseInt(id.replace(rangee.id, '')), 0)
        return scoreImpair <= scorePair ? placesImpaires : placesPaires
    }

    return placesImpaires.length > 0 ? placesImpaires : placesPaires
}

function findBestBlockInParity(
    rangee: { id: string; sieges: number; pmr?: number[] },
    startNum: number,
    maxNum: number,
    targetCount: number,
    placesLibres: Set<string>,
    nbPmr: number
): string[] {
    // On itère par pas de 2 : 1, 3, 5... ou 2, 4, 6...

    for (let current = startNum; current <= maxNum; current += 2) {
        // Vérifier limites
        const lastSeatNum = current + (targetCount - 1) * 2
        if (lastSeatNum > maxNum) break

        const places: string[] = []
        let foundPmrCount = 0
        let valide = true

        for (let k = 0; k < targetCount; k++) {
            const seatNum = current + k * 2
            const placeId = `${rangee.id}${seatNum}`

            if (!placesLibres.has(placeId)) {
                valide = false
                break
            }

            if (rangee.pmr?.includes(seatNum)) {
                foundPmrCount++
            }

            places.push(placeId)
        }

        if (valide) {
            if (nbPmr > 0) {
                if (foundPmrCount < nbPmr) valide = false
            } else {
                if (foundPmrCount > 0) valide = false
            }
        }

        if (valide) return places
    }

    return []
}

function chercherSur2Rangees(
    plan: PlanSalle,
    nbPlaces: number,
    placesLibres: Set<string>,
    isFrench: boolean = false,
    nbPmr: number
): string[] | null {

    const parRangee = nbPlaces / 2

    for (let i = 0; i < plan.rangees.length - 1; i++) {
        const rangee1 = plan.rangees[i]
        const rangee2 = plan.rangees[i + 1]

        const maxCol = Math.min(rangee1.sieges, rangee2.sieges)

        const step = isFrench ? 2 : 1

        let colsToCheck: number[] = []
        if (isFrench) {
            const odds = []; for (let c = 1; c <= maxCol; c += 2) odds.push(c)
            const evens = []; for (let c = 2; c <= maxCol; c += 2) evens.push(c)
            colsToCheck = [...odds, ...evens].sort((a, b) => a - b)
        } else {
            for (let c = 1; c <= maxCol; c++) colsToCheck.push(c)
        }

        for (const col of colsToCheck) {
            const lastOffset = (parRangee - 1) * step
            if (col + lastOffset > rangee1.sieges || col + lastOffset > rangee2.sieges) continue

            const places: string[] = []
            let foundPmrCount = 0
            let valide = true

            for (let j = 0; j < parRangee; j++) {
                const currentNum = col + j * step

                const place1 = `${rangee1.id}${currentNum}`
                const place2 = `${rangee2.id}${currentNum}`

                // Check libre
                if (!placesLibres.has(place1) || !placesLibres.has(place2)) {
                    valide = false; break
                }

                if (rangee1.pmr?.includes(currentNum)) foundPmrCount++
                if (rangee2.pmr?.includes(currentNum)) foundPmrCount++

                places.push(place1, place2)
            }

            if (valide) {
                if (nbPmr > 0) {
                    if (foundPmrCount < nbPmr) valide = false
                } else {
                    if (foundPmrCount > 0) valide = false
                }
            }

            if (valide) return places
        }
    }

    return null
}
