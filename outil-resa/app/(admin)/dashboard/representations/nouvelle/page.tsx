// app/(admin)/dashboard/representations/nouvelle/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RepresentationForm } from '@/components/representation-form'

export default function NouvelleRepresentationPage() {
    const router = useRouter()

    const handleSubmit = async (data: any) => {
        try {
            const response = await fetch('/api/representations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    titre: data.titre,
                    date: data.date.toISOString(),
                    heure: data.heure,
                    capacite: data.capacite,
                    description: data.description,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erreur lors de la création')
            }

            // Redirection vers la liste
            router.push('/dashboard/representations')
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Une erreur est survenue')
            throw error
        }
    }

    const handleCancel = () => {
        router.push('/dashboard/representations')
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <Button
                variant="ghost"
                onClick={handleCancel}
                className="mb-6"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
            </Button>

            <div className="bg-white rounded-lg border p-8">
                <h1 className="text-3xl font-bold mb-2">Nouvelle représentation</h1>
                <p className="text-gray-600 mb-8">
                    Créez une nouvelle représentation pour votre association
                </p>

                <RepresentationForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    submitLabel="Créer la représentation"
                />
            </div>
        </div>
    )
}
