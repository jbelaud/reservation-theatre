# Seatly App

Outil de Réservation de Places pour Associations de Théâtre.

## Concept
Un SaaS multi-tenant qui permet aux associations de théâtre de :
- Gérer leurs représentations
- Permettre aux spectateurs de réserver en ligne
- Placer automatiquement les spectateurs
- Gérer les présences et les paiements de licence

## Fonctionnalités Clés
- **Dashboard Admin** : Vue globale, gestion des associations, suivi des licences annuelles.
- **Dashboard Association** : Gestion des spectacles, réservations, et état de la licence.
- **Réservation Publique** : Interface utilisateur pour choisir ses places.

## Stack Technique
- **Frontend**: Next.js 15+, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL (Neon)
- **Auth**: Custom JWT
- **Paiements** : Système de suivi des licences (virements)

## Déploiement
Le projet est déployé sur Vercel avec une base de données Neon (PostgreSQL).
Les migrations de base de données sont gérées automatiquement via Prisma lors du build.
