import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trouverPlaces } from '@/lib/placement'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { representationId, prenom, nom, telephone, email, nbPlaces, sieges, pmr } = body

        // 1. Validation basique
        if (!representationId || !prenom || !nom || !telephone || !nbPlaces) {
            return NextResponse.json(
                { error: 'Tous les champs obligatoires doivent être remplis' },
                { status: 400 }
            )
        }

        if (nbPlaces < 1 || nbPlaces > 10) {
            return NextResponse.json(
                { error: 'Le nombre de places doit être compris entre 1 et 10' },
                { status: 400 }
            )
        }

        // 2. Récupérer la représentation et son plan
        const representation = await prisma.representation.findUnique({
            where: { id: representationId },
            include: {
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

        // 3. Vérifier capacité globale
        const placesOccupeesActuelles = (representation.placesOccupees as string[]) || []
        if (placesOccupeesActuelles.length + nbPlaces > representation.capacite) {
            return NextResponse.json(
                { error: 'Plus assez de places disponibles' },
                { status: 400 }
            )
        }

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
            const planSalle = representation.association.plansSalle[0]

            if (!planSalle) {
                return NextResponse.json(
                    { error: 'Configuration de salle manquante' },
                    { status: 500 }
                )
            }

            const structurePlan = planSalle.structure as any

            const placesAuto = trouverPlaces(
                nbPlaces,
                structurePlan,
                placesOccupeesActuelles,
                pmr || false // Activer le mode PMR si demandé
            )

            if (!placesAuto) {
                const msg = pmr
                    ? 'Aucune place PMR disponible pour ce nombre de personnes. Essayez de réduire le nombre ou contacter l\'association.'
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
                    sieges: placesAttribuees,
                    statut: 'confirmé',
                    representationId,
                    // Note: on pourrait stocker le faite que c'est une résa PMR dans 'notes' ou un nouveau champ
                    notes: pmr ? 'Réservation PMR' : undefined
                }
            })

            // Mettre à jour places occupées
            await tx.representation.update({
                where: { id: representationId },
                data: {
                    placesOccupees: [...placesOccupeesActuelles, ...placesAttribuees]
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
