'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Search, Download } from 'lucide-react'
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

// Helper pour parser les sièges (compatibilité SQLite/PostgreSQL)
const parseSieges = (sieges: unknown): string[] => {
    if (Array.isArray(sieges)) return sieges
    if (typeof sieges === 'string') {
        try { return JSON.parse(sieges) } catch { return [] }
    }
    return []
}

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
    showRepresentation?: boolean
}

export function ReservationList({ reservations, showRepresentation = false }: ReservationListProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredReservations = reservations.filter(
        (resa) =>
            resa.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resa.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resa.telephone.includes(searchTerm)
    )

    const handleExport = () => {
        const headers = ['Nom', 'Prénom', 'Places', 'Sièges']

        const escapeCsvField = (field: string | number) => {
            const str = String(field)
            if (str.includes(';') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`
            }
            return str
        }

        const csvContent = [
            headers.join(';'),
            ...filteredReservations.map((r) => {
                const sieges = parseSieges(r.sieges).join(' ')
                const row = [
                    escapeCsvField(r.nom),
                    escapeCsvField(r.prenom),
                    r.nbPlaces,
                    escapeCsvField(sieges),
                ]
                return row.join(';')
            }),
        ].join('\n')

        const BOM = '\uFEFF'
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReservations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={showRepresentation ? 5 : 4} className="text-center py-8 text-muted-foreground">
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
                                            {parseSieges(resa.sieges).map((siege) => (
                                                <Badge key={siege} variant="secondary" className="text-xs">
                                                    {siege}
                                                </Badge>
                                            ))}
                                        </div>
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
