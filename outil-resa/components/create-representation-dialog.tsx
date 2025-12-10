'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

const formSchema = z.object({
    titre: z.string().min(1, 'Le titre est requis'),
    dates: z.array(z.date()).min(1, 'Au moins une date est requise'),
    heure: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Heure invalide (format HH:MM)'),
    capacite: z.number().int().positive('La capacité doit être supérieure à 0'),
    description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CreateRepresentationDialogProps {
    onSuccess: () => void
}

export function CreateRepresentationDialog({ onSuccess }: CreateRepresentationDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            titre: '',
            dates: [],
            heure: '20:00',
            capacite: 100,
            description: '',
        },
    })

    const selectedDates = watch('dates') || []

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/representations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    dates: data.dates.map((d) => d.toISOString()),
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erreur lors de la création')
            }

            toast({
                title: 'Succès',
                description: `${data.dates.length} représentation(s) créée(s) avec succès`,
            })

            setOpen(false)
            reset()
            onSuccess()
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: error instanceof Error ? error.message : 'Une erreur est survenue',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const removeDate = (dateToRemove: Date) => {
        const newDates = selectedDates.filter(
            (d) => d.getTime() !== dateToRemove.getTime()
        )
        setValue('dates', newDates)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                    <Plus className="mr-2 h-5 w-5" />
                    <span className="font-semibold">Créer une représentation</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nouvelle représentation</DialogTitle>
                    <DialogDescription>
                        Créez une ou plusieurs représentations pour une même pièce.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {/* Titre */}
                    <div className="space-y-2">
                        <Label htmlFor="titre">Titre de la pièce</Label>
                        <Input
                            id="titre"
                            {...register('titre')}
                            placeholder="Ex: Roméo et Juliette"
                        />
                        {errors.titre && (
                            <p className="text-sm text-red-600">{errors.titre.message}</p>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                        <Label>Dates des représentations</Label>
                        <div className="flex flex-col gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            selectedDates.length === 0 && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDates.length > 0
                                            ? `${selectedDates.length} date(s) sélectionnée(s)`
                                            : 'Sélectionner des dates'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="multiple"
                                        selected={selectedDates}
                                        onSelect={(dates) => setValue('dates', dates || [])}
                                        initialFocus
                                        locale={fr}
                                    />
                                </PopoverContent>
                            </Popover>

                            {/* Liste des dates sélectionnées */}
                            {selectedDates.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedDates
                                        .sort((a, b) => a.getTime() - b.getTime())
                                        .map((date, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                                            >
                                                <span>{format(date, 'dd MMM yyyy', { locale: fr })}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDate(date)}
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                        {errors.dates && (
                            <p className="text-sm text-red-600">{errors.dates.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Heure */}
                        <div className="space-y-2">
                            <Label htmlFor="heure">Heure</Label>
                            <Input
                                id="heure"
                                type="time"
                                {...register('heure')}
                            />
                            {errors.heure && (
                                <p className="text-sm text-red-600">{errors.heure.message}</p>
                            )}
                        </div>

                        {/* Capacité */}
                        <div className="space-y-2">
                            <Label htmlFor="capacite">Capacité</Label>
                            <Input
                                id="capacite"
                                type="number"
                                {...register('capacite', { valueAsNumber: true })}
                                min="1"
                            />
                            {errors.capacite && (
                                <p className="text-sm text-red-600">{errors.capacite.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optionnel)</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Informations complémentaires..."
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Création...' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
