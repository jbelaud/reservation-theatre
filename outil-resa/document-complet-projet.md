Outil de Réservation de Places - Documentation Complète


🎯 Concept
Un SaaS multi-tenant qui permet aux associations de théâtre (ou autres événements avec places assises) de :

- Gérer leurs représentations
- Permettre aux spectateurs de réserver en ligne simplement
- Placer automatiquement les spectateurs pour qu'ils soient côte à côte
- Gérer les présences le jour J
- Tout ça sans que les spectateurs créent de compte

Business model : Licence annuelle (~149€/an) par association (à rédéfinir)

🛠️ Stack Technique
Frontend
Next.js 15+ (App Router)

- Framework React full-stack
- Server Components pour performance
- API Routes intégrées
- SSR/SSG pour SEO
- pnpm
Pourquoi : Tout-en-un, rapide à développer, parfait pour SaaS


Tailwind CSS + shadcn/ui

- Tailwind : Utility-first CSS
- shadcn/ui : Composants React pré-construits (calendrier, formulaires, modals)
Pourquoi : Design rapide, cohérent, customisable

TypeScript

- Type-safety partout
Pourquoi : Moins de bugs, meilleure DX, scalabilité

Backend
- Next.js API Routes

Routes API directement dans Next.js (app/api/)
Pourquoi : Pas besoin de serveur séparé

Prisma ORM

- ORM moderne pour Node.js
- Migrations automatiques
- Type-safety avec TypeScript
Pourquoi : Simple, puissant, parfait avec Next.js

PostgreSQL

Base de données relationnelle
- Neon
Pourquoi : Robuste, gratuit au démarrage, JSON support

Auth & Sécurité
- NextAuth.js (ou simple JWT)

Authentication pour les associations
- Sessions sécurisées
Pourquoi : Standard Next.js, facile à configurer

bcrypt

- Hash des mots de passe
Pourquoi : Sécurité de base

Hébergement
Vercel

- Hosting Next.js optimisé
-CI/CD automatique (push GitHub → deploy)
-SSL gratuit
- Plan gratuit puis Pro à 20$/mois
Pourquoi : Créé par l'équipe Next.js, zero-config

Neon ou Railway

- PostgreSQL serverless
- Gratuit pour commencer
Pourquoi : Pas de gestion serveur, scale auto

Optionnel (Phase 2)

Paiements abonnements (si pas virement manuel)
- Pour le paiement de la licence, les associations feront à virement directement sur mon compte en banque pro pour éviter tous les frais stripe. --> Il faudra juste créer un rappel 1 mois avant la fin de la licence annuelle

Resend

Emails transactionnels (confirmations)

Sentry

Monitoring erreurs




🏗️ Architecture de l'Application
Architecture Multi-tenant
Chaque association a :

Son compte (email/password)
Son slug unique → URL personnalisée
Ses représentations
Ses réservations
Son nombre de spectateur
Son plan de salle -> il faut que l'association puisse gérer le nombres de places par rangée et le nombre de rangée pour le calcul automatique des places

Association "Théâtre Molière"
├── Slug: theatre-moliere
├── URL publique: tonapp.com/theatre-moliere
├── URL admin: tonapp.com/dashboard (après connexion)
├── Plan de salle: 4 rangées de 12 sièges
└── Représentations:
    ├── 15 nov 2025 - 20h30 (45 places réservées)
    └── 22 nov 2025 - 20h30 (32 places réservées)
Schéma de Base de Données
prisma// schema.prisma

model Association {
  id              String   @id @default(cuid())
  nom             String   // "Théâtre Molière"
  slug            String   @unique  // "theatre-moliere"
  email           String   @unique
  password        String   // bcrypt hash
  telephone       String?
  
  // Licence
  licenceActive   Boolean  @default(false)
  licenceExpire   DateTime?
  
  // Customisation
  logo            String?  // URL Cloudinary ou upload
  couleurTheme    String   @default("#1e40af")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  representations Representation[]
  plansSalle      PlanSalle[]
}

model PlanSalle {
  id            String @id @default(cuid())
  nom           String @default("Salle principale")
  capaciteTotal Int    @default(100)
  
  // Structure: JSON pour simplicité MVP
  // Exemple: { "rangees": [{ "id": "A", "sieges": 12 }, { "id": "B", "sieges": 14 }] }
  structure     Json
  
  associationId String
  association   Association @relation(fields: [associationId], references: [id], onDelete: Cascade)
  
  @@index([associationId])
}

