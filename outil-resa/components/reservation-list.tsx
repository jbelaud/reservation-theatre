'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search, Check, X, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

interface Reservation {
    id: string
    prenom: string
    nom: string
    telephone: string
    email?: string
    nbPlaces: number
    sieges: string[]
    statut: string
    createdAt: string
    representationTitle?: string
    representationDate?: string
}

interface ReservationListProps {
    reservations: Reservation[]
    onStatusChange: (id: string, newStatus: string) => void
    showRepresentation?: boolean
}

export function ReservationList({ reservations, onStatusChange, showRepresentation = false }: ReservationListProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredReservations = reservations.filter(
        (resa) =>
            resa.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resa.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resa.telephone.includes(searchTerm)
    )

    const handleExport = () => {
        const headers = ['Nom', 'Prénom', 'Téléphone', 'Email', 'Places', 'Sièges', 'Statut']
        if (showRepresentation) {
            headers.splice(4, 0, 'Représentation', 'Date')
        }

        const csvContent = [
            headers.join(','),
            ...filteredReservations.map((r) => {
                const row = [
                    r.nom,
                    r.prenom,
                    r.telephone,
                    r.email || '',
                    r.nbPlaces,
                    `"${(r.sieges as string[]).join(', ')}"`,
                    r.statut,
                ]
                if (showRepresentation) {
                    row.splice(4, 0, r.representationTitle || '', r.representationDate || '')
                }
                return row.join(',')
            }),
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `reservations_${format(new Date(), 'yyyy-MM-dd')}.csv`
        link.click()
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un nom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Contact</TableHead>
                            {showRepresentation && <TableHead>Représentation</TableHead>}
                            <TableHead>Places</TableHead>
                            <TableHead>Sièges</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReservations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={showRepresentation ? 7 : 6} className="text-center py-8 text-muted-foreground">
                                    Aucune réservation trouvée
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReservations.map((resa) => (
                                <TableRow key={resa.id}>
                                    <TableCell className="font-medium">
                                        {resa.nom.toUpperCase()} {resa.prenom}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{resa.telephone}</div>
                                        {resa.email && <div className="text-xs text-muted-foreground">{resa.email}</div>}
                                    </TableCell>
                                    {showRepresentation && (
                                        <TableCell>
                                            <div className="text-sm font-medium">{resa.representationTitle}</div>
                                            <div className="text-xs text-muted-foreground">{resa.representationDate}</div>
                                        </TableCell>
                                    )}
                                    <TableCell>{resa.nbPlaces}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {(resa.sieges as string[]).map((siege) => (
                                                <Badge key={siege} variant="secondary" className="text-xs">
                                                    {siege}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                resa.statut === 'présent'
                                                    ? 'default' // green-like usually
                                                    : resa.statut === 'annulé'
                                                        ? 'destructive'
                                                        : 'outline'
                                            }
                                            className={resa.statut === 'présent' ? 'bg-green-600 hover:bg-green-700' : ''}
                                        >
                                            {resa.statut}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {resa.statut !== 'annulé' && (
                                            <Button
                                                size="sm"
                                                variant={resa.statut === 'présent' ? 'outline' : 'default'}
                                                onClick={() =>
                                                    onStatusChange(resa.id, resa.statut === 'présent' ? 'confirmé' : 'présent')
                                                }
                                            >
                                                {resa.statut === 'présent' ? (
                                                    <>
                                                        <X className="mr-1 h-3 w-3" /> Annuler présence
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="mr-1 h-3 w-3" /> Marquer présent
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
