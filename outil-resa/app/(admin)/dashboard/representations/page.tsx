// app/(admin)/dashboard/representations/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RepresentationTable } from '@/components/representation-table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { CreateRepresentationDialog } from '@/components/create-representation-dialog'

interface Representation {
    id: string
    titre: string
    date: string
    heure: string
    capacite: number
    placesRestantes: number
    tauxRemplissage: number
}

export default function RepresentationsPage() {
    const router = useRouter()
    const [representations, setRepresentations] = useState<Representation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [selectedYear, setSelectedYear] = useState<string>('all')

    // Calculer les années disponibles
    const years = Array.from(
        new Set(
            representations.map((rep) => new Date(rep.date).getFullYear().toString())
        )
    ).sort((a, b) => b.localeCompare(a))

    // Filtrer les représentations
    const filteredRepresentations = representations.filter((rep) => {
        if (selectedYear === 'all') return true
        return new Date(rep.date).getFullYear().toString() === selectedYear
    })

    // Charger les représentations
    useEffect(() => {
        fetchRepresentations()
    }, [])

    const fetchRepresentations = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/representations')

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des représentations')
            }

            const data = await response.json()
            setRepresentations(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    const handleView = (id: string) => {
        router.push(`/dashboard/representations/${id}`)
    }

    const handleEdit = (id: string) => {
        router.push(`/dashboard/representations/${id}`)
    }

    const handleDeleteClick = (id: string) => {
        setDeleteId(id)
    }

    const handleDeleteConfirm = async () => {
        if (!deleteId) return

        try {
            setDeleting(true)
            const response = await fetch(`/api/representations/${deleteId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression')
            }

            // Rafraîchir la liste
            await fetchRepresentations()
            setDeleteId(null)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Erreur lors de la suppression')
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-500">Chargement...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Mes représentations</h1>
                    <p className="text-gray-600 mt-2">
                        Gérez vos représentations et suivez les réservations
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrer par année" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les années</SelectItem>
                            {years.map((year) => (
                                <SelectItem key={year} value={year}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <CreateRepresentationDialog onSuccess={fetchRepresentations} />
                </div>
            </div>

            <RepresentationTable
                representations={filteredRepresentations}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            {/* Dialog de confirmation de suppression */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette représentation ?
                            Toutes les réservations associées seront également supprimées.
                            Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            disabled={deleting}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                        >
                            {deleting ? 'Suppression...' : 'Supprimer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
