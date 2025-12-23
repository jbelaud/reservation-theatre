'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { parsePlacesOccupees } from '@/lib/json-helpers'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ReservationModal } from '@/components/reservation-modal'
import { ConfirmationModal } from '@/components/confirmation-modal'
import { CldImage } from 'next-cloudinary'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export default function AssociationPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const [slug, setSlug] = useState<string>('')
    const [association, setAssociation] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedRepresentationId, setSelectedRepresentationId] = useState<string | null>(null)
    const [reservationModalOpen, setReservationModalOpen] = useState(false)
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
    const [confirmedReservationId, setConfirmedReservationId] = useState<string>('')
    const [posterModalOpen, setPosterModalOpen] = useState(false)

    useEffect(() => {
        params.then(({ slug: resolvedSlug }) => {
            setSlug(resolvedSlug)
            fetch(`/api/associations/${resolvedSlug}`)
                .then(res => {
                    if (!res.ok) {
                        notFound()
                    }
                    return res.json()
                })
                .then(data => setAssociation(data))
                .catch(() => notFound())
                .finally(() => setLoading(false))
        })
    }, [])

    const handleReserverClick = (representationId: string) => {
        setSelectedRepresentationId(representationId)
        setReservationModalOpen(true)
    }

    const handleReservationSuccess = (reservationId: string) => {
        setConfirmedReservationId(reservationId)
        setConfirmationModalOpen(true)
    }

    if (loading) {
        return <div className="text-center p-8">Chargement...</div>
    }

    if (!association) {
        return null
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-4">
                    {association.logo && (
                        <CldImage
                            src={association.logo}
                            alt={`Logo ${association.nom}`}
                            width="80"
                            height="80"
                            className="h-20 w-auto object-contain"
                        />
                    )}
                    <h1 className="text-4xl font-bold text-slate-900">{association.nom}</h1>
                </div>
                <p className="text-lg text-slate-600">
                    Réservez vos places pour nos prochaines représentations
                </p>
            </div>

            <div className="grid md:grid-cols-12 gap-8">
                {/* Colonne de gauche : Affiche */}
                <div className="md:col-span-5">
                    {association.affiche ? (
                        <div className="sticky top-8">
                            <CldImage
                                src={association.affiche}
                                alt="Affiche du spectacle"
                                width="500"
                                height="750"
                                className="w-full rounded-lg shadow-lg cursor-pointer hover:shadow-2xl transition-shadow"
                                onClick={() => setPosterModalOpen(true)}
                            />
                        </div>
                    ) : (
                        <div className="bg-slate-100 rounded-lg h-96 flex items-center justify-center text-slate-400">
                            Pas d'affiche disponible
                        </div>
                    )}
                </div>

                {/* Colonne de droite : Représentations */}
                <div className="md:col-span-7 space-y-6">
                    {association.representations.length === 0 ? (
                        <Card className="p-8 text-center text-slate-500">
                            Aucune représentation prévue pour le moment.
                        </Card>
                    ) : (
                        association.representations.map((representation) => {
                            const placesOccupees = parsePlacesOccupees(representation.placesOccupees)
                            const placesRestantes = representation.capacite - placesOccupees.length

                            return (
                                <Card key={representation.id} className="flex flex-col md:flex-row items-center justify-between p-6 hover:shadow-md transition-shadow">
                                    <div className="mb-4 md:mb-0">
                                        <h3 className="text-xl font-semibold mb-2">{representation.titre}</h3>
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <span className="flex items-center gap-1">
                                                📅 {format(new Date(representation.date), 'EEEE d MMMM yyyy', { locale: fr })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                ⏰ {representation.heure}
                                            </span>
                                        </div>
                                        {representation.description && (
                                            <p className="mt-2 text-slate-500 text-sm">{representation.description}</p>
                                        )}
                                    </div>

                                    <div className="text-center md:text-right flex flex-col items-center md:items-end gap-3">
                                        <div className="text-sm font-medium">
                                            {placesRestantes > 0 ? (
                                                <span className="text-green-600">{placesRestantes} places disponibles</span>
                                            ) : (
                                                <span className="text-red-600">Complet</span>
                                            )}
                                        </div>

                                        <Button 
                                            onClick={() => handleReserverClick(representation.id)}
                                            disabled={placesRestantes === 0} 
                                            size="lg"
                                        >
                                            Réserver
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })
                    )}
                </div>
            </div>

            <ReservationModal
                open={reservationModalOpen}
                onOpenChange={setReservationModalOpen}
                representationId={selectedRepresentationId || ''}
                slug={slug}
                onReservationSuccess={handleReservationSuccess}
            />

            <ConfirmationModal
                open={confirmationModalOpen}
                onOpenChange={setConfirmationModalOpen}
                reservationId={confirmedReservationId}
                slug={slug}
            />

            {/* Modal pour afficher l'affiche en grand */}
            {association.affiche && (
                <Dialog open={posterModalOpen} onOpenChange={setPosterModalOpen}>
                    <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
                        <CldImage
                            src={association.affiche}
                            alt="Affiche du spectacle"
                            width="1200"
                            height="1800"
                            className="w-full h-auto rounded-lg"
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
