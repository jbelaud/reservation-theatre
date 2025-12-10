'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Mail, Calendar, CheckCircle, XCircle, Pencil, Power, PowerOff } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface Association {
    id: string
    nom: string
    slug: string
    email: string
    telephone?: string
    licenceActive: boolean
    licenceExpire?: string
    createdAt: string
    nbRepresentations: number
    nbPlansSalle: number
}

export default function ResavoAdminPage() {
    const [associations, setAssociations] = useState<Association[]>([])
    const [loading, setLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; assoc: Association | null }>({ open: false, assoc: null })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        password: '',
        telephone: '',
        slug: ''
    })
    const [error, setError] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchAssociations()
    }, [])

    const fetchAssociations = async () => {
        try {
            const res = await fetch('/api/admin/associations')
            const data = await res.json()
            if (res.ok) {
                setAssociations(data.associations)
            }
        } catch (err) {
            console.error('Error fetching associations:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setCreating(true)

        try {
            const url = '/api/admin/associations'
            const method = editingId ? 'PATCH' : 'POST'
            const body = editingId ? { ...formData, id: editingId } : formData

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Erreur lors de l\'opération')
                return
            }

            // Réinitialiser le formulaire et fermer la modale
            resetForm()

            // Rafraîchir la liste
            fetchAssociations()
        } catch (err) {
            setError('Erreur de connexion au serveur')
        } finally {
            setCreating(false)
        }
    }

    const resetForm = () => {
        setFormData({
            nom: '',
            email: '',
            password: '',
            telephone: '',
            slug: ''
        })
        setEditingId(null)
        setOpenDialog(false)
        setError('')
    }

    const handleEdit = (assoc: Association) => {
        setFormData({
            nom: assoc.nom,
            email: assoc.email,
            password: '', // On ne remplit pas le mot de passe
            telephone: assoc.telephone || '',
            slug: assoc.slug
        })
        setEditingId(assoc.id)
        setOpenDialog(true)
    }

    const handleCreate = () => {
        resetForm()
        setOpenDialog(true)
    }

    const handleToggleStatus = (assoc: Association) => {
        setConfirmDialog({ open: true, assoc })
    }

    const confirmToggle = async () => {
        const assoc = confirmDialog.assoc
        if (!assoc) return

        try {
            const res = await fetch('/api/admin/associations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: assoc.id,
                    licenceActive: !assoc.licenceActive
                })
            })

            if (res.ok) {
                fetchAssociations()
                setConfirmDialog({ open: false, assoc: null })
            } else {
                alert('Erreur lors de la mise à jour')
            }
        } catch (err) {
            console.error(err)
            alert('Erreur serveur')
        }
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestion Resavo</h1>
                    <p className="text-gray-600 mt-1">
                        Gérez les comptes des associations et suivez leur activité
                    </p>
                </div>
                <Dialog open={openDialog} onOpenChange={(open) => !open && resetForm()}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="gap-2" onClick={handleCreate}>
                            <Plus className="w-5 h-5" />
                            Nouvelle association
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Modifier l\'association' : 'Créer une association'}</DialogTitle>
                            <DialogDescription>
                                {editingId ? 'Modifiez les informations de l\'association' : 'Créez un nouveau compte pour une association'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom de l'association *</Label>
                                <Input
                                    id="nom"
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    placeholder="Théâtre Municipal"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (optionnel)</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="theatre-municipal"
                                />
                                <p className="text-xs text-gray-500">
                                    Laissez vide pour génération automatique
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contact@theatre.fr"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telephone">Téléphone</Label>
                                <Input
                                    id="telephone"
                                    type="tel"
                                    value={formData.telephone}
                                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                    placeholder="06 12 34 56 78"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe {editingId && '(optionnel)'}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required={!editingId}
                                />
                                <p className="text-xs text-gray-500">
                                    Minimum 8 caractères
                                </p>
                            </div>

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={creating}>
                                {creating ? 'Enregistrement...' : (editingId ? 'Modifier' : 'Créer le compte')}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog de confirmation */}
                <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmer l'action</DialogTitle>
                            <DialogDescription>
                                Voulez-vous vraiment {confirmDialog.assoc?.licenceActive ? 'désactiver' : 'activer'} l'association <strong>{confirmDialog.assoc?.nom}</strong> ?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, assoc: null })}>
                                Annuler
                            </Button>
                            <Button
                                variant={confirmDialog.assoc?.licenceActive ? "destructive" : "default"}
                                onClick={confirmToggle}
                            >
                                {confirmDialog.assoc?.licenceActive ? 'Désactiver' : 'Activer'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total associations</p>
                                <p className="text-2xl font-bold">{associations.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Licences actives</p>
                                <p className="text-2xl font-bold">
                                    {associations.filter(a => a.licenceActive).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total représentations</p>
                                <p className="text-2xl font-bold">
                                    {associations.reduce((sum, a) => sum + a.nbRepresentations, 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des associations */}
            <Card>
                <CardHeader>
                    <CardTitle>Associations</CardTitle>
                    <CardDescription>
                        Liste de toutes les associations inscrites
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center text-gray-500 py-8">Chargement...</p>
                    ) : associations.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            Aucune association pour le moment
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {associations.map((assoc) => (
                                <div
                                    key={assoc.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-lg">{assoc.nom}</h3>
                                                    {assoc.licenceActive ? (
                                                        <Badge variant="default" className="gap-1">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="gap-1">
                                                            <XCircle className="w-3 h-3" />
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(assoc)}>
                                                    <Pencil className="w-4 h-4 mr-2" />
                                                    Modifier
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(assoc)}
                                                    className={assoc.licenceActive ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                                                >
                                                    {assoc.licenceActive ? (
                                                        <>
                                                            <PowerOff className="w-4 h-4 mr-2" />
                                                            Désactiver
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Power className="w-4 h-4 mr-2" />
                                                            Activer
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                {assoc.email}
                                            </div>
                                            <div>
                                                <span className="font-medium">Slug:</span> {assoc.slug}
                                            </div>
                                            <div>
                                                <span className="font-medium">Représentations:</span> {assoc.nbRepresentations}
                                            </div>
                                            <div>
                                                <span className="font-medium">Créé le:</span>{' '}
                                                {new Date(assoc.createdAt).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card >
        </div >
    )
}
