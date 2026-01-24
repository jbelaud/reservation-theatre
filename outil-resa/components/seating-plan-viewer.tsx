'use client'

import { useState, useEffect } from 'react'
import { Loader2, Accessibility, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Rangee {
    id: string
    sieges: number
    pmr?: number[]
}

interface SeatingPlanViewerProps {
    representationId: string
    refreshTrigger?: number
}

export function SeatingPlanViewer({ representationId, refreshTrigger }: SeatingPlanViewerProps) {
    const [loading, setLoading] = useState(true)
    const [planStructure, setPlanStructure] = useState<{ rangees: Rangee[]; configuration?: string; pmrDouble?: boolean } | null>(null)
    const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
    const [pmrSeats, setPmrSeats] = useState<string[]>([])
    const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 })

    useEffect(() => {
        fetchData()
    }, [representationId, refreshTrigger])

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

            // Parser les places PMR réservées
            let placesPmr = repData.placesPmr
            if (typeof placesPmr === 'string') {
                try {
                    placesPmr = JSON.parse(placesPmr)
                } catch {
                    placesPmr = []
                }
            }

            setOccupiedSeats(placesOccupees || [])
            setPmrSeats(placesPmr || [])

            // Calculer les stats
            const totalSeats = structure?.rangees?.reduce((acc: number, r: Rangee) => acc + r.sieges, 0) || 0
            const occupiedCount = (placesOccupees || []).length
            setStats({
                total: totalSeats,
                occupied: occupiedCount,
                available: totalSeats - occupiedCount
            })
        } catch (error) {
            console.error('Erreur chargement plan:', error)
        } finally {
            setLoading(false)
        }
    }

    // Générer les IDs de sièges selon la configuration
    const generateSeatIds = (rangeeId: string, totalSeats: number, configuration: string, pmrSeatsInRow?: number[]) => {
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
                seats.push({ id: `${rangeeId}${num}`, num, isPmr: pmrSeatsInRow?.includes(num) })
            })

            seats.push({ id: 'aisle', num: '|', isAisle: true })

            evens.forEach(num => {
                seats.push({ id: `${rangeeId}${num}`, num, isPmr: pmrSeatsInRow?.includes(num) })
            })
        } else {
            for (let i = 1; i <= totalSeats; i++) {
                seats.push({ id: `${rangeeId}${i}`, num: i, isPmr: pmrSeatsInRow?.includes(i) })
            }
        }

        return seats
    }

    const getSeatColor = (seatId: string, isPmrSeat?: boolean) => {
        const isOccupied = occupiedSeats.includes(seatId)
        const isPmrReserved = pmrSeats.includes(seatId)

        if (isOccupied) {
            if (isPmrReserved) return 'bg-purple-600' // PMR réservé
            return 'bg-red-500' // Occupé normal
        }
        if (isPmrSeat) return 'bg-purple-400' // PMR disponible
        return 'bg-green-500' // Libre
    }

    const getSeatTitle = (seatId: string, isPmrSeat?: boolean) => {
        const isOccupied = occupiedSeats.includes(seatId)
        const isPmrReserved = pmrSeats.includes(seatId)

        if (isOccupied) {
            if (isPmrReserved) return `${seatId} - PMR réservé`
            return `${seatId} - Occupé`
        }
        if (isPmrSeat) return `${seatId} - PMR disponible`
        return `${seatId} - Libre`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Chargement du plan...</span>
            </div>
        )
    }

    if (!planStructure || !planStructure.rangees || planStructure.rangees.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Aucun plan de salle configuré
            </div>
        )
    }

    const configuration = planStructure.configuration || 'standard'

    return (
        <div className="space-y-4">
            {/* En-tête avec stats et bouton refresh */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Libre ({stats.available})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Occupé ({stats.occupied})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span>PMR</span>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchData} className="text-gray-500">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Actualiser
                </Button>
            </div>

            {/* Plan de salle */}
            <div className="bg-gray-900 text-white p-6 rounded-lg overflow-auto">
                {/* Scène */}
                <div className="w-full bg-gray-700 h-8 mb-8 rounded-t-lg flex items-center justify-center text-xs uppercase tracking-widest text-gray-400">
                    Scène
                </div>

                {/* Rangées */}
                <div className="space-y-2">
                    {planStructure.rangees.map((rangee) => {
                        const seats = generateSeatIds(rangee.id, rangee.sieges, configuration, rangee.pmr)

                        return (
                            <div key={rangee.id} className="flex items-center justify-center gap-2">
                                <span className="text-xs font-mono text-gray-500 w-6 text-right">
                                    {rangee.id}
                                </span>
                                <div className="flex gap-1">
                                    {seats.map((seat, i) => {
                                        if (seat.isAisle) {
                                            return (
                                                <div
                                                    key={`aisle-${i}`}
                                                    className="w-3 flex items-center justify-center"
                                                >
                                                    <div className="h-6 w-px bg-gray-600"></div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <div
                                                key={i}
                                                className={`w-6 h-6 rounded-t-md text-[10px] font-bold text-white flex items-center justify-center relative ${getSeatColor(seat.id, seat.isPmr)}`}
                                                title={getSeatTitle(seat.id, seat.isPmr)}
                                            >
                                                {seat.isPmr ? <Accessibility className="h-3 w-3" /> : seat.num}
                                            </div>
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
        </div>
    )
}
