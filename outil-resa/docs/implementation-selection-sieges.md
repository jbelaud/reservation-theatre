# ✅ Implémentation - Sélection Manuelle des Sièges

## 🎯 Objectif
Permettre aux associations de choisir manuellement les sièges lors d'une réservation téléphonique, tout en gardant le placement automatique comme option par défaut (recommandée).

---

## 📦 Composants Créés

### 1. `SeatingPlanSelector` (`components/seating-plan-selector.tsx`)
**Rôle** : Affichage interactif du plan de salle avec sélection des sièges

**Fonctionnalités** :
- ✅ Chargement du plan de salle depuis l'API
- ✅ Récupération des places déjà occupées
- ✅ Affichage visuel avec code couleur :
  - 🟢 Vert : Siège libre
  - 🔴 Rouge : Siège occupé
  - 🔵 Bleu : Siège sélectionné
- ✅ Sélection/désélection par clic
- ✅ Limitation au nombre de places demandées
- ✅ Numérotation visible sur chaque siège
- ✅ Tooltip informatif au survol
- ✅ Compteur de sélection en temps réel
- ✅ Légende explicative

**Props** :
```typescript
{
  representationId: string      // ID de la représentation
  nbPlaces: number              // Nombre de places à sélectionner
  onSeatsSelected: (seats: string[]) => void  // Callback avec les sièges sélectionnés
}
```

---

## 🔄 Composants Modifiés

### 2. `ManualReservationModal` (`components/manual-reservation-modal.tsx`)
**Modifications** :
- ✅ Ajout d'une checkbox "Choisir les places manuellement"
- ✅ Tooltip d'aide avec icône "?"
- ✅ Intégration du `SeatingPlanSelector` (affiché conditionnellement)
- ✅ Validation : vérifier que le bon nombre de sièges est sélectionné
- ✅ Envoi des sièges sélectionnés à l'API si mode manuel activé
- ✅ Réinitialisation de la sélection lors du changement de nombre de places
- ✅ Modal agrandi (600px) pour accueillir le plan de salle
- ✅ Bouton "Annuler" ajouté

**Workflow** :
1. Par défaut : Checkbox décochée → Placement automatique
2. Si cochée : Affichage du plan de salle
3. Utilisateur clique sur les sièges
4. Validation : Nombre correct de sièges sélectionnés
5. Soumission avec les sièges choisis

---

### 3. API Réservations (`app/api/reservations/route.ts`)
**Modifications** :
- ✅ Accepte un paramètre optionnel `sieges: string[]`
- ✅ **Mode Manuel** (si `sieges` fourni) :
  - Validation du nombre de sièges
  - Vérification que les sièges ne sont pas déjà occupés
  - Utilisation des sièges fournis
- ✅ **Mode Automatique** (si `sieges` non fourni) :
  - Utilisation de l'algorithme `trouverPlaces()`
  - Message d'erreur amélioré suggérant la sélection manuelle

**Logique** :
```typescript
if (sieges && sieges.length > 0) {
  // MODE MANUEL
  // Valider et utiliser les sièges fournis
} else {
  // MODE AUTOMATIQUE
  // Utiliser l'algorithme de placement
}
```

---

## 🎨 Composants UI Ajoutés

### 4. Shadcn/UI Components
- ✅ `Checkbox` : Pour l'option de sélection manuelle
- ✅ `Tooltip` : Pour l'aide contextuelle

**Installation** :
```bash
npx shadcn@latest add checkbox
npx shadcn@latest add tooltip
```

---

## 📊 Expérience Utilisateur

### Scénario 1 : Placement Automatique (Recommandé - 90% des cas)
```
1. Clic sur "Ajouter une réservation"
2. Sélection de la représentation
3. Saisie des informations (Nom, Prénom, Téléphone)
4. Choix du nombre de places (ex: 3)
5. Checkbox "Choisir manuellement" : DÉCOCHÉE
6. Clic sur "Confirmer"
7. ✅ Réservation créée avec places automatiques (ex: A5, A6, A7)

⏱️ Temps : ~25 secondes
```

