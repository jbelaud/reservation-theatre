'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Accessibility, ArrowLeft } from 'lucide-react'

interface ReservationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    representationId: string
    slug: string
    onReservationSuccess: (reservationId: string) => void
}

export function ReservationModal({ open, onOpenChange, representationId, onReservationSuccess }: ReservationModalProps) {
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
        if (open && representationId) {
            setLoading(true)
            fetch(`/api/representations/${representationId}`)
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
        }
    }, [open, representationId])

    const handleNbPlacesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newNbPlaces = parseInt(e.target.value)
        setFormData(prev => ({
            ...prev,
            nbPlaces: newNbPlaces,
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
                    representationId,
                    prenom: formData.prenom,
                    nom: formData.nom,
                    telephone: formData.telephone,
                    email: formData.email,
                    nbPlaces: formData.nbPlaces,
                    nbPmr: formData.pmr ? formData.nbPmr : 0
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Erreur lors de la réservation')
                setSubmitting(false)
                return
            }

            onOpenChange(false)
            onReservationSuccess(data.id)
        } catch {
            setError('Erreur de connexion au serveur')
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!submitting) {
            onOpenChange(false)
            setFormData({
                prenom: '',
                nom: '',
                telephone: '',
                email: '',
                nbPlaces: 1,
                pmr: false,
                nbPmr: 1
            })
            setError('')
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            disabled={submitting}
                            className="h-8 w-8 p-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <DialogTitle>Réserver vos places</DialogTitle>
                    </div>
                    {loading ? (
                        <DialogDescription>Chargement...</DialogDescription>
                    ) : representation ? (
                        <DialogDescription className="text-sm text-slate-600">
                            <p className="font-medium">{representation.titre}</p>
                            <p>📅 {format(new Date(representation.date), 'EEEE d MMMM yyyy', { locale: fr })} à {representation.heure}</p>
                        </DialogDescription>
                    ) : null}
                </DialogHeader>

                {loading ? (
                    <div className="text-center p-8">Chargement...</div>
                ) : !representation ? (
                    <div className="text-center p-8 text-red-600">Représentation introuvable</div>
                ) : (
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
                                    Nous placerons automatiquement vos sièges côte à côté.
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
                )}
            </DialogContent>
        </Dialog>
    )
}
