'use client'

import { LoginModal } from '@/components/auth/login-modal'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-12 p-8 max-w-4xl">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/resavo-logo.png"
              alt="Resavo"
              className="h-32 w-auto object-contain"
            />
          </div>
          <h2 className="text-3xl font-semibold text-gray-700">
            Gestion des réservations de spectacles
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simplifiez la gestion de vos réservations avec notre outil intuitif et professionnel
          </p>
        </div>

        {/* CTA Section */}
        <div className="space-y-6">
          <LoginModal>
            <Button size="lg" className="w-64 text-lg h-14">
              Connexion
            </Button>
          </LoginModal>

          {/* Contact Section */}
          <div className="pt-8 border-t border-gray-300 mt-8">
            <p className="text-lg text-gray-700 mb-4">
              Vous êtes une association intéressée par cet outil ?
            </p>
            <a
              href="mailto:ets-belaud@gmail.com"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-lg transition-colors"
            >
              <Mail className="w-5 h-5" />
              ets-belaud@gmail.com
            </a>
            <p className="text-sm text-gray-500 mt-2">
              Contactez-nous pour obtenir un accès à la plateforme
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 pt-8">
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Simple</h3>
            <p className="text-sm text-gray-600">Interface intuitive et facile à prendre en main</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Efficace</h3>
            <p className="text-sm text-gray-600">Gérez vos réservations en temps réel</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Personnalisé</h3>
            <p className="text-sm text-gray-600">Adaptez l'outil à vos besoins spécifiques</p>
          </div>
        </div>
      </div>
    </div>
  )
}
