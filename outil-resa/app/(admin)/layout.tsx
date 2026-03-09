import { Sidebar } from '@/components/admin/sidebar'
import { DashboardHeader } from '@/components/admin/dashboard-header'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth-edge'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

// Cache le nom de l'association pour 5 minutes
const getCachedAssociationName = unstable_cache(
    async (associationId: string) => {
        const association = await prisma.association.findUnique({
            where: { id: associationId },
            select: { nom: true }
        })
        return association?.nom || 'Théâtre'
    },
    ['association-name'],
    { revalidate: 300, tags: ['association'] } // Cache 5 minutes
)

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
            associationName = await getCachedAssociationName(payload.associationId)
        }
    }

    return (
        <div className="flex h-screen bg-gray-50/30">
            <Sidebar associationName={associationName} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-end px-8 z-10 shrink-0">
                    <DashboardHeader associationName={associationName} />
                </header>
                <main className="flex-1 overflow-y-auto">
                    <div className="h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

