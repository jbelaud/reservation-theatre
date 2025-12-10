// components/representation-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const formSchema = z.object({
    titre: z.string().min(1, 'Le titre est requis'),
    date: z.date({ message: 'La date est requise' }),
    heure: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Heure invalide (format HH:MM)'),
    capacite: z.number().int().positive('La capacité doit être supérieure à 0'),
    description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface RepresentationFormProps {
    initialData?: Partial<Omit<FormData, 'date'>> & { date?: string | Date }
    onSubmit: (data: FormData) => Promise<void>
    onCancel: () => void
    submitLabel?: string
}

export function RepresentationForm({
    initialData,
    onSubmit,
    onCancel,
    submitLabel = 'Créer',
}: RepresentationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            titre: initialData?.titre || '',
            date: initialData?.date ? new Date(initialData.date) : undefined,
            heure: initialData?.heure || '20:00',
            capacite: initialData?.capacite || 100,
            description: initialData?.description || '',
        },
    })

    const selectedDate = watch('date')

    const onFormSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        try {
            await onSubmit(data)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Titre */}
            <div className="space-y-2">
                <Label htmlFor="titre">Titre de la représentation</Label>
                <Input
                    id="titre"
                    {...register('titre')}
                    placeholder="Ex: Roméo et Juliette"
                />
                {errors.titre && (
                    <p className="text-sm text-red-600">{errors.titre.message}</p>
                )}
            </div>

            {/* Date */}
            <div className="space-y-2">
                <Label>Date de la représentation</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'w-full justify-start text-left font-normal',
                                !selectedDate && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                                format(selectedDate, 'PPP', { locale: fr })
                            ) : (
                                <span>Sélectionner une date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => setValue('date', date as Date)}
                            initialFocus
                            locale={fr}
                        />
                    </PopoverContent>
                </Popover>
                {errors.date && (
                    <p className="text-sm text-red-600">{errors.date.message}</p>
                )}
            </div>

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
                <Label htmlFor="capacite">Capacité (nombre de places)</Label>
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

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Informations complémentaires sur la représentation..."
                    rows={4}
                />
                {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? 'En cours...' : submitLabel}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Annuler
                </Button>
            </div>
        </form>
    )
}
