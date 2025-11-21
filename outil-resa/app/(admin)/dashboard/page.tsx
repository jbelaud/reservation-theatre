// app/(admin)/dashboard/page.tsx
export default function DashboardPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Prochaines représentations</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>

                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Réservations en attente</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>

                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Taux de remplissage moyen</h3>
                    <p className="text-3xl font-bold">0%</p>
                </div>
            </div>

            <div className="mt-8">
                <a
                    href="/dashboard/representations"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Gérer mes représentations
                </a>
            </div>
        </div>
    )
}
