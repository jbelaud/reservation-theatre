'use client'

import { useState, useEffect } from 'react'
import { Loader2, Accessibility } from 'lucide-react'

interface Rangee {
    id: string
    sieges: number
    pmr?: number[]
}

interface SeatingPlanEditSelectorProps {
    representationId: string
    currentSeats: string[] // Sièges actuels de la réservation (affichés en orange)
    onSeatsSelected: (seats: string[]) => void
}

export function SeatingPlanEditSelector({ 
    representationId, 
    currentSeats,
    onSeatsSelected 
}: SeatingPlanEditSelectorProps) {
    const [loading, setLoading] = useState(true)
    const [planStructure, setPlanStructure] = useState<{ rangees: Rangee[]; configuration?: string; pmrDouble?: boolean } | null>(null)
    const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
    const [selectedSeats, setSelectedSeats] = useState<string[]>(currentSeats)

    useEffect(() => {
        fetchData()
    }, [representationId])

    useEffect(() => {
        // Initialiser avec les sièges actuels
        setSelectedSeats(currentSeats)
    }, [currentSeats])

    useEffect(() => {
        onSeatsSelected(selectedSeats)
    }, [selectedSeats, onSeatsSelected])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Récupérer le plan de salle
            const planRes = await fetch('/api/plan-salle')
            const planData = await planRes.json()

            // Parser la structure
            let structure = planData.structure
            if (typeof structure === 'string') {
                try {
                    structure = JSON.parse(structure)
                } catch {
                    structure = { rangees: [] }
                }
            }

            setPlanStructure({
                rangees: structure?.rangees || [],
                configuration: structure?.configuration || planData.configuration || 'standard',
                pmrDouble: structure?.pmrDouble || false
            })

            // Récupérer la représentation pour les places occupées
            const repRes = await fetch(`/api/representations/${representationId}`)
            const repData = await repRes.json()

            // Parser les places occupées
            let placesOccupees = repData.placesOccupees
            if (typeof placesOccupees === 'string') {
                try {
                    placesOccupees = JSON.parse(placesOccupees)
                } catch {
                    placesOccupees = []
                }
            }

            // Exclure les sièges actuels de la réservation des places occupées
            // (car ils sont modifiables)
            const otherOccupied = (placesOccupees || []).filter(
                (s: string) => !currentSeats.includes(s)
            )
            setOccupiedSeats(otherOccupied)
        } catch (error) {
            console.error('Erreur chargement plan:', error)
        } finally {
            setLoading(false)
        }
    }

    // Générer les IDs de sièges selon la configuration
    const generateSeatIds = (rangeeId: string, totalSeats: number, configuration: string, pmrSeats?: number[]) => {
        const seats: Array<{ id: string; num: number | string; isAisle?: boolean; isPmr?: boolean }> = []

        if (configuration === 'french') {
            const odds = []
            for (let i = 1; i <= totalSeats; i += 2) {
                odds.push(i)
            }
            odds.reverse()

            const evens = []
            for (let i = 2; i <= totalSeats; i += 2) {
                evens.push(i)
            }

            odds.forEach(num => {
                seats.push({ id: `${rangeeId}${num}`, num, isPmr: pmrSeats?.includes(num) })
            })

            seats.push({ id: 'aisle', num: '|', isAisle: true })

            evens.forEach(num => {
                seats.push({ id: `${rangeeId}${num}`, num, isPmr: pmrSeats?.includes(num) })
            })
        } else {
            for (let i = 1; i <= totalSeats; i++) {
                seats.push({ id: `${rangeeId}${i}`, num: i, isPmr: pmrSeats?.includes(i) })
            }
        }

        return seats
    }

    const handleSeatClick = (seatId: string) => {
        if (occupiedSeats.includes(seatId)) return // Siège occupé par une autre réservation

        if (selectedSeats.includes(seatId)) {
            // Désélectionner
            setSelectedSeats(selectedSeats.filter(s => s !== seatId))
        } else {
            // Sélectionner
            setSelectedSeats([...selectedSeats, seatId])
        }
    }

    const getSeatColor = (seatId: string, isPmr?: boolean) => {
        const isCurrentSeat = currentSeats.includes(seatId)
        const isSelected = selectedSeats.includes(seatId)
        
        if (isSelected && isCurrentSeat) {
            // Siège actuel de la réservation, toujours sélectionné (orange)
            return 'bg-orange-500 hover:bg-orange-600 cursor-pointer ring-2 ring-orange-300'
        }
        if (isSelected && !isCurrentSeat) {
            // Nouveau siège ajouté (bleu)
            return 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
        }
        if (!isSelected && isCurrentSeat) {
            // Siège actuel désélectionné (orange barré)
            return 'bg-orange-300 hover:bg-orange-400 cursor-pointer opacity-50 line-through'
        }
        if (occupiedSeats.includes(seatId)) {
            return 'bg-red-500 cursor-not-allowed opacity-60'
        }
        if (isPmr) {
            return 'bg-purple-500 hover:bg-purple-600 cursor-pointer'
        }
        return 'bg-green-500 hover:bg-green-600 cursor-pointer'
    }

    const getSeatTitle = (seatId: string, isPmr?: boolean) => {
        const isCurrentSeat = currentSeats.includes(seatId)
        const isSelected = selectedSeats.includes(seatId)
        
        if (isSelected && isCurrentSeat) {
            return `${seatId} - Place actuelle (cliquez pour retirer)`
        }
        if (isSelected && !isCurrentSeat) {
            return `${seatId} - Nouvelle place (cliquez pour retirer)`
        }
        if (!isSelected && isCurrentSeat) {
            return `${seatId} - Place retirée (cliquez pour remettre)`
        }
        if (occupiedSeats.includes(seatId)) {
            return `${seatId} - Occupé par une autre réservation`
        }
        if (isPmr) {
            return `${seatId} - Place PMR libre (cliquez pour ajouter)`
        }
        return `${seatId} - Libre (cliquez pour ajouter)`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Chargement du plan...</span>
            </div>
        )
    }

    if (!planStructure) {
        return (
            <div className="text-center py-4 text-red-600 text-sm">
                Erreur de chargement du plan de salle
            </div>
        )
    }

    const configuration = planStructure.configuration || 'standard'
    const addedSeats = selectedSeats.filter(s => !currentSeats.includes(s))
    const removedSeats = currentSeats.filter(s => !selectedSeats.includes(s))

    return (
        <div className="space-y-3">
            {/* Légende */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-500 rounded ring-2 ring-orange-300"></div>
                    <span>Actuel</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Ajouté</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Libre</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Occupé</span>
                </div>
            </div>

            {/* Résumé des modifications */}
            <div className="text-center text-sm">
                <span className="font-medium">{selectedSeats.length} place{selectedSeats.length > 1 ? 's' : ''}</span>
                {addedSeats.length > 0 && (
                    <span className="ml-2 text-blue-600">
                        (+{addedSeats.length} ajoutée{addedSeats.length > 1 ? 's' : ''})
                    </span>
                )}
                {removedSeats.length > 0 && (
                    <span className="ml-2 text-red-600">
                        (-{removedSeats.length} retirée{removedSeats.length > 1 ? 's' : ''})
                    </span>
                )}
            </div>

            {/* Plan de salle */}
            <div className="bg-gray-900 text-white p-4 rounded-lg overflow-auto max-h-[300px]">
                {/* Scène */}
                <div className="w-full bg-gray-700 h-6 mb-4 rounded-t-lg flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-400">
                    Scène
                </div>

                {/* Rangées */}
                <div className="space-y-1">
                    {(!planStructure.rangees || planStructure.rangees.length === 0) ? (
                        <div className="text-center text-gray-400 py-4 text-sm">
                            Aucune rangée configurée
                        </div>
                    ) : planStructure.rangees.map((rangee) => {
                        const seats = generateSeatIds(rangee.id, rangee.sieges, configuration, rangee.pmr)

                        return (
                            <div key={rangee.id} className="flex items-center justify-center gap-1">
                                <span className="text-[10px] font-mono text-gray-500 w-4 text-right">
                                    {rangee.id}
                                </span>
                                <div className="flex gap-0.5">
                                    {seats.map((seat, i) => {
                                        if (seat.isAisle) {
                                            return (
                                                <div
                                                    key={`aisle-${i}`}
                                                    className="w-2 flex items-center justify-center"
                                                >
                                                    <div className="h-5 w-px bg-gray-600"></div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleSeatClick(seat.id)}
                                                className={`w-5 h-5 rounded-t-sm transition-all text-[8px] font-bold text-white flex items-center justify-center relative ${getSeatColor(seat.id, seat.isPmr)}`}
                                                title={getSeatTitle(seat.id, seat.isPmr)}
                                                disabled={occupiedSeats.includes(seat.id)}
                                            >
                                                {seat.num}
                                                {seat.isPmr && (
                                                    <Accessibility className="absolute -top-0.5 -right-0.5 h-2 w-2 text-white" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                                <span className="text-[10px] font-mono text-gray-500 w-4 text-left">
                                    {rangee.id}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Liste des sièges sélectionnés */}
            {selectedSeats.length > 0 && (
                <div className="text-xs text-center text-gray-600">
                    Sièges : <span className="font-medium">{selectedSeats.sort().join(', ')}</span>
                </div>
            )}

            {/* Avertissement si aucun siège */}
            {selectedSeats.length === 0 && (
                <div className="text-center text-sm text-red-600 font-medium">
                    ⚠️ Veuillez sélectionner au moins un siège
                </div>
            )}
        </div>
    )
}
