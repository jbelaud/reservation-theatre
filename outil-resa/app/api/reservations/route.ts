import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { trouverPlaces } from '@/lib/placement'
import { parsePlacesOccupees, parsePlanStructure, stringifyJsonField } from '@/lib/json-helpers'

// Schéma de validation pour les réservations
const reservationSchema = z.object({
    representationId: z.string().min(1, 'ID de représentation requis'),
    prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    telephone: z.string().regex(
        /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/,
        'Numéro de téléphone français invalide (ex: 0612345678 ou +33612345678)'
    ),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    nbPlaces: z.number().int().min(1, 'Au moins 1 place').max(10, 'Maximum 10 places par réservation'),
    sieges: z.array(z.string()).optional(),
    pmr: z.boolean().optional(),
    nbPmr: z.number().int().min(0).optional()
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        
        // Validation avec Zod
        const validation = reservationSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { 
                    error: 'Données invalides', 
                    details: validation.error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                },
                { status: 400 }
            )
        }

        const { representationId, prenom, nom, telephone, email, nbPlaces, sieges, pmr, nbPmr } = validation.data

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

            // Récupérer la structure pour savoir lesquels sont PMR et si on doit doubler
            let finalStructureForManual = (representation as any).structure
            if (!finalStructureForManual) {
                finalStructureForManual = representation.association.plansSalle[0]?.structure
            }
            const structurePlanForManual = parsePlanStructure(finalStructureForManual)

            let placesAOccuperPhysiquement = [...sieges]

            // Si PMR double est actif, on doit bloquer le voisin de chaque siège PMR choisi
            if (structurePlanForManual.pmrDouble) {
                const nouvellesPlaces: string[] = []
                for (const seatId of sieges) {
                    // Extraire rangée et numéro (ex: "A12" -> "A", 12)
                    const match = seatId.match(/^([A-Z]+)(\d+)$/)
                    if (match) {
                        const rowId = match[1]
                        const seatNum = parseInt(match[2])
                        const row = structurePlanForManual.rangees.find(r => r.id === rowId)

                        if (row && row.pmr?.includes(seatNum)) {
                            // C'est une place PMR ! On ajoute le voisin direct
                            // En configuration française, les sièges sont 1,3,5 ou 2,4,6 donc le voisin est à +2
                            const step = structurePlanForManual.configuration === 'french' ? 2 : 1
                            const neighborNum = seatNum + step

                            // On vérifie que le voisin existe physiquement dans la rangée
                            if (neighborNum <= row.sieges) {
                                const neighborId = `${rowId}${neighborNum}`
                                if (!nouvellesPlaces.includes(neighborId) && !sieges.includes(neighborId)) {
                                    nouvellesPlaces.push(neighborId)
                                }
                            }
                        }
                    }
                }
                placesAOccuperPhysiquement = [...sieges, ...nouvellesPlaces]
            }

            // Vérifier que les sièges (y compris les voisins PMR) ne sont pas déjà occupés
            const siegesOccupes = placesAOccuperPhysiquement.filter(s => placesOccupeesActuelles.includes(s))
            if (siegesOccupes.length > 0) {
                return NextResponse.json(
                    { error: `Certains sièges (ou leur espace PMR nécessaire) sont déjà occupés : ${siegesOccupes.join(', ')}` },
                    { status: 400 }
                )
            }

            placesAttribuees = placesAOccuperPhysiquement
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

        // 5. Identifier les sièges PMR dans les places attribuées
        let finalStructureForPmr = (representation as any).structure
        if (!finalStructureForPmr) {
            finalStructureForPmr = representation.association.plansSalle[0]?.structure
        }
        const structurePlanForPmr = parsePlanStructure(finalStructureForPmr)

        // Récupérer les places PMR actuelles
        let placesPmrActuelles = []
        if (typeof representation.placesPmr === 'string') {
            try {
                placesPmrActuelles = JSON.parse(representation.placesPmr)
            } catch {
                placesPmrActuelles = []
            }
        } else if (Array.isArray(representation.placesPmr)) {
            placesPmrActuelles = representation.placesPmr
        }

        // Identifier les sièges PMR dans les places attribuées
        const nouveauxSiegesPmr: string[] = []
        for (const seatId of placesAttribuees) {
            const match = seatId.match(/^([A-Z]+)(\d+)$/)
            if (match) {
                const rowId = match[1]
                const seatNum = parseInt(match[2])
                const row = structurePlanForPmr.rangees.find(r => r.id === rowId)
                
                if (row && row.pmr?.includes(seatNum)) {
                    nouveauxSiegesPmr.push(seatId)
                }
            }
        }

        // 6. Créer la réservation et mettre à jour la représentation (Transaction)
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

            // Mettre à jour places occupées ET places PMR
            await tx.representation.update({
                where: { id: representationId },
                data: {
                    placesOccupees: stringifyJsonField([...placesOccupeesActuelles, ...placesAttribuees]),
                    placesPmr: stringifyJsonField([...placesPmrActuelles, ...nouveauxSiegesPmr])
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
