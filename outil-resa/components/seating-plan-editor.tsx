'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, Armchair, Info, Zap, Edit3, ChevronDown, Accessibility } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface Rangee {
    id: string
    sieges: number
    pmr?: number[] // Liste des numéros de sièges PMR (ex: [1, 2, 20])
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
    const totalPmr = rangees.reduce((acc, r) => acc + (r.pmr?.length || 0), 0)

    // State pour les inputs PMR (permet de taper "1-5" sans que ça se convertisse immédiatement)
    const [pmrInputs, setPmrInputs] = useState<Record<number, string>>(() => {
        const initial: Record<number, string> = {}
        initialStructure.rangees?.forEach((r, i) => {
            initial[i] = r.pmr?.join(', ') || ''
        })
        return initial
    })

    const handleAddRow = () => {
        // Générer ID suivant (A, B, C...)
        const lastId = rangees.length > 0 ? rangees[rangees.length - 1].id : '@' // @ est avant A
        const nextId = String.fromCharCode(lastId.charCodeAt(0) + 1)
        const newIndex = rangees.length

        setRangees([...rangees, { id: nextId, sieges: 10, pmr: [] }])
        setPmrInputs(prev => ({ ...prev, [newIndex]: '' }))
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
            newRangees.push({ id: nextId, sieges: seats, pmr: [] })
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

    const handleChangePmr = (index: number, value: string) => {
        // Mettre à jour l'input brut
        setPmrInputs(prev => ({ ...prev, [index]: value }))
    }

    // Parser et appliquer les valeurs PMR au blur
    const handlePmrBlur = (index: number) => {
        const value = pmrInputs[index] || ''
        const pmrSeats: number[] = []

        const parts = value.split(',')

        parts.forEach(part => {
            part = part.trim()
            if (part.includes('-')) {
                // Gestion des plages (ex: 1-5, 5-12)
                const [start, end] = part.split('-').map(n => parseInt(n))
                if (!isNaN(start) && !isNaN(end) && start <= end) {
                    for (let i = start; i <= end; i++) {
                        pmrSeats.push(i)
                    }
                }
            } else {
                // Gestion des nombres simples
                const num = parseInt(part)
                if (!isNaN(num) && num > 0) {
                    pmrSeats.push(num)
                }
            }
        })

        // Supprimer les doublons et trier
        const uniqueSeats = Array.from(new Set(pmrSeats)).sort((a, b) => a - b)

        const oldPmrCount = rangees[index].pmr?.length || 0
        const newPmrCount = uniqueSeats.length

        // Calculer la différence pour ajuster le nombre de sièges
        // Si on ajoute 1 PMR, on enlève 1 siège (car 1 PMR = 2 places, dont 1 déjà comptée dans le nombre total)
        // Donc si différence positive (+X PMR), on réduit le nombre de sièges de X
        // Si différence négative (-X PMR), on rajoute X sièges (on libère de l'espace)
        const delta = newPmrCount - oldPmrCount

        const newRangees = [...rangees]
        if (delta !== 0) {
            const newSeatCount = Math.max(1, newRangees[index].sieges - delta)
            // S'assurer qu'on ne descend pas en dessous du max PMR défini
            // (Ex: si on a seat 10 défini comme PMR, on ne peut pas avoir moins de 10 sièges logiquement 
            // SAUF si le user veut juste réduire la capacité "physique" mais garder le numéro. 
            // Mais ici on parle de "places" disponibles.
            // On garde la logique simple demandée : "enlever une place à côté"
            newRangees[index].sieges = newSeatCount
        }

        newRangees[index].pmr = uniqueSeats
        setRangees(newRangees)

        // Mettre à jour l'affichage avec le format propre
        setPmrInputs(prev => ({ ...prev, [index]: uniqueSeats.join(', ') }))
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

    // Fonction helper pour formatter l'affichage des sièges PMR (ex: [1,2,3] -> "1-3")
    const formatPmrDisplay = (pmrList: number[] | undefined) => {
        if (!pmrList || pmrList.length === 0) return ''

        // Pour l'instant, on affiche simplement la liste, améliorer si besoin
        // L'utilisateur peut saisir "1-5", mais on stocke [1,2,3,4,5].
        // Si on veut réafficher "1-5", il faudrait une logique inverse complexe.
        // Pour l'instant, on laisse l'utilisateur voir la liste complète ou on garde l'input tel quel.
        // Problème : l'input value est lié à `rangee.pmr` qui est number[].
        // SOLUTION SIMPLE : On affiche la liste séparée par des virgules pour l'instant.
        return pmrList.join(', ')
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 pb-32">
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
                                        Définissez les sièges et les places PMR. Vous pouvez utiliser des plages (ex: "1-5").
                                    </p>
                                    {rangees.map((rangee, index) => (
                                        <div key={index} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-start gap-3">
                                                <div className="w-20">
                                                    <Label className="text-xs">Rangée</Label>
                                                    <Input
                                                        value={rangee.id}
                                                        onChange={(e) => handleChangeId(index, e.target.value)}
                                                        className="font-bold text-center bg-white"
                                                        maxLength={2}
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div>
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
                                                    <div>
                                                        <Label className="text-xs flex items-center gap-1 text-purple-700">
                                                            <Accessibility className="h-3 w-3" /> Sièges PMR
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            value={pmrInputs[index] || ''}
                                                            onChange={(e) => handleChangePmr(index, e.target.value)}
                                                            onBlur={() => handlePmrBlur(index)}
                                                            placeholder="Ex: 1,2 ou 5-12"
                                                            className="bg-white text-sm"
                                                        />
                                                    </div>
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
                        <div className="flex flex-col gap-1 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Capacité totale :</span>
                                <span className="text-xl font-bold text-blue-600">{totalPlaces} places</span>
                            </div>
                            {totalPmr > 0 && (
                                <div className="flex justify-between items-center text-sm text-purple-700">
                                    <span className="flex items-center gap-1"><Accessibility className="h-3 w-3" /> Dont PMR :</span>
                                    <span className="font-semibold">{totalPmr} places</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bouton sticky en bas */}
            <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t shadow-lg p-4 z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold text-blue-600">{totalPlaces}</span> places
                        {totalPmr > 0 && (
                            <span className="ml-2 text-purple-600">
                                (<Accessibility className="h-3 w-3 inline-block" /> {totalPmr} PMR)
                            </span>
                        )}
                    </div>
                    <Button className="px-8" onClick={handleSave} disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? 'Enregistrement...' : 'Enregistrer la configuration'}
                    </Button>
                </div>
            </div>

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

                                                const isPmr = typeof num === 'number' && rangee.pmr?.includes(num)

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`w-6 h-6 rounded-t-md opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold ${isPmr ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
                                                            }`}
                                                        title={`${rangee.id}${num} ${isPmr ? '(PMR)' : ''}`}
                                                    >
                                                        {isPmr ? <Accessibility className="h-3 w-3" /> : num}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <span className="text-xs font-mono text-slate-500 w-6 text-left">{rangee.id}</span>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-8 flex gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                <span>Standard</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                                <span>PMR (Mobilité Réduite)</span>
                            </div>
                        </div>

                        {configuration === 'french' && (
                            <div className="mt-2 text-xs text-slate-400 text-center">
                                <p>← Impairs (gauche) | Allée | Pairs (droite) →</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
