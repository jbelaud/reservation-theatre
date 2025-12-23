'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReservationList } from '@/components/reservation-list'
import { ManualReservationModal } from '@/components/manual-reservation-modal'
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

    const [selectedYear, setSelectedYear] = useState<string>('all')
    const [selectedRepresentationId, setSelectedRepresentationId] = useState<string>('all')

    // Extract unique years from representations
    const years = Array.from(new Set(representations.map(r => new Date(r.rawDate).getFullYear().toString()))).sort().reverse()

    const filteredReservations = reservations.filter(reservation => {
        const resDate = new Date(reservation.representationRawDate)

        // Filter by Year
        if (selectedYear !== 'all' && resDate.getFullYear().toString() !== selectedYear) {
            return false
        }

        // Filter by Representation
        if (selectedRepresentationId !== 'all' && reservation.representationId !== selectedRepresentationId) {
            return false
        }

        return true
    })

    // Filter representations for the dropdown based on selected year
    const filteredRepresentationOptions = representations.filter(rep => {
        const repDate = new Date(rep.rawDate)

        if (selectedYear !== 'all' && repDate.getFullYear().toString() !== selectedYear) return false
        return true
    }).sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())

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
                            <SelectItem value="all">Toutes les représentations</SelectItem>
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
                        representations={representations}
                        onSuccess={() => router.refresh()}
                    />
                </div>
            </div>

            <ReservationList
                reservations={filteredReservations}
                showRepresentation={true}
            />
        </div>
    )
}
