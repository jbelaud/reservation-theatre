'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, Armchair, Info, Zap, Edit3, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface Rangee {
    id: string
    sieges: number
}

interface SeatingPlanEditorProps {
    initialStructure: { rangees: Rangee[]; configuration?: string }
    onSave: (structure: { rangees: Rangee[]; configuration: string }) => Promise<void>
}

export function SeatingPlanEditor({ initialStructure, onSave }: SeatingPlanEditorProps) {
    const [rangees, setRangees] = useState<Rangee[]>(initialStructure.rangees || [])
    const [configuration, setConfiguration] = useState<string>(initialStructure.configuration || 'standard')
    const [loading, setLoading] = useState(false)

    // États pour l'ajout rapide - VIDES PAR DÉFAUT
    const [quickAddCount, setQuickAddCount] = useState<string>('')
    const [quickAddSeats, setQuickAddSeats] = useState<string>('')

    // États pour la modification globale - VIDE PAR DÉFAUT
    const [globalSeats, setGlobalSeats] = useState<string>('')

    const totalPlaces = rangees.reduce((acc, r) => acc + r.sieges, 0)

    const handleAddRow = () => {
        // Générer ID suivant (A, B, C...)
        const lastId = rangees.length > 0 ? rangees[rangees.length - 1].id : '@' // @ est avant A
        const nextId = String.fromCharCode(lastId.charCodeAt(0) + 1)

        setRangees([...rangees, { id: nextId, sieges: 10 }])
    }

    // Ajout rapide de plusieurs rangées
    const handleQuickAdd = () => {
        const count = parseInt(quickAddCount) || 0
        const seats = parseInt(quickAddSeats) || 10

        if (count <= 0 || count > 50) return

        const newRangees = [...rangees]
        let lastId = rangees.length > 0 ? rangees[rangees.length - 1].id : '@'

        for (let i = 0; i < count; i++) {
            const nextId = String.fromCharCode(lastId.charCodeAt(0) + 1)
            newRangees.push({ id: nextId, sieges: seats })
            lastId = nextId
        }

        setRangees(newRangees)
    }

    // Modification globale de toutes les rangées
    const handleApplyGlobalSeats = () => {
        const seats = parseInt(globalSeats) || 0
        if (seats <= 0 || seats > 50) return

        const newRangees = rangees.map(r => ({ ...r, sieges: seats }))
        setRangees(newRangees)
    }

    const handleRemoveRow = (index: number) => {
        const newRangees = rangees.filter((_, i) => i !== index)
        setRangees(newRangees)
    }

    const handleChangeSieges = (index: number, value: string) => {
        const sieges = parseInt(value) || 0
        const newRangees = [...rangees]
        newRangees[index].sieges = sieges
        setRangees(newRangees)
    }

    const handleChangeId = (index: number, value: string) => {
        const newRangees = [...rangees]
        newRangees[index].id = value.toUpperCase()
        setRangees(newRangees)
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            await onSave({ rangees, configuration })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Éditeur */}
            <Card>
                <CardHeader>
                    <CardTitle>Configuration des rangées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Configuration de numérotation */}
                    <div className="space-y-3 pb-4 border-b">
                        <Label className="text-base font-semibold">Type de numérotation</Label>
                        <Select value={configuration} onValueChange={setConfiguration}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionnez un type de numérotation" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard">
                                    <div className="flex flex-col">
                                        <span className="font-medium">Standard (1, 2, 3, 4...)</span>
                                        <span className="text-xs text-gray-500">Numérotation de gauche à droite</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="french">
                                    <div className="flex flex-col">
                                        <span className="font-medium">Française (impairs/pairs)</span>
                                        <span className="text-xs text-gray-500">Impairs à gauche | Allée | Pairs à droite</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-900">
                                {configuration === 'french'
                                    ? "Numérotation française : impairs à gauche (9, 7, 5...), pairs à droite (2, 4, 6...)"
                                    : "Numérotation standard : de gauche à droite (1, 2, 3, 4...)"}
                            </p>
                        </div>
                    </div>

                    {/* Ajout rapide de rangées */}
                    <div className="space-y-3 pb-4 border-b bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-5 w-5 text-purple-600" />
                            <Label className="text-base font-semibold text-purple-900">Ajout rapide de rangées</Label>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">
                            Créez plusieurs rangées identiques en une seule fois
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs text-gray-700">Nombre de rangées</Label>
                                <Input
                                    type="number"
                                    value={quickAddCount}
                                    onChange={(e) => setQuickAddCount(e.target.value)}
                                    min={1}
                                    max={50}
                                    placeholder="Ex: 10"
                                    className="bg-white"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-gray-700">Sièges par rangée</Label>
                                <Input
                                    type="number"
                                    value={quickAddSeats}
                                    onChange={(e) => setQuickAddSeats(e.target.value)}
                                    min={1}
                                    max={50}
                                    placeholder="Ex: 20"
                                    className="bg-white"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleQuickAdd}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            disabled={!quickAddCount || !quickAddSeats}
                        >
                            <Zap className="mr-2 h-4 w-4" />
                            Ajouter {quickAddCount || '0'} rangée{parseInt(quickAddCount) > 1 ? 's' : ''} de {quickAddSeats || '0'} sièges
                        </Button>
                    </div>

                    {/* Modification globale */}
                    {rangees.length > 0 && (
                        <div className="space-y-3 pb-4 border-b bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Edit3 className="h-5 w-5 text-amber-600" />
                                <Label className="text-base font-semibold text-amber-900">Modification globale</Label>
                            </div>
                            <p className="text-xs text-gray-600 mb-3">
                                Appliquez le même nombre de sièges à toutes les rangées
                            </p>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Label className="text-xs text-gray-700">Nombre de sièges</Label>
                                    <Input
                                        type="number"
                                        value={globalSeats}
                                        onChange={(e) => setGlobalSeats(e.target.value)}
                                        min={1}
                                        max={50}
                                        placeholder="Ex: 20"
                                        className="bg-white"
                                    />
                                </div>
                                <div className="pt-5">
                                    <Button
                                        onClick={handleApplyGlobalSeats}
                                        className="bg-amber-600 hover:bg-amber-700"
                                        disabled={!globalSeats}
                                    >
                                        <Edit3 className="mr-2 h-4 w-4" />
                                        Appliquer à toutes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Liste des rangées existantes */}
                    {rangees.length > 0 && (
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="rangees" className="border rounded-lg px-4">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-base font-semibold">Rangées individuelles</Label>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                {rangees.length} rangée{rangees.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3 pt-3">
                                    <p className="text-xs text-gray-600 mb-3">
                                        Modifiez chaque rangée individuellement si nécessaire
                                    </p>
                                    {rangees.map((rangee, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="w-20">
                                                <Label className="text-xs">Rangée</Label>
                                                <Input
                                                    value={rangee.id}
                                                    onChange={(e) => handleChangeId(index, e.target.value)}
                                                    className="font-bold text-center bg-white"
                                                    maxLength={2}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Label className="text-xs">Nombre de sièges</Label>
                                                <Input
                                                    type="number"
                                                    value={rangee.sieges}
                                                    onChange={(e) => handleChangeSieges(index, e.target.value)}
                                                    min={1}
                                                    max={50}
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div className="pt-5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleRemoveRow(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    <Button variant="outline" className="w-full mt-4" onClick={handleAddRow}>
                        <Plus className="mr-2 h-4 w-4" /> Ajouter une rangée
                    </Button>

                    <div className="pt-4 border-t mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold">Capacité totale :</span>
                            <span className="text-xl font-bold text-blue-600">{totalPlaces} places</span>
                        </div>
                        <Button className="w-full" onClick={handleSave} disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Enregistrement...' : 'Enregistrer la configuration'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Prévisualisation */}
            <Card>
                <CardHeader>
                    <CardTitle>Aperçu de la salle</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-900 text-white p-8 rounded-lg min-h-[400px] flex flex-col items-center justify-center overflow-auto">
                        <div className="w-full max-w-md bg-slate-700 h-8 mb-12 rounded-t-lg flex items-center justify-center text-xs uppercase tracking-widest text-slate-400">
                            Scène
                        </div>

                        <div className="space-y-2">
                            {rangees.map((rangee) => {
                                // Générer les numéros de sièges selon la configuration
                                const getSeatNumbers = () => {
                                    if (configuration === 'french') {
                                        // Numérotation française : impairs à gauche, pairs à droite
                                        const seats: (number | string)[] = []
                                        const totalSeats = rangee.sieges

                                        // Impairs de droite à gauche (9, 7, 5, 3, 1)
                                        const odds = []
                                        for (let i = 1; i <= totalSeats; i += 2) {
                                            odds.push(i)
                                        }
                                        odds.reverse()

                                        // Pairs de gauche à droite (2, 4, 6, 8, 10)
                                        const evens = []
                                        for (let i = 2; i <= totalSeats; i += 2) {
                                            evens.push(i)
                                        }

                                        // Combiner : impairs + allée + pairs
                                        return [...odds, '|', ...evens]
                                    } else {
                                        // Numérotation standard : 1, 2, 3, 4...
                                        return Array.from({ length: rangee.sieges }, (_, i) => i + 1)
                                    }
                                }

                                const seatNumbers = getSeatNumbers()

                                return (
                                    <div key={rangee.id} className="flex items-center justify-center gap-2">
                                        <span className="text-xs font-mono text-slate-500 w-6 text-right">{rangee.id}</span>
                                        <div className="flex gap-1">
                                            {seatNumbers.map((num, i) => {
                                                if (num === '|') {
                                                    // Allée centrale
                                                    return (
                                                        <div
                                                            key={`allee-${i}`}
                                                            className="w-3 flex items-center justify-center"
                                                        >
                                                            <div className="h-6 w-px bg-slate-600"></div>
                                                        </div>
                                                    )
                                                }
                                                return (
                                                    <div
                                                        key={i}
                                                        className="w-6 h-6 bg-blue-500 rounded-t-md opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold"
                                                        title={`${rangee.id}${num}`}
                                                    >
                                                        {num}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <span className="text-xs font-mono text-slate-500 w-6 text-left">{rangee.id}</span>
                                    </div>
                                )
                            })}
                        </div>

                        {configuration === 'french' && (
                            <div className="mt-6 text-xs text-slate-400 text-center">
                                <p>← Impairs (gauche) | Allée | Pairs (droite) →</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
