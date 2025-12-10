'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateReservationStatus(id: string, status: string) {
    await prisma.reservation.update({
        where: { id },
        data: { statut: status }
    })
    revalidatePath('/dashboard/reservations')
}
