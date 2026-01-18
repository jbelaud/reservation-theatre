'use client'

import { useState, useEffect } from 'react'
import { Loader2, Accessibility } from 'lucide-react'

interface Rangee {
    id: string
    sieges: number
    pmr?: number[]
}

interface SeatingPlanSelectorProps {
    representationId: string
    nbPlaces: number
    onSeatsSelected: (seats: string[]) => void
}

export function SeatingPlanSelector({ representationId, nbPlaces, onSeatsSelected }: SeatingPlanSelectorProps) {
    const [loading, setLoading] = useState(true)
    const [planStructure, setPlanStructure] = useState<{ rangees: Rangee[]; configuration?: string; pmrDouble?: boolean } | null>(null)
    const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
    const [selectedSeats, setSelectedSeats] = useState<string[]>([])

    useEffect(() => {
        fetchData()
    }, [representationId])

    useEffect(() => {
        onSeatsSelected(selectedSeats)
    }, [selectedSeats])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Récupérer le plan de salle
            const planRes = await fetch('/api/plan-salle')
            const planData = await planRes.json()

            // Parser la structure (peut être un String en SQLite ou un Object en Postgres)
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

            // Parser les places occupées (peut être un String en SQLite)
            let placesOccupees = repData.placesOccupees
            if (typeof placesOccupees === 'string') {
                try {
                    placesOccupees = JSON.parse(placesOccupees)
                } catch {
                    placesOccupees = []
                }
            }

            setOccupiedSeats(placesOccupees || [])
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
            // Numérotation française : impairs à gauche, pairs à droite
            // Impairs de droite à gauche (9, 7, 5, 3, 1)
            const odds = []
            for (let i = 1; i <= totalSeats; i += 2) {
                odds.push(i)
            }
            odds.reverse()

            // Pairs de gauche à droite (2, 4, 6, 8, 10)
            const evens = []
            for (let i = 2; i <= totalSeats; i += 2) {
                evens.push(i)
            }

            // Ajouter les impairs
            odds.forEach(num => {
                seats.push({ id: `${rangeeId}${num}`, num, isPmr: pmrSeats?.includes(num) })
            })

            // Allée centrale
            seats.push({ id: 'aisle', num: '|', isAisle: true })

            // Ajouter les pairs
            evens.forEach(num => {
                seats.push({ id: `${rangeeId}${num}`, num, isPmr: pmrSeats?.includes(num) })
            })
        } else {
            // Numérotation standard : 1, 2, 3, 4...
            for (let i = 1; i <= totalSeats; i++) {
                seats.push({ id: `${rangeeId}${i}`, num: i, isPmr: pmrSeats?.includes(i) })
            }
        }

        return seats
    }

    const handleSeatClick = (seatId: string) => {
        if (occupiedSeats.includes(seatId)) return // Siège occupé

        if (selectedSeats.includes(seatId)) {
            // Désélectionner
            setSelectedSeats(selectedSeats.filter(s => s !== seatId))
        } else {
            // Sélectionner (si pas déjà le max)
            if (selectedSeats.length < nbPlaces) {
                setSelectedSeats([...selectedSeats, seatId])
            }
        }
    }

    const getSeatColor = (seatId: string, isPmr?: boolean) => {
        if (selectedSeats.includes(seatId)) return 'bg-blue-500 hover:bg-blue-600'
        if (occupiedSeats.includes(seatId)) return 'bg-red-500 cursor-not-allowed opacity-60'
        if (isPmr) return 'bg-purple-500 hover:bg-purple-600 cursor-pointer'
        return 'bg-green-500 hover:bg-green-600 cursor-pointer'
    }

    const getSeatTitle = (seatId: string, isPmr?: boolean) => {
        if (selectedSeats.includes(seatId)) return `${seatId} - Sélectionné (cliquez pour annuler)`
        if (occupiedSeats.includes(seatId)) return `${seatId} - Occupé`
        if (isPmr) return `${seatId} - Place PMR (cliquez pour sélectionner)`
        return `${seatId} - Libre (cliquez pour sélectionner)`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Chargement du plan...</span>
            </div>
        )
    }

    if (!planStructure) {
        return (
            <div className="text-center py-8 text-red-600">
                Erreur de chargement du plan de salle
            </div>
        )
    }

    const configuration = planStructure.configuration || 'standard'

    return (
        <div className="space-y-4">
            {/* Légende */}
            <div className="flex items-center justify-center gap-6 text-xs bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Libre</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span>PMR</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Occupé</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Sélectionné</span>
                </div>
            </div>

            {/* Compteur */}
            <div className="text-center text-sm font-medium">
                {selectedSeats.length} / {nbPlaces} place{nbPlaces > 1 ? 's' : ''} sélectionnée{selectedSeats.length > 1 ? 's' : ''}
                {selectedSeats.length > 0 && (
                    <span className="ml-2 text-blue-600">
                        ({selectedSeats.sort().join(', ')})
                    </span>
                )}
            </div>

            {/* Plan de salle */}
            <div className="bg-gray-900 text-white p-6 rounded-lg overflow-auto max-h-[400px]">
                {/* Scène */}
                <div className="w-full bg-gray-700 h-8 mb-8 rounded-t-lg flex items-center justify-center text-xs uppercase tracking-widest text-gray-400">
                    Scène
                </div>

                {/* Rangées */}
                <div className="space-y-2">
                    {(!planStructure.rangees || planStructure.rangees.length === 0) ? (
                        <div className="text-center text-gray-400 py-8">
                            Aucune rangée configurée. Veuillez d&apos;abord configurer le plan de salle.
                        </div>
                    ) : planStructure.rangees.map((rangee) => {
                        const seats = generateSeatIds(rangee.id, rangee.sieges, configuration, rangee.pmr)

                        return (
                            <div key={rangee.id} className="flex items-center justify-center gap-2">
                                <span className="text-xs font-mono text-gray-500 w-6 text-right">
                                    {rangee.id}
                                </span>
                                <div className="flex gap-1">
                                    {seats.map((seat, i) => {
                                        if (seat.isAisle) {
                                            // Allée centrale
                                            return (
                                                <div
                                                    key={`aisle-${i}`}
                                                    className="w-3 flex items-center justify-center"
                                                >
                                                    <div className="h-7 w-px bg-gray-600"></div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleSeatClick(seat.id)}
                                                className={`w-7 h-7 rounded-t-md transition-all text-[10px] font-bold text-white flex items-center justify-center relative ${getSeatColor(seat.id, seat.isPmr)}`}
                                                title={getSeatTitle(seat.id, seat.isPmr)}
                                                disabled={occupiedSeats.includes(seat.id)}
                                            >
                                                {seat.num}
                                                {seat.isPmr && (
                                                    <Accessibility className="absolute -top-1 -right-1 h-3 w-3 text-white" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                                <span className="text-xs font-mono text-gray-500 w-6 text-left">
                                    {rangee.id}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Légende pour numérotation française */}
                {configuration === 'french' && (
                    <div className="mt-6 text-xs text-gray-400 text-center">
                        <p>← Impairs (gauche) | Allée | Pairs (droite) →</p>
                    </div>
                )}
            </div>

            {/* Message d'aide */}
            {selectedSeats.length < nbPlaces && (
                <div className="text-center text-sm text-gray-500">
                    💡 Sélectionnez encore {nbPlaces - selectedSeats.length} siège{nbPlaces - selectedSeats.length > 1 ? 's' : ''}
                </div>
            )}
            {selectedSeats.length === nbPlaces && (
                <div className="text-center text-sm text-green-600 font-medium">
                    ✓ Tous les sièges sont sélectionnés
                </div>
            )}
        </div>
    )
}
