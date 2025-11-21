interface PlanSalle {
    rangees: Array<{
        id: string
        sieges: number
    }>
}

export function trouverPlaces(
    nbPlaces: number,
    plan: PlanSalle,
    placesOccupees: string[]
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

    // Stratégie 1: Une seule rangée
    for (const rangee of plan.rangees) {
        const places = chercherConsecutifsCentre(rangee, nbPlaces, placesLibres)
        if (places.length === nbPlaces) {
            return places
        }
    }

    // Stratégie 2: Deux rangées si pair
    if (nbPlaces % 2 === 0 && nbPlaces <= 6) {
        const places = chercherSur2Rangees(plan, nbPlaces, placesLibres)
        if (places) return places
    }

    return null
}

function chercherConsecutifsCentre(
    rangee: { id: string; sieges: number },
    nbPlaces: number,
    placesLibres: Set<string>
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
        let valide = true

        for (let i = 0; i < nbPlaces; i++) {
            const placeId = `${rangee.id}${debut + i}`
            if (!placesLibres.has(placeId)) {
                valide = false
                break
            }
            places.push(placeId)
        }

        if (valide) return places
    }

    return []
}

function chercherSur2Rangees(
    plan: PlanSalle,
    nbPlaces: number,
    placesLibres: Set<string>
): string[] | null {

    const parRangee = nbPlaces / 2

    for (let i = 0; i < plan.rangees.length - 1; i++) {
        const rangee1 = plan.rangees[i]
        const rangee2 = plan.rangees[i + 1]

        const maxCol = Math.min(rangee1.sieges, rangee2.sieges)

        for (let col = 1; col <= maxCol - parRangee + 1; col++) {
            const places: string[] = []
            let valide = true

            for (let j = 0; j < parRangee; j++) {
                const place1 = `${rangee1.id}${col + j}`
                const place2 = `${rangee2.id}${col + j}`

                if (!placesLibres.has(place1) || !placesLibres.has(place2)) {
                    valide = false
                    break
                }
                places.push(place1, place2)
            }

            if (valide) return places
        }
    }

    return null
}
