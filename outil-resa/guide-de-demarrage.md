🚀 Guide de Démarrage - Étapes de Développement
Phase 0 : Préparation (10 min)
1. Créer le repository GitHub
bash# Sur GitHub.com
Organisation: ets-belaud (ou ton compte perso)
Repo name: seatly-app (ou le nom que tu choisis)
Private
Initialize with: README.md
```

### 2. Créer compte Neon (DB gratuite)
```
1. Va sur https://neon.tech
2. Sign up avec contact@ets-belaud.com
3. Créer un projet: "outil-resa"
4. Copie la connection string (on l'utilisera plus tard)

Phase 1 : Setup Initial (30 min)
1. Créer le projet Next.js
bash# Dans ton dossier projets
cd ~/Projects/ets-belaud/

# Créer le projet Next.js
npx create-next-app@latest outil-resa

# Options à choisir:
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … No
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias? … No

cd seatly-app
2. Installer les dépendances
bash# Prisma
installer pnpm
pnpm install prisma @prisma/client
pnpm install -D prisma

# Auth & sécurité
pnpm install bcryptjs
pnpm install -D @types/bcryptjs
pnpm install jsonwebtoken
pnpm install -D @types/jsonwebtoken

# UI Components (shadcn/ui)
npx shadcn-ui@latest init

# Options shadcn:
✔ Would you like to use TypeScript? … yes
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? › app/globals.css
✔ Would you like to use CSS variables for colors? › yes
✔ Where is your tailwind.config.js located? › tailwind.config.ts
✔ Configure the import alias for components? › @/components
✔ Configure the import alias for utils? › @/lib/utils

# Composants dont tu auras besoin
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge

# Utilitaires
pnpm install date-fns  # Manipulation dates
pnpm install zod  # Validation formulaires
pnpm install react-hook-form  # Gestion forms
3. Setup Prisma
bash# Initialiser Prisma
npx prisma init

# Cela crée:
# - prisma/schema.prisma
# - .env (avec DATABASE_URL)
4. Configurer la base de données
bash# Ouvre .env
code .env
env# .env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/seatly?sslmode=require"
# ☝️ Colle l'URL de Neon ici

# Ajoute aussi:
JWT_SECRET="ton-secret-ultra-securise-change-moi-en-prod"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
5. Créer le schéma Prisma
bash# Ouvre prisma/schema.prisma
code prisma/schema.prisma
prisma// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Association {
  id              String   @id @default(cuid())
  nom             String
  slug            String   @unique
  email           String   @unique
  password        String
  telephone       String?
  
  // Licence
  licenceActive   Boolean  @default(true)  // true pour MVP (gratuit)
  licenceExpire   DateTime?
  
  // Customisation
  logo            String?
  couleurTheme    String   @default("#1e40af")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  representations Representation[]
  plansSalle      PlanSalle[]
  
  @@index([slug])
}

