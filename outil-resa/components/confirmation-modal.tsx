'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Printer } from 'lucide-react'

interface ConfirmationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    reservationId: string
    slug: string
}

export function ConfirmationModal({ open, onOpenChange, reservationId, slug }: ConfirmationModalProps) {
    const [reservation, setReservation] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (open && reservationId) {
            fetch(`/api/reservations/${reservationId}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setReservation(data)
                    }
                })
                .catch(() => {})
                .finally(() => setLoading(false))
        }
    }, [open, reservationId])

    const handlePrint = () => {
        window.print()
    }

    const handleClose = () => {
        onOpenChange(false)
        setReservation(null)
        setLoading(true)
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
                            className="h-8 w-8 p-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <DialogTitle>Confirmation de réservation</DialogTitle>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="text-center p-8">Chargement...</div>
                ) : !reservation ? (
                    <div className="text-center p-8 text-red-600">Réservation introuvable</div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl">
                                ✓
                            </div>
                            <h3 className="text-2xl font-bold text-green-700 mb-2">Réservation Confirmée !</h3>
                        </div>

                        <div className="text-center">
                            <h4 className="font-semibold text-lg">{reservation.representation.titre}</h4>
                            <p className="text-slate-600">
                                {format(new Date(reservation.representation.date), 'EEEE d MMMM yyyy', { locale: fr })} à {reservation.representation.heure}
                            </p>
                            <p className="text-slate-500 text-sm mt-1">{reservation.representation.association.nom}</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Réservé par :</span>
                                <span className="font-medium">{reservation.prenom} {reservation.nom}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Téléphone :</span>
                                <span className="font-medium">{reservation.telephone}</span>
                            </div>
                            {reservation.email && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Email :</span>
                                    <span className="font-medium">{reservation.email}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-slate-600">Nombre de places :</span>
                                <span className="font-medium">{reservation.nbPlaces}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3">
                                <span className="block text-slate-600 mb-2 font-medium">Vos sièges :</span>
                                <div className="flex flex-wrap gap-2">
                                    {reservation.sieges.map((siege: string) => (
                                        <span key={siege} className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-mono font-bold text-sm">
                                            {siege}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Important :</strong> Notez bien vos numéros de sièges. Vous pouvez imprimer cette confirmation ou prendre une capture d&apos;écran.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button onClick={handlePrint} variant="outline" className="w-full">
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimer la confirmation
                            </Button>
                            <Button onClick={handleClose} className="w-full">
                                Retour à l&apos;accueil
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
