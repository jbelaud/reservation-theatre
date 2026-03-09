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
                <p>
                    Propulsé par{' '}
                    <a
                        href="https://resavo.fr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors"
                    >
                        Resavo
                    </a>
                    {' '}— Outil de réservation pour associations
                </p>
            </footer>
        </div>
    )
}
