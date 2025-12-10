// app/(admin)/dashboard/representations/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, Users, Percent } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { RepresentationForm } from '@/components/representation-form'
import { ReservationList } from '@/components/reservation-list'
import { ManualReservationModal } from '@/components/manual-reservation-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Representation {
    id: string
    titre: string
    date: string
    heure: string
    capacite: number
    description?: string
    placesRestantes: number
    tauxRemplissage: number
    nbReservations: number
    reservations?: any[]
}

export default function RepresentationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const router = useRouter()
    const [representationId, setRepresentationId] = useState<string | null>(null)
    const [representation, setRepresentation] = useState<Representation | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        params.then(({ id }) => {
            setRepresentationId(id)
        })
    }, [params])

    useEffect(() => {
        if (representationId) {
            fetchRepresentation()
        }
    }, [representationId])

    const fetchRepresentation = async () => {
        if (!representationId) return

        try {
            setLoading(true)
            const response = await fetch(`/api/representations/${representationId}`)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Erreur lors du chargement')
            }

            const data = await response.json()
            setRepresentation(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (data: any) => {
        if (!representationId) return

        try {
            const response = await fetch(`/api/representations/${representationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    titre: data.titre,
                    date: data.date.toISOString(),
                    heure: data.heure,
                    capacite: data.capacite,
                    description: data.description,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erreur lors de la mise à jour')
            }

            // Rafraîchir les données
            await fetchRepresentation()
            setIsEditing(false)
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Une erreur est survenue')
            throw error
        }
    }

    const handleCancel = () => {
        if (isEditing) {
            setIsEditing(false)
        } else {
            router.push('/dashboard/representations')
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/reservations/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statut: newStatus }),
            })

            if (!response.ok) throw new Error('Erreur lors de la mise à jour')

            // Rafraîchir
            await fetchRepresentation()
        } catch (error) {
            console.error(error)
            alert('Impossible de mettre à jour le statut')
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-500">Chargement...</p>
                </div>
            </div>
        )
    }

    if (error || !representation) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error || 'Représentation non trouvée'}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/representations')}
                className="mb-6"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
            </Button>

            {!isEditing ? (
                <>
                    {/* En-tête */}
                    <div className="bg-white rounded-lg border p-8 mb-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{representation.titre}</h1>
                                <p className="text-gray-600">
                                    {format(new Date(representation.date), 'PPP', { locale: fr })} à{' '}
                                    {representation.heure}
                                </p>
                            </div>
                            <Button onClick={() => setIsEditing(true)}>
                                Modifier
                            </Button>
                        </div>

                        {representation.description && (
                            <p className="text-gray-700 mb-6">{representation.description}</p>
                        )}

                        {/* Statistiques */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Capacité totale
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{representation.capacite}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Places restantes
                                    </CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {representation.placesRestantes}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Réservations
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {representation.nbReservations}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Taux de remplissage
                                    </CardTitle>
                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {representation.tauxRemplissage}%
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Section réservations */}
                    <div className="bg-white rounded-lg border p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Réservations</h2>
                            <ManualReservationModal
                                representationId={representation.id}
                                onSuccess={fetchRepresentation}
                            />
                        </div>

                        <ReservationList
                            reservations={representation.reservations || []}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-lg border p-8">
                    <h1 className="text-3xl font-bold mb-2">Modifier la représentation</h1>
                    <p className="text-gray-600 mb-8">
                        Mettez à jour les informations de la représentation
                    </p>

                    <RepresentationForm
                        initialData={{
                            titre: representation.titre,
                            date: representation.date,
                            heure: representation.heure,
                            capacite: representation.capacite,
                            description: representation.description,
                        }}
                        onSubmit={handleUpdate}
                        onCancel={handleCancel}
                        submitLabel="Enregistrer les modifications"
                    />
                </div>
            )}
        </div>
    )
}
