# 🎭 Audit UX - Page Plan de Salle

## 📊 État Actuel

### ✅ Points Forts
1. **Interface simple** : Formulaire clair avec rangées/sièges
2. **Prévisualisation en temps réel** : Visualisation immédiate des changements
3. **Calcul automatique** : Capacité totale mise à jour dynamiquement
4. **Design cohérent** : Suit le style général de l'application

### ⚠️ Points Faibles Identifiés

#### 1. **Manque de Contexte**
- ❌ Pas de lien clair avec les représentations
- ❌ Pas d'indication sur l'impact des modifications
- ❌ Pas de warning si des réservations existent déjà

#### 2. **Visualisation Limitée**
- ❌ Aperçu basique (juste des carrés bleus)
- ❌ Pas de numérotation visible des sièges
- ❌ Pas de possibilité de voir les places occupées
- ❌ Pas de légende explicative

#### 3. **Workflow Non Optimal**
- ❌ Page isolée, pas intégrée au flux de réservation
- ❌ Pas de possibilité de réserver depuis le plan
- ❌ Pas de vue "Plan de salle par représentation"

---

## 🎯 Recommandations d'Amélioration

### 🔴 Priorité Haute - Intégration avec les Réservations

#### A. Deux Modes d'Utilisation du Plan de Salle

**Mode 1 : Configuration Globale** (actuel)
- Page `/dashboard/plan-salle`
- Définir la structure de base de la salle
- Utilisé comme template pour toutes les représentations

**Mode 2 : Vue par Représentation** (nouveau)
- Accessible depuis `/dashboard/representations/[id]`
- Affiche le plan avec les places occupées/libres
- Permet la réservation manuelle en cliquant sur les sièges

#### B. Workflow de Réservation Manuelle

**Scénario : L'association reçoit un appel téléphonique**

**Option 1 : Placement Automatique (Recommandé - 80% des cas)**
```
1. Clic sur "Ajouter une réservation" (depuis n'importe où)
2. Sélection de la représentation
3. Saisie : Nom, Prénom, Téléphone, Nombre de places
4. L'algorithme trouve automatiquement les meilleures places
5. Affichage : "Places attribuées : A5, A6, A7"
6. Confirmation
```
**Avantages** :
- ✅ Rapide (moins de 30 secondes)
- ✅ Optimise le remplissage
- ✅ Pas de risque d'erreur
- ✅ Parfait pour les personnes âgées

**Option 2 : Placement Manuel (Avancé - 20% des cas)**
```
1. Accès au détail de la représentation
2. Clic sur "Voir le plan de salle"
3. Activation du mode "Réservation manuelle"
4. Clic sur les sièges souhaités (changent de couleur)
5. Saisie : Nom, Prénom, Téléphone
6. Confirmation
```
**Cas d'usage** :
- Client VIP qui demande des places spécifiques
- Groupe qui veut être au premier rang
- Personne à mobilité réduite (places adaptées)

---

## 🎨 Améliorations Visuelles

### 1. Plan de Salle Interactif

#### Légende Claire
```
🟢 Libre (vert)
🔴 Occupé (rouge)
🔵 Sélectionné (bleu)
⚪ Désactivé (gris)
🟡 Réservé par vous (jaune) - pour voir ses propres réservations
```

#### Informations au Survol
- **Siège libre** : "A5 - Cliquez pour réserver"
- **Siège occupé** : "A5 - Réservé par Jean Dupont (0612345678)"
- **Siège sélectionné** : "A5 - Sélectionné (cliquez pour annuler)"

#### Numérotation Visible
```
    1  2  3  4  5  6  7  8  9  10
A  🟢 🟢 🔴 🔴 🔴 🟢 🟢 🟢 🟢 🟢
B  🟢 🟢 🟢 🔴 🔴 🔴 🟢 🟢 🟢 🟢
C  🟢 🟢 🟢 🟢 🔴 🔴 🔴 🟢 🟢 🟢
```

### 2. Fonctionnalités Avancées

#### Zoom et Navigation
- Boutons +/- pour zoomer
- Drag pour déplacer la vue
- Fit to screen pour tout voir

#### Filtres et Recherche
- "Afficher uniquement les places libres"
- "Rechercher une réservation" (highlight les sièges)
- "Afficher les meilleures places disponibles" (algorithme)

#### Actions Rapides
- Double-clic sur un siège libre → Formulaire de réservation
- Clic droit → Menu contextuel (Réserver, Désactiver, Infos)
- Sélection multiple → Drag pour sélectionner plusieurs sièges

