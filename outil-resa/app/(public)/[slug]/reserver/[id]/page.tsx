'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function ReservationPage({
    params
}: {
    params: Promise<{ slug: string; id: string }>
}) {
    const { slug, id } = use(params)
    const router = useRouter()

    const [representation, setRepresentation] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        telephone: '',
        email: '',
        nbPlaces: 1
    })

    useEffect(() => {
        fetch(`/api/representations/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error)
                } else {
                    setRepresentation(data)
                }
            })
            .catch(() => setError('Erreur de chargement'))
            .finally(() => setLoading(false))
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    representationId: id,
                    ...formData
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Erreur lors de la réservation')
                return
            }

            router.push(`/${slug}/confirmation/${data.id}`)
        } catch (err) {
            setError('Erreur de connexion au serveur')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="text-center p-8">Chargement...</div>
    if (!representation) return <div className="text-center p-8 text-red-600">Représentation introuvable</div>

    return (
        <div className="max-w-md mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Réserver vos places</CardTitle>
                    <div className="text-sm text-slate-600 mt-2">
                        <p className="font-medium">{representation.titre}</p>
                        <p>📅 {format(new Date(representation.date), 'EEEE d MMMM yyyy', { locale: fr })} à {representation.heure}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="prenom">Prénom</Label>
                                <Input
                                    id="prenom"
                                    value={formData.prenom}
                                    onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="nom">Nom</Label>
                                <Input
                                    id="nom"
                                    value={formData.nom}
                                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="telephone">Téléphone</Label>
                            <Input
                                id="telephone"
                                type="tel"
                                value={formData.telephone}
                                onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                                required
                                placeholder="06 12 34 56 78"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email (optionnel)</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Pour recevoir la confirmation"
                            />
                        </div>

                        <div>
                            <Label htmlFor="nbPlaces">Nombre de places</Label>
                            <select
                                id="nbPlaces"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.nbPlaces}
                                onChange={e => setFormData({ ...formData, nbPlaces: parseInt(e.target.value) })}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                    <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                                Nous placerons automatiquement vos sièges côte à côte.
                            </p>
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? 'Réservation en cours...' : 'Confirmer la réservation'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
