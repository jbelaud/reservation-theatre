import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { parsePlacesOccupees } from '@/lib/json-helpers'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'

export default async function AssociationPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Reculer d'un jour pour gérer les fuseaux horaires (UTC vs Local)
    // Ex: 27 Nov 00:00 Local -> 26 Nov 23:00 UTC. Si on filtre à partir du 27 Nov 00:00 UTC, on rate l'événement.
    today.setDate(today.getDate() - 1)

    const association = await prisma.association.findUnique({
        where: { slug },
        include: {
            representations: {
                where: {
                    date: {
                        gte: today
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            }
        }
    })

    if (!association) {
        notFound()
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-4">
                    {association.logo && (
                        <img
                            src={association.logo}
                            alt={`Logo ${association.nom}`}
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
                <div className="md:col-span-4">
                    {association.affiche ? (
                        <div className="sticky top-8">
                            <img
                                src={association.affiche}
                                alt="Affiche du spectacle"
                                className="w-full rounded-lg shadow-lg"
                            />
                        </div>
                    ) : (
                        <div className="bg-slate-100 rounded-lg h-96 flex items-center justify-center text-slate-400">
                            Pas d'affiche disponible
                        </div>
                    )}
                </div>

                {/* Colonne de droite : Représentations */}
                <div className="md:col-span-8 space-y-6">
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

                                        <Button asChild disabled={placesRestantes === 0} size="lg">
                                            <Link href={`/${slug}/reserver/${representation.id}`}>
                                                Réserver
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
