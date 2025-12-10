// components/representation-table.tsx
'use client'

import { format, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Edit, Trash2, Eye, Calendar, Clock } from 'lucide-react'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Representation {
    id: string
    titre: string
    date: string | Date
    heure: string
    capacite: number
    placesRestantes?: number
    tauxRemplissage?: number
}

interface RepresentationTableProps {
    representations: Representation[]
    onView: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

export function RepresentationTable({
    representations,
    onView,
    onEdit,
    onDelete,
}: RepresentationTableProps) {
    if (representations.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-500 mb-4">Aucune représentation pour le moment</p>
                <p className="text-sm text-gray-400">
                    Créez votre première représentation pour commencer
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Titre</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Heure</TableHead>
                        <TableHead>Capacité</TableHead>
                        <TableHead>Places restantes</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {representations.map((rep) => {
                        const placesRestantes = rep.placesRestantes ?? rep.capacite
                        const tauxRemplissage = rep.tauxRemplissage ?? 0
                        const isComplet = placesRestantes === 0
                        const isPastDate = isPast(new Date(rep.date))

                        return (
                            <TableRow key={rep.id} className={isPastDate ? 'opacity-60' : ''}>
                                <TableCell>
                                    {isPastDate ? (
                                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 text-xs">
                                            Passé
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                            À venir
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{rep.titre}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        {format(new Date(rep.date), 'd MMM yyyy', { locale: fr })}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        {rep.heure}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{rep.capacite}</TableCell>
                                <TableCell>
                                    <span className={isComplet ? 'text-red-600 font-semibold' : 'font-medium'}>
                                        {placesRestantes}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={isComplet ? 'destructive' : 'default'}
                                        className={
                                            !isComplet && tauxRemplissage < 50
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : !isComplet && tauxRemplissage < 80
                                                    ? 'bg-orange-500 hover:bg-orange-600'
                                                    : ''
                                        }
                                    >
                                        {isComplet
                                            ? 'Complet'
                                            : `${tauxRemplissage}% rempli`}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onView(rep.id)}
                                            title="Voir les détails"
                                            className="hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(rep.id)}
                                            title="Modifier"
                                            className="hover:bg-gray-100"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(rep.id)}
                                            title="Supprimer"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
