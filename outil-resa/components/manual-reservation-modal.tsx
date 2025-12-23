'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Plus, HelpCircle, Accessibility } from 'lucide-react'
import { SeatingPlanSelector } from '@/components/seating-plan-selector'
import { useToast } from '@/components/ui/use-toast'

interface RepresentationOption {
    id: string
    titre: string
    date: string
    heure: string
}

interface ManualReservationModalProps {
    representationId?: string
    representations?: RepresentationOption[]
    onSuccess: () => void
}

export function ManualReservationModal({ representationId, representations, onSuccess }: ManualReservationModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectedRepresentationId, setSelectedRepresentationId] = useState(representationId || '')
    const [manualSelection, setManualSelection] = useState(false)
    const [selectedSeats, setSelectedSeats] = useState<string[]>([])
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        telephone: '',
        email: '',
        nbPlaces: 1,
        pmr: false
    })

    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const targetRepresentationId = representationId || selectedRepresentationId

        if (!targetRepresentationId) {
            setError('Veuillez sélectionner une représentation')
            setLoading(false)
            return
        }

        // Validation : si mode manuel, vérifier que le bon nombre de sièges est sélectionné
        if (manualSelection && selectedSeats.length !== formData.nbPlaces) {
            setError(`Veuillez sélectionner exactement ${formData.nbPlaces} siège${formData.nbPlaces > 1 ? 's' : ''}`)
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    representationId: targetRepresentationId,
                    ...formData,
                    // Si mode manuel, envoyer les sièges sélectionnés
                    ...(manualSelection && { sieges: selectedSeats }),
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                // Gestion spécifique pour PMR ou Erreur placement auto
                // Si erreur liée au placement (PMR ou juste pas de place contiguë) et qu'on n'est pas déjà en manuel
                if (!manualSelection && data.error && (data.error.includes('PMR') || data.error.includes('places contiguës') || data.error.includes('Impossible'))) {
                    setError('Placement automatique impossible. Veuillez sélectionner les sièges manuellement sur le plan.')
                    setManualSelection(true) // Basculer automatiquement en manuel
                    setLoading(false)
                    return
                }

                setError(data.error || 'Erreur lors de la réservation')
                return
            }

            toast({
                title: "Réservation ajoutée",
                description: "La réservation a été créée avec succès.",
            })

            setOpen(false)
            setFormData({
                prenom: '',
                nom: '',
                telephone: '',
                email: '',
                nbPlaces: 1,
                pmr: false
            })
            setManualSelection(false)
            setSelectedSeats([])
            if (!representationId) setSelectedRepresentationId('')
            onSuccess()
        } catch (err) {
            setError('Erreur de connexion au serveur')
            toast({
                title: "Erreur",
                description: "Erreur de connexion au serveur",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une réservation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ajout manuel</DialogTitle>
                    <DialogDescription>
                        Ajoutez une réservation pour un client (téléphone, guichet...)
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!representationId && representations && (
                        <div>
                            <Label htmlFor="representation">Représentation</Label>
                            <select
                                id="representation"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedRepresentationId}
                                onChange={(e) => setSelectedRepresentationId(e.target.value)}
                                required
                            >
                                <option value="">Sélectionner une représentation</option>
                                {representations.map((rep) => (
                                    <option key={rep.id} value={rep.id}>
                                        {rep.titre} - {rep.date} à {rep.heure}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="prenom">Prénom</Label>
                            <Input
                                id="prenom"
                                value={formData.prenom}
                                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="nom">Nom</Label>
                            <Input
                                id="nom"
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="telephone">Téléphone</Label>
                        <Input
                            id="telephone"
                            value={formData.telephone}
                            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Email (optionnel)</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="nbPlaces">Nombre de places</Label>
                        <select
                            id="nbPlaces"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.nbPlaces}
                            onChange={(e) => {
                                setFormData({ ...formData, nbPlaces: parseInt(e.target.value) })
                                // Réinitialiser la sélection si on change le nombre
                                setSelectedSeats([])
                            }}
                        >
                            {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>
                                    {n} place{n > 1 ? 's' : ''}
                                </option>
                            ))}
                        </select>

                        <div className="mt-3 flex items-start space-x-2">
                            <Checkbox
                                id="pmr-admin"
                                checked={formData.pmr}
                                onCheckedChange={(checked) => setFormData({ ...formData, pmr: checked as boolean })}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="pmr-admin" className="text-sm font-medium leading-none flex items-center gap-2 cursor-pointer">
                                    <Accessibility className="h-4 w-4" />
                                    Accès PMR / Fauteuil
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Option de sélection manuelle */}
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 mt-2">
                        <Checkbox
                            id="manual-selection"
                            checked={manualSelection}
                            onCheckedChange={(checked) => {
                                setManualSelection(checked as boolean)
                                setSelectedSeats([])
                            }}
                        />
                        <Label htmlFor="manual-selection" className="cursor-pointer flex-1">
                            Choisir les places manuellement
                        </Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-blue-600 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="text-sm">
                                        💡 <strong>Conseil :</strong> Laissez l'algorithme choisir automatiquement pour gagner du temps.
                                        Activez cette option si l'algorithme ne trouve pas de places ou pour des demandes spécifiques.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Sélecteur de sièges */}
                    {manualSelection && (representationId || selectedRepresentationId) && (
                        <div className="border-t pt-4">
                            <SeatingPlanSelector
                                representationId={representationId || selectedRepresentationId}
                                nbPlaces={formData.nbPlaces}
                                onSeatsSelected={setSelectedSeats}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 mt-2">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Ajout...' : 'Confirmer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
