'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReservationList } from '@/components/reservation-list'
import { ManualReservationModal } from '@/components/manual-reservation-modal'
import { SeatingPlanViewer } from '@/components/seating-plan-viewer'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export function ReservationsClient({
    reservations,
    representations
}: {
    reservations: any[]
    representations: any[]
}) {
    const router = useRouter()

    // Trouver la représentation à venir la plus proche (ou la plus récente si aucune à venir)
    const now = new Date()
    const upcomingReps = representations
        .filter(r => new Date(r.rawDate) >= now)
        .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
    
    const defaultRepId = upcomingReps.length > 0 
        ? upcomingReps[0].id 
        : (representations.length > 0 ? representations[0].id : '')

    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
    const [selectedRepresentationId, setSelectedRepresentationId] = useState<string>(defaultRepId)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Extract unique years from representations
    const years = Array.from(new Set(representations.map(r => new Date(r.rawDate).getFullYear().toString()))).sort().reverse()

    const filteredReservations = reservations
        .filter(reservation => {
            const resDate = new Date(reservation.representationRawDate)

            // Filter by Year
            if (selectedYear !== 'all' && resDate.getFullYear().toString() !== selectedYear) {
                return false
            }

            // Filter by Representation
            if (reservation.representationId !== selectedRepresentationId) {
                return false
            }

            return true
        })
        .sort((a, b) => new Date(a.representationRawDate).getTime() - new Date(b.representationRawDate).getTime())

    // Filter representations for the dropdown based on selected year
    const filteredRepresentationOptions = representations.filter(rep => {
        const repDate = new Date(rep.rawDate)

        if (selectedYear !== 'all' && repDate.getFullYear().toString() !== selectedYear) return false
        return true
    }).sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())

    const handleReservationSuccess = () => {
        router.refresh()
        setRefreshTrigger(prev => prev + 1)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row justify-between gap-4">
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Filter by Year */}
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Année" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les années</SelectItem>
                            {years.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Filter by Representation */}
                    <Select value={selectedRepresentationId} onValueChange={setSelectedRepresentationId}>
                        <SelectTrigger className="w-[350px]">
                            <SelectValue placeholder="Représentation" />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredRepresentationOptions.map(rep => (
                                <SelectItem key={rep.id} value={rep.id}>
                                    {rep.titre} - {rep.date} {rep.heure}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end">
                    <ManualReservationModal
                        representationId={selectedRepresentationId}
                        representations={representations}
                        onSuccess={handleReservationSuccess}
                    />
                </div>
            </div>

            {/* Layout 2/3 + 1/3 */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ReservationList
                        reservations={filteredReservations}
                        showRepresentation={false}
                        onRefresh={handleReservationSuccess}
                    />
                </div>

                {selectedRepresentationId && (
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <div className="bg-white rounded-lg border p-4">
                                <h3 className="text-lg font-semibold mb-4">Plan de salle</h3>
                                <SeatingPlanViewer
                                    representationId={selectedRepresentationId}
                                    refreshTrigger={refreshTrigger}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
