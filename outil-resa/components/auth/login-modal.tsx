'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface LoginModalProps {
    children?: React.ReactNode
}

export function LoginModal({ children }: LoginModalProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
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

            // Fermer la modale et rediriger
            setOpen(false)
            router.push('/dashboard')
            router.refresh()
        } catch (err) {
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button size="lg">Connexion</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Connexion</DialogTitle>
                    <DialogDescription>
                        Connectez-vous à votre espace de gestion
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
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
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
