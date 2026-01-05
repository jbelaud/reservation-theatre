// app/(auth)/inscription/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Mail, AlertCircle } from 'lucide-react'

export default function InscriptionPage() {
    const router = useRouter()

    useEffect(() => {
        // Rediriger vers la page d'accueil après 5 secondes
        const timer = setTimeout(() => {
            router.push('/')
        }, 5000)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                        <CardTitle>Inscription fermée</CardTitle>
                    </div>
                    <CardDescription>
                        Les inscriptions se font uniquement sur demande
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                            L'inscription publique n'est plus disponible. Pour obtenir un accès à la plateforme Resavo,
                            veuillez nous contacter directement.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-900">
                            Vous êtes une association intéressée ?
                        </p>
                        <a
                            href="mailto:ets.belaud@gmail.com"
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                        >
                            <Mail className="w-5 h-5" />
                            ets.belaud@gmail.com
                        </a>
                    </div>

                    <div className="pt-4 border-t">
                        <Button
                            onClick={() => router.push('/')}
                            className="w-full"
                        >
                            Retour à l'accueil
                        </Button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Redirection automatique dans 5 secondes...
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
