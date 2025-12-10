import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto bg-gray-50">
                {children}
            </main>
        </div>
    )
}
