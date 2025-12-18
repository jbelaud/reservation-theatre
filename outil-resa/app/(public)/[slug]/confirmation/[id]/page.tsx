import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { parseSieges } from '@/lib/json-helpers'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { PrintButton } from '@/components/print-button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'

export default async function ConfirmationPage({
    params
}: {
    params: Promise<{ slug: string; id: string }>
}) {
    const { slug, id } = await params

    const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: {
            representation: {
                include: {
                    association: true
                }
            }
        }
    })

    if (!reservation) {
        notFound()
    }

    const sieges = parseSieges(reservation.sieges)

    return (
        <div className="max-w-md mx-auto">
            <Card className="border-green-500 border-t-4">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-2xl">
                        ✓
                    </div>
                    <CardTitle className="text-2xl text-green-700">Réservation Confirmée !</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <h3 className="font-semibold text-lg">{reservation.representation.titre}</h3>
                        <p className="text-slate-600">
                            {format(new Date(reservation.representation.date), 'EEEE d MMMM yyyy', { locale: fr })} à {reservation.representation.heure}
                        </p>
                        <p className="text-slate-500 text-sm mt-1">{reservation.representation.association.nom}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-600">Réservé par :</span>
                            <span className="font-medium">{reservation.prenom} {reservation.nom}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-600">Nombre de places :</span>
                            <span className="font-medium">{reservation.nbPlaces}</span>
                        </div>
                        <div className="border-t border-slate-200 my-2 pt-2">
                            <span className="block text-slate-600 mb-1">Vos sièges :</span>
                            <div className="flex flex-wrap gap-2">
                                {sieges.map(siege => (
                                    <span key={siege} className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono font-bold">
                                        {siege}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <PrintButton />
                    <Button variant="outline" className="w-full" asChild>
                        <Link href={`/${slug}`}>
                            Retour à l'accueil
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
