'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Accessibility } from 'lucide-react'

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
        nbPlaces: 1,
        pmr: false,
        nbPmr: 1
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

    const handleNbPlacesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newNbPlaces = parseInt(e.target.value)
        setFormData(prev => ({
            ...prev,
            nbPlaces: newNbPlaces,
            // Si le nombre de places PMR était supérieur au nouveau total, on le réduit
            nbPmr: prev.nbPmr > newNbPlaces ? newNbPlaces : prev.nbPmr
        }))
    }

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
                    prenom: formData.prenom,
                    nom: formData.nom,
                    telephone: formData.telephone,
                    email: formData.email,
                    nbPlaces: formData.nbPlaces,
                    // Si PMR coché, on envoie le nombre spécifique, sinon 0
                    nbPmr: formData.pmr ? formData.nbPmr : 0
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Erreur lors de la réservation')
                setSubmitting(false)
                return
            }

            router.push(`/${slug}/confirmation/${data.id}`)
        } catch (err) {
            setError('Erreur de connexion au serveur')
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
                            <Label htmlFor="nbPlaces">Nombre total de places</Label>
                            <select
                                id="nbPlaces"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.nbPlaces}
                                onChange={handleNbPlacesChange}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                    <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-4 flex flex-col space-y-3 bg-slate-50 p-4 rounded-lg border">
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="pmr"
                                    checked={formData.pmr}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pmr: checked as boolean }))}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="pmr" className="text-sm font-medium leading-none flex items-center gap-2 cursor-pointer">
                                        <Accessibility className="h-4 w-4" />
                                        Besoin d'un accès PMR / Fauteuil
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Cochez si le groupe contient des personnes en situation de handicap.
                                    </p>
                                </div>
                            </div>

                            {formData.pmr && (
                                <div className="ml-6 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <Label htmlFor="nbPmr" className="text-xs font-semibold text-slate-700 block mb-1">
                                        Combien de places PMR ("Fauteuil") ?
                                    </Label>
                                    <select
                                        id="nbPmr"
                                        className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={formData.nbPmr}
                                        onChange={e => setFormData(prev => ({ ...prev, nbPmr: parseInt(e.target.value) }))}
                                    >
                                        {Array.from({ length: formData.nbPlaces }, (_, i) => i + 1).map(n => (
                                            <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-purple-700 mt-2 font-medium">
                                        ♿ Nous trouverons {formData.nbPmr} place{formData.nbPmr > 1 ? 's' : ''} accessible{formData.nbPmr > 1 ? 's' : ''} et {formData.nbPlaces - formData.nbPmr} place{formData.nbPlaces - formData.nbPmr > 1 ? 's' : ''} accompagnant{formData.nbPlaces - formData.nbPmr > 1 ? 's' : ''} à côté.
                                    </p>
                                </div>
                            )}

                            {!formData.pmr && (
                                <p className="text-xs text-slate-500">
                                    Nous placerons automatiquement vos sièges côte à côte.
                                </p>
                            )}
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
