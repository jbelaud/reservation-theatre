'use client'

import { ReservationList } from '@/components/reservation-list'
import { ManualReservationModal } from '@/components/manual-reservation-modal'
import { updateReservationStatus } from './actions'
import { useRouter } from 'next/navigation'

export function ReservationsClient({
    reservations,
    representations
}: {
    reservations: any[]
    representations: any[]
}) {
    const router = useRouter()

    const handleStatusChange = async (id: string, newStatus: string) => {
        await updateReservationStatus(id, newStatus)
        router.refresh()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <ManualReservationModal
                    representations={representations}
                    onSuccess={() => router.refresh()}
                />
            </div>

            <ReservationList
                reservations={reservations}
                onStatusChange={handleStatusChange}
                showRepresentation={true}
            />
        </div>
    )
}
