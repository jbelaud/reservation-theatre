import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trouverPlaces } from '@/lib/placement'
import { parsePlacesOccupees, parsePlanStructure, stringifyJsonField } from '@/lib/json-helpers'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { representationId, prenom, nom, telephone, email, nbPlaces, sieges, pmr, nbPmr } = body

        // 1. Validation basique
        if (!representationId || !prenom || !nom || !telephone || !nbPlaces) {
            return NextResponse.json(
                { error: 'Tous les champs obligatoires doivent être remplis' },
                { status: 400 }
            )
        }

        if (nbPlaces < 1 || nbPlaces > 50) {
            return NextResponse.json(
                { error: 'Le nombre de places doit être compris entre 1 et 50' },
                { status: 400 }
            )
        }

        // Déterminer le nombre de places PMR demandées
        // Si nbPmr est fourni (nouvelle interface publique), on l'utilise
        // Sinon, si pmr est vrai (interface admin/ancienne), on en demande au moins 1
        let requestedNbPmr = 0
        if (typeof nbPmr === 'number') {
            requestedNbPmr = nbPmr
        } else if (pmr) {
            requestedNbPmr = 1 // Par défaut, au moins une place PMR si coché
        }

        if (requestedNbPmr > nbPlaces) {
            return NextResponse.json(
                { error: 'Le nombre de places PMR ne peut pas être supérieur au nombre total de places' },
                { status: 400 }
            )
        }

        // 2. Récupérer la représentation et son plan
        const representation = await prisma.representation.findUnique({
            where: { id: representationId },
            include: {
                reservations: true, // Pour calculer la capacité réelle en tickets
                association: {
                    include: {
                        plansSalle: true
                    }
                }
            }
        })

        if (!representation) {
            return NextResponse.json(
                { error: 'Représentation introuvable' },
                { status: 404 }
            )
        }

        // 3. Vérifier capacité globale (basé sur les tickets vendus, pas les sièges physiques)
        const totalTicketsSold = representation.reservations.reduce((acc, r) => acc + (r.nbPlaces || 0), 0)
        if (totalTicketsSold + nbPlaces > representation.capacite) {
            return NextResponse.json(
                { error: 'Plus assez de places disponibles' },
                { status: 400 }
            )
        }

        const placesOccupeesActuelles = parsePlacesOccupees(representation.placesOccupees)

        let placesAttribuees: string[]

        // 4. Placement manuel ou automatique
        if (sieges && Array.isArray(sieges) && sieges.length > 0) {
            // MODE MANUEL : Valider les sièges fournis
            if (sieges.length !== nbPlaces) {
                return NextResponse.json(
                    { error: `Le nombre de sièges sélectionnés (${sieges.length}) ne correspond pas au nombre de places demandées (${nbPlaces})` },
                    { status: 400 }
                )
            }

            // Vérifier que les sièges ne sont pas déjà occupés
            const siegesOccupes = sieges.filter(s => placesOccupeesActuelles.includes(s))
            if (siegesOccupes.length > 0) {
                return NextResponse.json(
                    { error: `Les sièges suivants sont déjà occupés : ${siegesOccupes.join(', ')}` },
                    { status: 400 }
                )
            }

            placesAttribuees = sieges
        } else {
            // MODE AUTOMATIQUE : Utiliser l'algorithme de placement
            // Utiliser la structure de la représentation (override) s'il y en a une,
            // sinon celle du plan de salle global
            let finalStructure = (representation as any).structure
            if (!finalStructure) {
                const planSalle = representation.association.plansSalle[0]
                if (!planSalle) {
                    return NextResponse.json(
                        { error: 'Configuration de salle manquante' },
                        { status: 500 }
                    )
                }
                finalStructure = planSalle.structure
            }

            const structurePlan = parsePlanStructure(finalStructure)

            const placesAuto = trouverPlaces(
                nbPlaces,
                structurePlan,
                placesOccupeesActuelles,
                requestedNbPmr
            )

            if (!placesAuto) {
                const msg = requestedNbPmr > 0
                    ? 'Impossible de trouver des places contiguës avec accès PMR pour ce groupe. Essayez de réduire le nombre de places ou contactez l\'association.'
                    : 'Impossible de trouver des places contiguës. Essayez avec moins de places ou sélectionnez manuellement.'

                return NextResponse.json(
                    { error: msg },
                    { status: 400 }
                )
            }

            placesAttribuees = placesAuto
        }

        // 5. Créer la réservation et mettre à jour la représentation (Transaction)
        const result = await prisma.$transaction(async (tx) => {
            // Créer réservation
            const reservation = await tx.reservation.create({
                data: {
                    prenom,
                    nom,
                    telephone,
                    email,
                    nbPlaces,
                    sieges: stringifyJsonField(placesAttribuees),
                    statut: 'confirmé',
                    representationId,
                    notes: requestedNbPmr > 0 ? `Réservation avec ${requestedNbPmr} place(s) PMR` : undefined
                }
            })

            // Mettre à jour places occupées
            await tx.representation.update({
                where: { id: representationId },
                data: {
                    placesOccupees: stringifyJsonField([...placesOccupeesActuelles, ...placesAttribuees])
                }
            })

            return reservation
        })

        return NextResponse.json(result, { status: 201 })

    } catch (error) {
        console.error('Reservation error:', error)
        return NextResponse.json(
            { error: 'Erreur serveur lors de la réservation' },
            { status: 500 }
        )
    }
}