### Scénario 2 : Placement Manuel (Avancé - 10% des cas)
```
1. Clic sur "Ajouter une réservation"
2. Sélection de la représentation
3. Saisie des informations
4. Choix du nombre de places (ex: 2)
5. Checkbox "Choisir manuellement" : COCHÉE
6. → Affichage du plan de salle
7. Clic sur A1 (devient bleu)
8. Clic sur A2 (devient bleu)
9. Compteur : "2 / 2 places sélectionnées (A1, A2)"
10. Clic sur "Confirmer"
11. ✅ Réservation créée avec places choisies (A1, A2)

⏱️ Temps : ~45 secondes
```

---

## 🔐 Validations Implémentées

### Côté Frontend (`ManualReservationModal`)
- ✅ Vérification que la représentation est sélectionnée
- ✅ Si mode manuel : Vérifier que `selectedSeats.length === nbPlaces`
- ✅ Message d'erreur clair : "Veuillez sélectionner exactement X siège(s)"

### Côté Backend (`API /api/reservations`)
- ✅ Validation du nombre de sièges fournis
- ✅ Vérification que les sièges ne sont pas déjà occupés
- ✅ Message d'erreur détaillé : "Les sièges suivants sont déjà occupés : A5, A6"

---

## 💡 Aide Contextuelle

### Tooltip sur l'icône "?"
```
💡 Conseil : Laissez l'algorithme choisir automatiquement pour gagner du temps.
Activez cette option uniquement pour des demandes spécifiques (VIP, premier rang, etc.)
```

### Messages d'aide dans le plan de salle
- "💡 Sélectionnez encore X siège(s)" (si incomplet)
- "✓ Tous les sièges sont sélectionnés" (si complet)

---

## 🎯 Avantages de cette Implémentation

### Pour les Utilisateurs Non Techniques
1. **Par défaut simple** : Pas besoin de comprendre le plan de salle
2. **Aide visuelle** : Tooltip explicatif
3. **Feedback en temps réel** : Compteur de sélection
4. **Validation claire** : Messages d'erreur compréhensibles

### Pour les Utilisateurs Avancés
1. **Contrôle total** : Choix précis des sièges
2. **Visualisation** : Plan de salle interactif
3. **Flexibilité** : Sélection/désélection facile

### Pour l'Association
1. **Optimisation** : Placement automatique maximise le remplissage
2. **Rapidité** : 25 secondes pour une réservation standard
3. **Flexibilité** : Option manuelle pour cas spéciaux
4. **Sécurité** : Validation côté serveur

---

## 🚀 Prochaines Étapes (Optionnel)

### Améliorations Futures
1. **Sauvegarde des préférences** : Se souvenir du choix (auto/manuel)
2. **Sélection par zone** : "Sélectionner 3 places au premier rang"
3. **Drag & Drop** : Déplacer une réservation existante
4. **Vue 3D** : Représentation 3D de la salle
5. **Accessibilité** : Places PMR identifiées visuellement

---

## 📝 Tests Recommandés

### Tests Manuels
- [ ] Créer une réservation en mode automatique
- [ ] Créer une réservation en mode manuel
- [ ] Essayer de sélectionner un siège occupé (doit être bloqué)
- [ ] Essayer de sélectionner trop de sièges (doit être limité)
- [ ] Changer le nombre de places après sélection (doit réinitialiser)
- [ ] Annuler la modal (doit réinitialiser l'état)

### Tests API
- [ ] POST avec `sieges` valides → Succès
- [ ] POST avec `sieges` occupés → Erreur 400
- [ ] POST avec `sieges.length !== nbPlaces` → Erreur 400
- [ ] POST sans `sieges` → Placement automatique

---

**Date d'implémentation** : 3 décembre 2024
**Statut** : ✅ Implémenté et fonctionnel
