'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/admin/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Erreur lors de la connexion')
                return
            }

            // Redirect vers dashboard admin
            router.push('/admin/dashboard')
            router.refresh()
        } catch (err) {
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <Card className="w-full max-w-md border-gray-800 bg-gray-950 text-gray-100">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-gray-800 p-3 rounded-full w-fit mb-4">
                        <ShieldCheck className="w-8 h-8 text-indigo-500" />
                    </div>
                    <CardTitle className="text-2xl text-white">Administration Resavo</CardTitle>
                    <CardDescription className="text-gray-400">
                        Accès réservé aux administrateurs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="admin@resavo.com"
                                required
                                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 focus:border-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-300">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                required
                                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 focus:border-indigo-500"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded border border-red-900/50">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            disabled={loading}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="absolute top-8 left-8">
                <Button asChild variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800">
                    <Link href="/">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour au site
                    </Link>
                </Button>
            </div>
        </div>
    )
}
