'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Mail, CheckCircle, XCircle, Pencil, Power, PowerOff, Euro, Calendar, CreditCard } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface Paiement {
    id: string
    montant: number
    datePaiement: string
    anneeCouverte: number
    notes?: string
}

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
    paiements?: Paiement[]
}

export default function ResavoAdminPage() {
    const [associations, setAssociations] = useState<Association[]>([])
    const [loading, setLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; assoc: Association | null }>({ open: false, assoc: null })
    const [paiementDialog, setPaiementDialog] = useState<{ open: boolean; assoc: Association | null }>({ open: false, assoc: null })
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
    const [processingPayment, setProcessingPayment] = useState(false)

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

            resetForm()
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
            password: '',
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

    const handleRecordPayment = (assoc: Association) => {
        setPaiementDialog({ open: true, assoc })
    }

    const confirmPayment = async () => {
        const assoc = paiementDialog.assoc
        if (!assoc) return

        setProcessingPayment(true)
        try {
            const res = await fetch(`/api/admin/associations/${assoc.id}/paiement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ montant: 299 })
            })

            if (res.ok) {
                fetchAssociations()
                setPaiementDialog({ open: false, assoc: null })
            } else {
                const data = await res.json()
                alert(data.error || 'Erreur lors de l\'enregistrement du paiement')
            }
        } catch (err) {
            console.error(err)
            alert('Erreur serveur')
        } finally {
            setProcessingPayment(false)
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Non définie'
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const isLicenceExpiringSoon = (dateString?: string) => {
        if (!dateString) return false
        const expireDate = new Date(dateString)
        const now = new Date()
        const diffDays = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays <= 30 && diffDays > 0
    }

    const isLicenceExpired = (dateString?: string) => {
        if (!dateString) return false
        return new Date(dateString) < new Date()
    }

    const activeLicences = associations.filter(a => a.licenceActive).length
    const revenusEstimes = activeLicences * 299

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

                {/* Dialog de confirmation désactivation */}
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

                {/* Dialog d'enregistrement de paiement */}
                <Dialog open={paiementDialog.open} onOpenChange={(open) => setPaiementDialog({ ...paiementDialog, open })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Enregistrer un paiement</DialogTitle>
                            <DialogDescription>
                                Confirmez la réception du paiement de <strong>{paiementDialog.assoc?.nom}</strong>.
                                La licence sera renouvelée pour 1 an.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <Euro className="w-8 h-8 text-green-600" />
                                    <div>
                                        <p className="font-bold text-green-800 text-xl">299 €</p>
                                        <p className="text-sm text-green-600">Licence annuelle</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setPaiementDialog({ open: false, assoc: null })}>
                                Annuler
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={confirmPayment}
                                disabled={processingPayment}
                            >
                                <CreditCard className="w-4 h-4 mr-2" />
                                {processingPayment ? 'Enregistrement...' : 'Confirmer le paiement'}
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
                                <p className="text-2xl font-bold">{activeLicences}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-200 rounded-lg">
                                <Euro className="w-6 h-6 text-green-700" />
                            </div>
                            <div>
                                <p className="text-sm text-green-700">Revenus annuels estimés</p>
                                <p className="text-2xl font-bold text-green-800">{revenusEstimes} €</p>
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
                                        <div className="space-y-3 flex-1">
                                            {/* Nom et statut */}
                                            <div className="flex items-center gap-3 flex-wrap">
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
                                                {isLicenceExpiringSoon(assoc.licenceExpire) && (
                                                    <Badge variant="outline" className="gap-1 border-orange-300 text-orange-600 bg-orange-50">
                                                        Expire bientôt
                                                    </Badge>
                                                )}
                                                {isLicenceExpired(assoc.licenceExpire) && (
                                                    <Badge variant="outline" className="gap-1 border-red-300 text-red-600 bg-red-50">
                                                        Expirée
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Infos licence */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">
                                                    Licence valable jusqu'au: <strong>{formatDate(assoc.licenceExpire)}</strong>
                                                </span>
                                            </div>

                                            {/* Boutons d'action */}
                                            <div className="flex items-center gap-2 flex-wrap">
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
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRecordPayment(assoc)}
                                                    className="text-green-600 border-green-300 hover:bg-green-50"
                                                >
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    Enregistrer paiement
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 text-sm text-gray-600 text-right">
                                            <div className="flex items-center gap-1 justify-end">
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
            </Card>
        </div>
    )
}
