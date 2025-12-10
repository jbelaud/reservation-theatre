'use client'

import { useEffect, useState } from 'react'
import { Save, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function ParametresPage() {
    const [association, setAssociation] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        couleurTheme: '#1e40af'
    })

    useEffect(() => {
        fetch('/api/association')
            .then(res => res.json())
            .then(data => {
                setAssociation(data)
                setFormData({
                    nom: data.nom || '',
                    email: data.email || '',
                    telephone: data.telephone || '',
                    couleurTheme: data.couleurTheme || '#1e40af'
                })
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/association', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Erreur sauvegarde')

            const updatedAssociation = await res.json()
            setAssociation(updatedAssociation)

            toast({
                title: "Paramètres sauvegardés",
                description: "Vos modifications ont été enregistrées avec succès.",
            })
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de sauvegarder les paramètres",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const handleCopyUrl = () => {
        const url = `${window.location.origin}/${association.slug}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        toast({
            title: "URL copiée",
            description: "L'URL publique a été copiée dans le presse-papier",
        })
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) return <div className="p-8">Chargement...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
            <p className="text-slate-600 mb-8">
                Gérez les informations de votre association
            </p>

            <div className="space-y-6">
                {/* Informations générales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations générales</CardTitle>
                        <CardDescription>
                            Nom, email et téléphone de votre association
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="nom">Nom de l'association</Label>
                            <Input
                                id="nom"
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="telephone">Téléphone (optionnel)</Label>
                            <Input
                                id="telephone"
                                type="tel"
                                value={formData.telephone}
                                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                placeholder="06 12 34 56 78"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Personnalisation */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personnalisation</CardTitle>
                        <CardDescription>
                            Couleur du thème de votre page publique
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="couleur">Couleur du thème</Label>
                            <div className="flex gap-3 items-center mt-2">
                                <Input
                                    id="couleur"
                                    type="color"
                                    value={formData.couleurTheme}
                                    onChange={(e) => setFormData({ ...formData, couleurTheme: e.target.value })}
                                    className="w-20 h-10 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={formData.couleurTheme}
                                    onChange={(e) => setFormData({ ...formData, couleurTheme: e.target.value })}
                                    className="flex-1"
                                    placeholder="#1e40af"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Cette couleur sera utilisée sur votre page publique
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* URL publique */}
                <Card>
                    <CardHeader>
                        <CardTitle>URL publique</CardTitle>
                        <CardDescription>
                            Partagez cette URL avec vos spectateurs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${association?.slug || ''}`}
                                readOnly
                                className="flex-1 font-mono text-sm"
                            />
                            <Button onClick={handleCopyUrl} variant="outline">
                                {copied ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Copié
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copier
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Bouton sauvegarder */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving} size="lg">
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