---

## 🔄 Intégration avec le Workflow Global

### Page Représentation - Détail

**Ajout d'un onglet "Plan de salle"**
```
┌─────────────────────────────────────────┐
│ [Informations] [Réservations] [Plan]   │
├─────────────────────────────────────────┤
│                                         │
│  [Plan de salle interactif]             │
│                                         │
│  Légende : 🟢 Libre  🔴 Occupé          │
│                                         │
│  [Ajouter réservation manuelle]         │
│  [Afficher les meilleures places]       │
│                                         │
└─────────────────────────────────────────┘
```

### Page Réservations

**Ajout d'une colonne "Places"**
```
┌──────────────────────────────────────────────────┐
│ Nom      │ Téléphone  │ Places │ Sièges         │
├──────────────────────────────────────────────────┤
│ Dupont   │ 0612...    │ 3      │ A5, A6, A7     │
│ Martin   │ 0698...    │ 2      │ B3, B4         │
└──────────────────────────────────────────────────┘
```

**Action : Clic sur les sièges**
→ Ouvre le plan de salle avec les sièges highlightés

---

## 💡 Recommandation Finale

### Pour les Utilisateurs Non Techniques (Personnes Âgées)

**Stratégie : Placement Automatique par Défaut**

1. **Simplifier au maximum** : 
   - Formulaire de réservation avec 4 champs seulement
   - Bouton "Ajouter une réservation" bien visible
   - Pas de choix de places (automatique)

2. **Option avancée cachée** :
   - Checkbox "Choisir les places manuellement" (décoché par défaut)
   - Si coché → Affiche le plan de salle
   - Tooltip : "💡 Laissez l'algorithme choisir pour gagner du temps"

3. **Confirmation visuelle** :
   - Après réservation : "✅ Réservation confirmée"
   - Affichage des sièges : "Places attribuées : A5, A6, A7"
   - Bouton "Voir sur le plan" (optionnel)

### Pour les Utilisateurs Avancés

**Accès direct au plan de salle**
- Depuis le détail de la représentation
- Mode "Réservation manuelle" activable
- Toutes les fonctionnalités avancées disponibles

---

## 🚀 Plan d'Implémentation

### Phase 1 - Court Terme (Immédiat)
✅ **Améliorer la page Plan de Salle actuelle**
- Ajouter une légende claire
- Améliorer la prévisualisation (numéros visibles)
- Ajouter un warning si des réservations existent

### Phase 2 - Moyen Terme (1-2 semaines)
🔄 **Créer le plan de salle par représentation**
- Nouveau composant `SeatingPlanViewer`
- Affichage des places libres/occupées
- Intégration dans le détail de la représentation

### Phase 3 - Long Terme (1 mois)
🎯 **Réservation manuelle depuis le plan**
- Mode "Réservation manuelle" activable
- Sélection des sièges par clic
- Formulaire contextuel

---

## 📋 Checklist de Validation

### Critères de Succès
- [ ] Un utilisateur peut créer une réservation en moins de 30 secondes
- [ ] Le plan de salle est compréhensible sans formation
- [ ] Les places occupées sont clairement visibles
- [ ] L'algorithme de placement fonctionne dans 95% des cas
- [ ] Le mode manuel est accessible mais pas intrusif
- [ ] Les personnes âgées peuvent utiliser l'outil sans aide

### Tests Utilisateurs
1. **Test avec une personne de 65+ ans** :
   - Scénario : "Ajoutez une réservation pour 3 personnes"
   - Temps cible : < 1 minute
   - Taux de réussite : > 90%

2. **Test avec un utilisateur avancé** :
   - Scénario : "Réservez les places A1, A2, A3 pour un client VIP"
   - Temps cible : < 45 secondes
   - Taux de réussite : 100%

---

## 🎓 Formation Recommandée

### Vidéo Tutoriel 1 : "Ajouter une réservation par téléphone" (60s)
1. Clic sur "Ajouter une réservation"
2. Remplir le formulaire
3. Validation
4. Confirmation avec les sièges attribués

### Vidéo Tutoriel 2 : "Choisir des places spécifiques" (90s)
1. Accès au détail de la représentation
2. Clic sur "Plan de salle"
3. Activation du mode manuel
4. Sélection des sièges
5. Validation

### Document PDF : "Guide de Référence Rapide"
- Checklist pour le jour J
- Raccourcis clavier
- FAQ

---

**Dernière mise à jour** : 3 décembre 2024
**Auteur** : Audit UX/UI Resavo - Plan de Salle
