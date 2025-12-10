import { Sidebar } from '@/components/admin/sidebar'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth-edge'
import { prisma } from '@/lib/prisma'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let associationName = 'Théâtre'

    if (token) {
        const payload = await verifyToken(token)
        if (payload) {
            const association = await prisma.association.findUnique({
                where: { id: payload.associationId },
                select: { nom: true }
            })
            if (association) {
                associationName = association.nom
            }
        }
    }

    return (
        <div className="flex h-screen bg-gray-50/30">
            <Sidebar associationName={associationName} />
            <main className="flex-1 overflow-y-auto">
                <div className="h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
