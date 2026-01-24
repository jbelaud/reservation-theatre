'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Search, Download, Trash2, Edit, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { SeatingPlanEditSelector } from '@/components/seating-plan-edit-selector'

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
    representationId?: string
    representationTitle?: string
    representationDate?: string
}

interface ReservationListProps {
    reservations: Reservation[]
    showRepresentation?: boolean
    onRefresh?: () => void
}

export function ReservationList({ reservations, showRepresentation = false, onRefresh }: ReservationListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
    const [originalSeats, setOriginalSeats] = useState<string[]>([])
    const [editedSeats, setEditedSeats] = useState<string[]>([])
    const [deleting, setDeleting] = useState(false)
    const [saving, setSaving] = useState(false)
    const { toast } = useToast()

    const filteredReservations = reservations.filter(
        (resa) =>
            resa.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resa.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resa.telephone.includes(searchTerm)
    )

    const allSelected = filteredReservations.length > 0 && filteredReservations.every(r => selectedIds.has(r.id))
    const someSelected = selectedIds.size > 0

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredReservations.map(r => r.id)))
        }
    }

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    const handleDeleteSelected = async () => {
        setDeleting(true)
        try {
            const idsToDelete = Array.from(selectedIds)
            const response = await fetch('/api/reservations/batch-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: idsToDelete })
            })

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression')
            }

            toast({
                title: "Réservations supprimées",
                description: `${idsToDelete.length} réservation(s) supprimée(s) avec succès`
            })

            setSelectedIds(new Set())
            setDeleteDialogOpen(false)
            onRefresh?.()
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : 'Une erreur est survenue',
                variant: "destructive"
            })
        } finally {
            setDeleting(false)
        }
    }

    const handleEditReservation = (reservation: Reservation) => {
        const seats = parseSieges(reservation.sieges)
        setEditingReservation({ ...reservation, sieges: seats })
        setOriginalSeats(seats)
        setEditedSeats(seats)
        setEditDialogOpen(true)
    }

    const handleSeatsChange = useCallback((seats: string[]) => {
        setEditedSeats(seats)
    }, [])

    const handleSaveEdit = async () => {
        if (!editingReservation) return
        
        // Validation : au moins un siège doit être sélectionné
        if (editedSeats.length === 0) {
            toast({
                title: "Erreur",
                description: "Veuillez sélectionner au moins un siège",
                variant: "destructive"
            })
            return
        }

        setSaving(true)
        try {
            const response = await fetch(`/api/reservations/${editingReservation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nbPlaces: editedSeats.length,
                    sieges: editedSeats
                })
            })

            if (!response.ok) {
                throw new Error('Erreur lors de la modification')
            }

            toast({
                title: "Réservation modifiée",
                description: `La réservation a été mise à jour (${editedSeats.length} place${editedSeats.length > 1 ? 's' : ''})`
            })

            setEditDialogOpen(false)
            setEditingReservation(null)
            setOriginalSeats([])
            setEditedSeats([])
            onRefresh?.()
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : 'Une erreur est survenue',
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false)
        setEditingReservation(null)
        setOriginalSeats([])
        setEditedSeats([])
    }

    const updateEditingSeats = (seatString: string) => {
        if (!editingReservation) return
        const seats = seatString.split(',').map(s => s.trim()).filter(s => s)
        setEditedSeats(seats)
        setEditingReservation({
            ...editingReservation,
            sieges: seats,
            nbPlaces: seats.length || editingReservation.nbPlaces
        })
    }

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
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    {someSelected && (
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer ({selectedIds.size})
                        </Button>
                    )}
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
                            <TableHead className="w-12">
                                <Checkbox 
                                    checked={allSelected}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Contact</TableHead>
                            {showRepresentation && <TableHead>Représentation</TableHead>}
                            <TableHead>Places</TableHead>
                            <TableHead>Sièges</TableHead>
                            <TableHead className="w-12">Actions</TableHead>
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
                                <TableRow key={resa.id} className={selectedIds.has(resa.id) ? 'bg-blue-50' : ''}>
                                    <TableCell>
                                        <Checkbox 
                                            checked={selectedIds.has(resa.id)}
                                            onCheckedChange={() => toggleSelect(resa.id)}
                                        />
                                    </TableCell>
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
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditReservation(resa)}
                                            title="Modifier"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Confirmer la suppression
                        </DialogTitle>
                        <DialogDescription>
                            Vous êtes sur le point de supprimer {selectedIds.size} réservation(s).
                            Cette action est irréversible et libérera les places correspondantes.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteSelected} disabled={deleting}>
                            {deleting ? 'Suppression...' : 'Supprimer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de modification */}
            <Dialog open={editDialogOpen} onOpenChange={handleCloseEditDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Modifier la réservation</DialogTitle>
                        <DialogDescription>
                            {editingReservation && (
                                <span className="block mt-2 font-medium">
                                    {editingReservation.nom.toUpperCase()} {editingReservation.prenom} - {editingReservation.telephone}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    {editingReservation && editingReservation.representationId && (
                        <div className="py-2">
                            <p className="text-sm text-muted-foreground mb-3">
                                Cliquez sur les sièges pour ajouter ou retirer des places. 
                                Les sièges <span className="text-orange-600 font-medium">orange</span> sont les places actuelles de cette réservation.
                            </p>
                            <SeatingPlanEditSelector
                                representationId={editingReservation.representationId}
                                currentSeats={originalSeats}
                                onSeatsSelected={handleSeatsChange}
                            />
                        </div>
                    )}
                    {editingReservation && !editingReservation.representationId && (
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium">Sièges (séparés par des virgules)</label>
                                <Input
                                    value={editedSeats.join(', ')}
                                    onChange={(e) => updateEditingSeats(e.target.value)}
                                    placeholder="A1, A2, A3"
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Entrez les numéros de sièges séparés par des virgules (ex: A1, A2, B3)
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseEditDialog} disabled={saving}>
                            Annuler
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={saving || editedSeats.length === 0}>
                            {saving ? 'Enregistrement...' : `Enregistrer (${editedSeats.length} place${editedSeats.length > 1 ? 's' : ''})`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