model PlanSalle {
  id            String @id @default(cuid())
  nom           String @default("Salle principale")
  capaciteTotal Int    @default(100)
  structure     Json   // { rangees: [{ id: "A", sieges: 12 }] }
  
  associationId String @unique  // Une asso = un plan pour MVP
  association   Association @relation(fields: [associationId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Representation {
  id          String   @id @default(cuid())
  titre       String   @default("Représentation")
  date        DateTime
  heure       String
  capacite    Int
  description String?  @db.Text
  
  placesOccupees Json   @default("[]")
  
  associationId  String
  association    Association @relation(fields: [associationId], references: [id], onDelete: Cascade)
  reservations   Reservation[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([associationId])
  @@index([date])
}

model Reservation {
  id          String   @id @default(cuid())
  prenom      String
  nom         String
  telephone   String
  email       String?
  nbPlaces    Int
  sieges      Json
  statut      String   @default("confirmé")
  notes       String?  @db.Text
  
  representationId String
  representation   Representation @relation(fields: [representationId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([representationId])
  @@index([telephone])
}
6. Créer et appliquer la migration
bash# Créer la première migration
npx prisma migrate dev --name init

# Cela va:
# 1. Créer les tables dans Neon
# 2. Générer le Prisma Client
# 3. Créer prisma/migrations/xxx_init/

# Générer le client Prisma (si besoin)
npx prisma generate
7. Tester la connexion DB
bash# Ouvrir Prisma Studio pour voir la DB
npx prisma studio

# Ouvre http://localhost:5555
# Tu devrais voir tes 4 tables vides
✅ CHECKPOINT 1 : DB configurée et accessible

Phase 2 : Structure du Projet (20 min)
1. Créer la structure des dossiers
bashmkdir -p app/api/auth/{signup,signin}
mkdir -p app/api/representations
mkdir -p app/api/reservations
mkdir -p app/api/plan-salle
mkdir -p app/\(auth\)/{inscription,connexion}
mkdir -p app/\(admin\)/dashboard/{representations,plan-salle,parametres}
mkdir -p app/\(public\)/\[slug\]
mkdir -p lib/{auth,prisma,utils}
mkdir -p components/{ui,forms,layouts}
2. Créer le Prisma singleton
bashcode lib/prisma.ts
typescript// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
3. Créer les utilitaires auth
bashcode lib/auth.ts
typescript// lib/auth.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(associationId: string): string {
  return jwt.sign({ associationId }, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): { associationId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { associationId: string }
  } catch {
    return null
  }
}

export function generateSlug(nom: string): string {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer espaces/caractères spéciaux par -
    .replace(/^-+|-+$/g, '') // Enlever - au début/fin
}
4. Créer l'algo de placement
bashcode lib/placement.ts
typescript// lib/placement.ts

interface PlanSalle {
  rangees: Array<{
    id: string
    sieges: number
  }>
}

export function trouverPlaces(
  nbPlaces: number,
  plan: PlanSalle,
  placesOccupees: string[]
): string[] | null {
  
  const placesLibres = new Set<string>()
  
  plan.rangees.forEach(rangee => {
    for (let i = 1; i <= rangee.sieges; i++) {
      const placeId = `${rangee.id}${i}`
      if (!placesOccupees.includes(placeId)) {
        placesLibres.add(placeId)
      }
    }
  })

  // Stratégie 1: Une seule rangée
  for (const rangee of plan.rangees) {
    const places = chercherConsecutifsCentre(rangee, nbPlaces, placesLibres)
    if (places.length === nbPlaces) {
      return places
    }
  }

  // Stratégie 2: Deux rangées si pair
  if (nbPlaces % 2 === 0 && nbPlaces <= 6) {
    const places = chercherSur2Rangees(plan, nbPlaces, placesLibres)
    if (places) return places
  }

  return null
}

function chercherConsecutifsCentre(
  rangee: { id: string; sieges: number },
  nbPlaces: number,
  placesLibres: Set<string>
): string[] {
  
  const centre = Math.ceil(rangee.sieges / 2)
  const ordreRecherche: number[] = []
  
  for (let offset = 0; offset < rangee.sieges; offset++) {
    if (centre - offset >= 1) {
      ordreRecherche.push(centre - offset)
    }
    if (centre + offset <= rangee.sieges && offset > 0) {
      ordreRecherche.push(centre + offset)
    }
  }

  for (const debut of ordreRecherche) {
    if (debut + nbPlaces - 1 > rangee.sieges) continue
    
    const places: string[] = []
    let valide = true
    
    for (let i = 0; i < nbPlaces; i++) {
      const placeId = `${rangee.id}${debut + i}`
      if (!placesLibres.has(placeId)) {
        valide = false
        break
      }
      places.push(placeId)
    }
    
    if (valide) return places
  }
  
  return []
}

function chercherSur2Rangees(
  plan: PlanSalle,
  nbPlaces: number,
  placesLibres: Set<string>
): string[] | null {
  
  const parRangee = nbPlaces / 2
  
  for (let i = 0; i < plan.rangees.length - 1; i++) {
    const rangee1 = plan.rangees[i]
    const rangee2 = plan.rangees[i + 1]
    
    const maxCol = Math.min(rangee1.sieges, rangee2.sieges)
    
    for (let col = 1; col <= maxCol - parRangee + 1; col++) {
      const places: string[] = []
      let valide = true
      
      for (let j = 0; j < parRangee; j++) {
        const place1 = `${rangee1.id}${col + j}`
        const place2 = `${rangee2.id}${col + j}`
        
        if (!placesLibres.has(place1) || !placesLibres.has(place2)) {
          valide = false
          break
        }
        places.push(place1, place2)
      }
      
      if (valide) return places
    }
  }
  
  return null
}
✅ CHECKPOINT 2 : Structure et utils créés

Phase 3 : Auth - Inscription/Connexion (1h)
1. API Signup
bashcode app/api/auth/signup/route.ts
typescript// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, generateSlug } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, email, password, slug: customSlug } = body

    // Validation basique
    if (!nom || !email || !password) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Vérifier email unique
    const existingEmail = await prisma.association.findUnique({
      where: { email }
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email déjà utilisé' },
        { status: 400 }
      )
    }

    // Générer ou vérifier slug
    const slug = customSlug || generateSlug(nom)
    const existingSlug = await prisma.association.findUnique({
      where: { slug }
    })
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Ce nom est déjà pris, choisissez-en un autre' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Créer association + plan de salle par défaut
    const association = await prisma.association.create({
      data: {
        nom,
        slug,
        email,
        password: hashedPassword,
        plansSalle: {
          create: {
            nom: 'Salle principale',
            capaciteTotal: 100,
            structure: {
              rangees: [
                { id: 'A', sieges: 12 },
                { id: 'B', sieges: 14 },
                { id: 'C', sieges: 14 },
                { id: 'D', sieges: 12 },
                { id: 'E', sieges: 12 },
                { id: 'F', sieges: 12 },
                { id: 'G', sieges: 12 },
                { id: 'H', sieges: 12 }
              ]
            }
          }
        }
      },
      include: {
        plansSalle: true
      }
    })

    // Générer token
    const token = generateToken(association.id)

    return NextResponse.json({
      association: {
        id: association.id,
        nom: association.nom,
        slug: association.slug,
        email: association.email
      },
      token
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
2. API Signin
bashcode app/api/auth/signin/route.ts
typescript// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Trouver l'association
    const association = await prisma.association.findUnique({
      where: { email }
    })

    if (!association) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier password
    const isValid = await verifyPassword(password, association.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Générer token
    const token = generateToken(association.id)

    return NextResponse.json({
      association: {
        id: association.id,
        nom: association.nom,
        slug: association.slug,
        email: association.email
      },
      token
    })

  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
3. Page d'inscription
bashcode app/\(auth\)/inscription/page.tsx
typescript// app/(auth)/inscription/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function InscriptionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nom: '',
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'inscription')
        return
      }

      // Stocker le token
      localStorage.setItem('token', data.token)
      localStorage.setItem('association', JSON.stringify(data.association))

      // Redirect vers dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Créer votre compte</CardTitle>
          <CardDescription>
            Commencez à gérer vos réservations en quelques minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom de votre association</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Théâtre Molière"
                required
              />
            </div>

            <div>
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

            <div>
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
              {loading ? 'Création...' : 'Créer mon compte'}
            </Button>

            <p className="text-sm text-center text-gray-600">
              Déjà inscrit ?{' '}
              <a href="/connexion" className="text-blue-600 hover:underline">
                Se connecter
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
4. Tester l'inscription
bash# Lancer le serveur
npm run dev

# Ouvrir http://localhost:3000/inscription
# Créer un compte test
# Vérifier dans Prisma Studio que l'asso est créée
npx prisma studio
✅ CHECKPOINT 3 : Auth fonctionnel

Phase 4 : Dashboard Basique (30 min)
1. Middleware de protection
bashcode middleware.ts
typescript// middleware.ts (à la racine)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Routes protégées
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL('/connexion', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
2. Page dashboard simple
bashcode app/\(admin\)/dashboard/page.tsx
typescript// app/(admin)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Prochaines représentations</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Réservations en attente</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Taux de remplissage moyen</h3>
          <p className="text-3xl font-bold">0%</p>
        </div>
      </div>
      
      <div className="mt-8">
        <a 
          href="/dashboard/representations" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Gérer mes représentations
        </a>
      </div>
    </div>
  )
}
✅ CHECKPOINT 4 : Dashboard accessible

Prochaines Étapes (à faire ensuite)
Phase 5 : CRUD Représentations

API POST /api/representations
Page créer représentation
Liste des représentations
Détails d'une représentation

Phase 6 : Réservation Publique

Page publique /[slug]
Formulaire réservation
Intégration algo placement
Page confirmation

Phase 7 : Gestion Réservations

Liste réservations dans admin
Marquer présent/absent
Ajout manuel
Export Excel


Commandes Utiles à Garder
bash# Dev
pnpm  dev                    # Lancer en dev
pnpm  build                  # Build production
pnpm  start                  # Lancer en prod

# Prisma
npx prisma studio              # Interface DB
npx prisma migrate dev         # Nouvelle migration
npx prisma generate            # Regénérer client
npx prisma db push             # Push sans migration (prototypage)
npx prisma db seed             # Seeder (à créer)

# Git
git add .
git commit -m "feat: auth system"
git push origin main

# Deploiement Vercel
vercel                         # Deploy
vercel --prod                 