model Representation {
  id          String   @id @default(cuid())
  titre       String   @default("Représentation")  // Ex: "Le Malade Imaginaire"
  date        DateTime
  heure       String   // "20:30" (string pour simplicité)
  capacite    Int      // Ex: 100
  description String?  // Optionnel
  
  // Places occupées stockées en JSON (simple pour MVP)
  // Exemple: ["A1", "A2", "B5", "C3"]
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
  
  // Infos spectateur
  nom         String
  prenom      String
  telephone   String
  email       String?  // Optionnel
  
  nbPlaces    Int
  
  // Sièges attribués: ["A1", "A2"] ou ["B3", "C3"]
  sieges      Json
  
  statut      String   @default("confirmé")  // confirmé, présent, annulé
  
  representationId String
  representation   Representation @relation(fields: [representationId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@index([representationId])
  @@index([telephone])
}
```

**Pourquoi ce schéma ?**
- **Simple** : Pas de sur-ingénierie
- **JSON pour places** : Flexibilité (pas besoin de table Siège)
- **Cascade delete** : Supprime asso → tout est supprimé
- **Index** : Performance sur les requêtes fréquentes

---

## 📱 Fonctionnalités Détaillées

### Côté Association (Admin)

**1. Inscription/Connexion**
```
POST /api/auth/signup
{
  nom: "Théâtre Molière",
  slug: "theatre-moliere",  // Généré auto ou choisi
  email: "contact@theatre-moliere.fr",
  password: "********"
}
```
- Vérif slug unique
- Hash password
- Création association + plan salle par défaut

**2. Dashboard**
```
/dashboard
- Vue d'ensemble: prochaines représentations
- Statistiques: taux de remplissage
- Accès rapides
```

**3. Gestion des Représentations**
```
/dashboard/representations
- Liste toutes les représentations (futures + passées)
- Filtres: date, statut
- Actions: créer, modifier, supprimer
```

**Créer une représentation** :
```
/dashboard/representations/nouvelle

Formulaire:
- Titre (optionnel): "Le Malade Imaginaire"
- Date: sélecteur calendrier
- Heure: input time
- Capacité: nombre (pré-rempli par plan de salle)
- Description (optionnel)

→ Crée la représentation avec placesOccupees = []
```

**Voir détail représentation** :
```
/dashboard/representations/[id]

Affiche:
- Infos représentation
- Plan de salle visuel (places occupées en rouge)
- Liste réservations:
  ┌─────────────────────────────────────────────┐
  │ Dupont Jean - 0612345678                   │
  │ 3 places: A5, A6, A7                       │
  │ Statut: Confirmé [Marquer présent]         │
  └─────────────────────────────────────────────┘
  
- Bouton: Ajouter réservation manuelle
- Export Excel
```

**Ajout manuel** :
```
Modal avec formulaire identique au public
Permet à l'asso d'ajouter des spectateurs par téléphone
```

**4. Configuration Plan de Salle**
```
/dashboard/plan-salle

Interface simple:
┌────────────────────────────────┐
│ Rangée A: [12] sièges  [X]     │
│ Rangée B: [14] sièges  [X]     │
│ Rangée C: [14] sièges  [X]     │
│ Rangée D: [12] sièges  [X]     │
│                                 │
│ [+ Ajouter rangée]              │
│                                 │
│ Total: 52 places                │
│ [Enregistrer]                   │
└────────────────────────────────┘
```

**5. Paramètres**
```
/dashboard/parametres
- Logo (upload)
- Couleur thème (color picker)
- Informations contact
- URL publique: tonapp.com/theatre-moliere [Copier]
```

### Côté Spectateur (Public)

**1. Page d'accueil association**
```
GET /[slug]
Ex: tonapp.com/theatre-moliere

Affiche:
- Logo + nom association
- Liste des représentations disponibles:

  ┌───────────────────────────────────────────┐
  │ 📅 Vendredi 15 novembre 2025 - 20h30     │
  │ "Le Malade Imaginaire"                    │
  │ 47 places disponibles / 100               │
  │ [Réserver]                                │
  └───────────────────────────────────────────┘
  
  ┌───────────────────────────────────────────┐
  │ 📅 Samedi 16 novembre 2025 - 20h30       │
  │ "Le Malade Imaginaire"                    │
  │ 89 places disponibles / 100               │
  │ [Réserver]                                │
  └───────────────────────────────────────────┘
```

**2. Formulaire de Réservation**
```
GET /[slug]/reserver/[representationId]

┌─────────────────────────────────────────────┐
│ Réservation - Vendredi 15 novembre 20h30   │
├─────────────────────────────────────────────┤
│                                             │
│ Prénom: [____________]                      │
│ Nom: [____________]                         │
│ Téléphone: [____________]                   │
│ Email (optionnel): [____________]           │
│                                             │
│ Nombre de places:                           │
│ ○ 1   ○ 2   ○ 3   ○ 4   ○ 5+              │
│                                             │
│ [Réserver mes places]                       │
└─────────────────────────────────────────────┘

Flow:
1. Spectateur remplit formulaire
2. Click "Réserver"
3. Backend:
   - Vérifie dispo
   - Algo trouve meilleures places côte à côte
   - Crée réservation
   - Met à jour placesOccupees
4. Redirect vers confirmation
```

**3. Page de Confirmation**
```
GET /[slug]/confirmation/[reservationId]

┌─────────────────────────────────────────────┐
│ ✅ Réservation confirmée !                  │
├─────────────────────────────────────────────┤
│                                             │
│ Jean DUPONT                                 │
│ 3 places réservées                          │
│                                             │
│ Vos sièges:                                 │
│ 🪑 A5 - A6 - A7                            │
│                                             │
│ Vendredi 15 novembre 2025 à 20h30          │
│ Théâtre Molière                             │
│                                             │
│ 💳 Paiement sur place                       │
│                                             │
│ ℹ️ Présentez-vous 15 min avant             │
│                                             │
│ [Imprimer]  [Retour]                        │
└─────────────────────────────────────────────┘

🧠 Algorithme de Placement (Cœur du Système)
Objectif
Placer N spectateurs côte à côte automatiquement en priorisant :

Mêmes rangée (ex: A5-A6-A7)
Si impossible, 2 rangées alignées (ex: A5-A6 + B5-B6)
Places centrales > latérales

Code Détaillé
typescript// lib/placement.ts

interface PlanSalle {
  rangees: Array<{
    id: string;      // "A", "B", "C"
    sieges: number;  // 12, 14, etc.
  }>;
}

interface PlacementResult {
  places: string[];  // ["A5", "A6", "A7"]
  succes: boolean;
}

/**
 * Trouve les meilleures places pour un groupe
 */
export function trouverPlaces(
  nbPlaces: number,
  plan: PlanSalle,
  placesOccupees: string[]
): PlacementResult {
  
  // Créer Set des places libres pour O(1) lookup
  const placesLibres = new Set<string>();
  
  plan.rangees.forEach(rangee => {
    for (let i = 1; i <= rangee.sieges; i++) {
      const placeId = `${rangee.id}${i}`;
      if (!placesOccupees.includes(placeId)) {
        placesLibres.add(placeId);
      }
    }
  });

  // Stratégie 1: Chercher sur une seule rangée (priorité)
  for (const rangee of plan.rangees) {
    const places = chercherConsecutifsCentre(rangee, nbPlaces, placesLibres);
    if (places.length === nbPlaces) {
      return { places, succes: true };
    }
  }

  // Stratégie 2: Si 2, 4 ou 6 places → essayer 2 rangées
  if (nbPlaces % 2 === 0 && nbPlaces <= 6) {
    const places = chercherSur2Rangees(plan, nbPlaces, placesLibres);
    if (places) {
      return { places, succes: true };
    }
  }

  // Pas de place trouvée
  return { places: [], succes: false };
}

/**
 * Cherche places consécutives en commençant du centre
 */
function chercherConsecutifsCentre(
  rangee: { id: string; sieges: number },
  nbPlaces: number,
  placesLibres: Set<string>
): string[] {
  
  const centre = Math.ceil(rangee.sieges / 2);
  
  // Pattern de recherche depuis le centre vers extérieur
  // Ex rangée de 12: [6, 5, 7, 4, 8, 3, 9, 2, 10, 1, 11, 12]
  const ordreRecherche: number[] = [];
  for (let offset = 0; offset < rangee.sieges; offset++) {
    if (centre - offset >= 1) {
      ordreRecherche.push(centre - offset);
    }
    if (centre + offset <= rangee.sieges && offset > 0) {
      ordreRecherche.push(centre + offset);
    }
  }

  // Pour chaque position de départ possible
  for (const debut of ordreRecherche) {
    if (debut + nbPlaces - 1 > rangee.sieges) continue;
    
    const places: string[] = [];
    let valide = true;
    
    for (let i = 0; i < nbPlaces; i++) {
      const placeId = `${rangee.id}${debut + i}`;
      if (!placesLibres.has(placeId)) {
        valide = false;
        break;
      }
      places.push(placeId);
    }
    
    if (valide) return places;
  }
  
  return [];
}

/**
 * Cherche places sur 2 rangées adjacentes (même colonne)
 * Ex: 4 places → A5, A6, B5, B6
 */
function chercherSur2Rangees(
  plan: PlanSalle,
  nbPlaces: number,
  placesLibres: Set<string>
): string[] | null {
  
  const parRangee = nbPlaces / 2;
  
  // Pour chaque paire de rangées adjacentes
  for (let i = 0; i < plan.rangees.length - 1; i++) {
    const rangee1 = plan.rangees[i];
    const rangee2 = plan.rangees[i + 1];
    
    const maxCol = Math.min(rangee1.sieges, rangee2.sieges);
    const centre = Math.ceil(maxCol / 2);
    
    // Pattern depuis le centre
    for (let offset = 0; offset < maxCol; offset++) {
      const colonnes = [centre - offset, centre + offset].filter(
        c => c >= 1 && c <= maxCol - parRangee + 1
      );
      
      for (const col of colonnes) {
        const places: string[] = [];
        let valide = true;
        
        // Vérifier parRangee colonnes consécutives sur 2 rangées
        for (let j = 0; j < parRangee; j++) {
          const place1 = `${rangee1.id}${col + j}`;
          const place2 = `${rangee2.id}${col + j}`;
          
          if (!placesLibres.has(place1) || !placesLibres.has(place2)) {
            valide = false;
            break;
          }
          
          places.push(place1, place2);
        }
        
        if (valide) return places;
      }
    }
  }
  
  return null;
}
Exemples d'utilisation
Exemple 1: 3 places
typescriptPlan: A(12), B(14), C(14), D(12)
Occupé: ["A1", "A2", "A10", "A11", "A12", "B7", "B8"]

trouverPlaces(3, plan, occupées)
→ ["A6", "A7", "A8"]  // Trouve au centre de A
Exemple 2: 4 places (2 rangées)
typescriptPlan: A(12), B(14)
Occupé: ["A5", "A6", "A7", "A8", "A9"]  // Centre A bloqué

trouverPlaces(4, plan, occupées)
→ ["B6", "B7", "C6", "C7"]  // 2 rangées alignées
Exemple 3: Complet
typescriptPlan: A(12), B(12)
Occupé: 20 places déjà prises

trouverPlaces(5, plan, occupées)
→ []  // Pas assez de places consécutives
```

---

## 🔄 Flows Utilisateur Complets

### Flow 1: Association crée première représentation
```
1. Inscription
   POST /api/auth/signup
   → Création compte + plan salle par défaut
   
2. Login
   POST /api/auth/signin
   → Session créée
   
3. Config plan (optionnel)
   PATCH /api/plan-salle
   { rangees: [...] }
   
4. Créer représentation
   POST /api/representations
   {
     titre: "Le Malade Imaginaire",
     date: "2025-11-15T20:30:00Z",
     capacite: 52
   }
   → Représentation créée
   
5. Partager lien
   Copie: tonapp.com/theatre-moliere
```

### Flow 2: Spectateur réserve
```
1. Visite URL
   GET /theatre-moliere
   → Affiche liste représentations
   
2. Choisit date
   Click [Réserver]
   → GET /theatre-moliere/reserver/[id]
   
3. Remplit formulaire
   {
     prenom: "Jean",
     nom: "Dupont",
     telephone: "0612345678",
     nbPlaces: 3
   }
   
4. Soumission
   POST /api/reservations
   Backend:
   ┌─────────────────────────────────────┐
   │ 1. Vérifie capacité restante        │
   │ 2. Appelle trouverPlaces(3, ...)    │
   │ 3. Crée Reservation                 │
   │ 4. Update placesOccupees            │
   │ 5. Retourne reservation.id          │
   └─────────────────────────────────────┘
   
5. Confirmation
   GET /theatre-moliere/confirmation/[resaId]
   → Affiche sièges attribués
```

### Flow 3: Jour de la représentation
```
1. Association ouvre dashboard
   GET /dashboard/representations/[id]
   → Liste toutes les réservations
   
2. Pour chaque spectateur qui arrive:
   ┌────────────────────────────────┐
   │ Dupont Jean - 0612345678       │
   │ 3 places: A5, A6, A7           │
   │ [✓ Marquer présent]            │
   └────────────────────────────────┘
   
   Click → PATCH /api/reservations/[id]
   { statut: "présent" }
   
3. En fin de soirée:
   Export Excel avec liste présents/absents

🚀 Routes API Complètes
Auth
typescript// app/api/auth/signup/route.ts
POST /api/auth/signup
Body: { nom, slug, email, password }
Return: { association, token }

// app/api/auth/signin/route.ts
POST /api/auth/signin
Body: { email, password }
Return: { association, token }
Représentations
typescript// app/api/representations/route.ts
GET /api/representations
Headers: Authorization
Return: Representation[]

POST /api/representations
Headers: Authorization
Body: { titre, date, heure, capacite }
Return: Representation

// app/api/representations/[id]/route.ts
GET /api/representations/[id]
Headers: Authorization
Return: Representation + Reservation[]

PATCH /api/representations/[id]
Headers: Authorization
Body: { titre?, date?, heure? }
Return: Representation

DELETE /api/representations/[id]
Headers: Authorization
Return: { success: true }
Réservations
typescript// app/api/reservations/route.ts
POST /api/reservations
Body: { 
  representationId,
  prenom,
  nom,
  telephone,
  nbPlaces 
}
Process:
1. Vérifie capacité
2. Appelle algo placement
3. Crée réservation
4. Update placesOccupees
Return: { reservation, sieges }

// app/api/reservations/[id]/route.ts
PATCH /api/reservations/[id]
Headers: Authorization
Body: { statut: "présent" | "annulé" }
Return: Reservation
Plan de salle
typescript// app/api/plan-salle/route.ts
GET /api/plan-salle
Headers: Authorization
Return: PlanSalle

PATCH /api/plan-salle
Headers: Authorization
Body: { structure: { rangees: [...] } }
Return: PlanSalle

📊 Données d'exemple
json// Association
{
  "id": "clx123",
  "nom": "Théâtre Molière",
  "slug": "theatre-moliere",
  "email": "contact@moliere.fr",
  "licenceActive": true,
  "licenceExpire": "2025-12-31T23:59:59Z",
  "couleurTheme": "#8b5cf6"
}

// Plan Salle
{
  "id": "clx456",
  "nom": "Salle principale",
  "capaciteTotal": 52,
  "structure": {
    "rangees": [
      { "id": "A", "sieges": 12 },
      { "id": "B", "sieges": 14 },
      { "id": "C", "sieges": 14 },
      { "id": "D", "sieges": 12 }
    ]
  }
}

// Représentation
{
  "id": "clx789",
  "titre": "Le Malade Imaginaire",
  "date": "2025-11-15T20:30:00Z",
  "heure": "20:30",
  "capacite": 52,
  "placesOccupees": ["A1", "A2", "A3", "B5", "B6"],
  "associationId": "clx123"
}

// Réservation
{
  "id": "clx999",
  "prenom": "Jean",
  "nom": "Dupont",
  "telephone": "0612345678",
  "nbPlaces": 3,
  "sieges": ["A5", "A6", "A7"],
  "statut": "confirmé",
  "representationId": "clx789",
  "createdAt": "2025-11-01T14:32:00Z"
}

✅ Checklist MVP
Semaine 1 - Fondations

 Setup Next.js + TypeScript + Tailwind
 Setup Prisma + PostgreSQL (Neon)
 Schéma DB complet
 Auth system (signup/signin)
 Middleware protection routes admin
 Système multi-tenant (slug routing)

Semaine 2 - Fonctionnalités Core

 CRUD Représentations (admin)
 Config plan de salle (admin)
 Algo placement automatique
 Page publique liste représentations
 Formulaire réservation + confirmation
 API complètes

Semaine 3 - UI/UX & Polish

 Dashboard avec stats
 Plan de salle visuel (SVG)
 Liste réservations avec filtres
 Marquer présent/absent
 Export Excel
 Responsive mobile
 Tests utilisateur

Bonus

 Email confirmation (Resend)
 PDF ticket
 QR Code pour check-in
 Statistiques avancées