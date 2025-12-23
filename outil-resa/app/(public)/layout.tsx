export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
            <footer className="text-center py-6 text-slate-500 text-sm">
                <p>Propulsé par Resavo - Outil de réservation pour associations</p>
            </footer>
        </div>
    )
}
