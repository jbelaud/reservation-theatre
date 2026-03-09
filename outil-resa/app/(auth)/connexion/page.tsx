'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ConnexionPage() {
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
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Erreur lors de la connexion')
                return
            }

            // Stocker le token
            localStorage.setItem('token', data.token)
            localStorage.setItem('association', JSON.stringify(data.association))

            // Redirect vers dashboard
            router.push('/dashboard')
            router.refresh()
        } catch (err) {
            console.error(err)
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-slate-50/50 to-white"></div>

            <div className="w-full max-w-md relative z-10 px-4">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mb-6">
                        <ArrowLeft className="h-4 w-4" />
                        Retour à l&apos;accueil
                    </Link>
                    <div className="flex justify-center mb-4">
                        <Image src="/icon.png" alt="Resavo Logo" width={48} height={48} className="rounded-xl shadow-lg" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Espace Association</h1>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl">Connexion</CardTitle>
                        <CardDescription>
                            Gérez vos spectacles et vos réservations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email professionnel</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="bg-white/50"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contact@votre-asso.fr"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <Link href="/mot-de-passe-oublie" className="text-xs text-primary hover:underline">
                                        Oublié ?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    className="bg-white/50"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-11" disabled={loading}>
                                {loading ? 'Connexion en cours...' : 'Se connecter'}
                            </Button>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-transparent px-2 text-slate-500">Nouveau sur Resavo ?</span>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 h-11" asChild>
                                <Link href="/#contact">Demander un accès</Link>
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                
                <p className="mt-8 text-center text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} Resavo. Tous droits réservés.
                </p>
            </div>
        </div>
    )
}
