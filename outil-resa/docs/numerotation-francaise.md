# 🎭 Numérotation Française des Sièges

## 🎯 Problématique

Dans les théâtres français, la numérotation des sièges suit une convention spécifique différente de la numérotation standard :

### ❌ Numérotation Standard (Internationale)
```
Scène
─────────────────────────────
Rangée A:  1  2  3  4  5  6  7  8  9  10
           ←──────────────────────────────→
           (Gauche vers Droite)
```

### ✅ Numérotation Française (Théâtres)
```
Scène
─────────────────────────────
Rangée A:  9  7  5  3  1  |  2  4  6  8  10
           ←─── Impairs      Allée      Pairs ──→
           (Gauche)                    (Droite)
```

**Principe** :
- Le siège **1** est au milieu, à gauche de l'allée centrale
- Les **impairs** (1, 3, 5, 7, 9...) vont vers la gauche
- Les **pairs** (2, 4, 6, 8, 10...) vont vers la droite
- Une allée centrale sépare les deux côtés

---

## ✅ Implémentation

### 1. Modification du Schéma Prisma

**Fichier** : `prisma/schema.prisma`

```prisma
model PlanSalle {
  id            String @id @default(cuid())
  nom           String @default("Salle principale")
  capaciteTotal Int    @default(100)
  structure     Json   // { rangees: [{ id: "A", sieges: 12 }] }
  configuration String @default("standard") // "standard" ou "french"
  
  associationId String @unique
  association   Association @relation(fields: [associationId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Migration** :
```bash
npx prisma migrate dev --name add_seating_configuration
```

---

### 2. Interface de Configuration

**Fichier** : `components/seating-plan-editor.tsx`

**Ajout d'un RadioGroup** :
- ✅ Option "Standard (1, 2, 3, 4...)"
- ✅ Option "Française (impairs/pairs)"
- ✅ Description explicative pour chaque option
- ✅ Info-bulle avec icône ℹ️

**Prévisualisation Dynamique** :
- Affichage des numéros sur chaque siège
- Allée centrale visible (ligne verticale) en mode français
- Légende : "← Impairs (gauche) | Allée | Pairs (droite) →"

---

### 3. Algorithme de Génération

**Logique** :

```typescript
const getSeatNumbers = (totalSeats: number, configuration: string) => {
  if (configuration === 'french') {
    // Impairs de droite à gauche (9, 7, 5, 3, 1)
    const odds = []
    for (let i = 1; i <= totalSeats; i += 2) {
      odds.push(i)
    }
    odds.reverse()
    
    // Pairs de gauche à droite (2, 4, 6, 8, 10)
    const evens = []
    for (let i = 2; i <= totalSeats; i += 2) {
      evens.push(i)
    }
    
    // Combiner : impairs + allée + pairs
    return [...odds, '|', ...evens]
  } else {
    // Standard : 1, 2, 3, 4...
    return Array.from({ length: totalSeats }, (_, i) => i + 1)
  }
}
```

**Exemple avec 10 sièges** :

| Configuration | Résultat |
|---------------|----------|
| Standard | `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]` |
| Française | `[9, 7, 5, 3, 1, '|', 2, 4, 6, 8, 10]` |

---

### 4. API Mise à Jour

**Fichier** : `app/api/plan-salle/route.ts`

**PATCH Endpoint** :
```typescript
const { structure, configuration } = body

await prisma.planSalle.update({
  where: { associationId },
  data: {
    structure,
    capaciteTotal,
    ...(configuration && { configuration })
  }
})
```

---

## 🎨 Affichage Visuel

### Mode Standard
```
Scène
─────────────────
A  [1][2][3][4][5][6][7][8][9][10]
B  [1][2][3][4][5][6][7][8][9][10]
```

### Mode Français
```
Scène
─────────────────
A  [9][7][5][3][1] | [2][4][6][8][10]
B  [9][7][5][3][1] | [2][4][6][8][10]
   ←─── Impairs      Pairs ──→
```

---

## 🔄 Impact sur les Autres Composants

### `SeatingPlanSelector` (À mettre à jour)
- ✅ Récupérer la configuration depuis l'API
- ✅ Afficher les sièges selon la configuration
- ✅ Générer les IDs de sièges correctement (ex: "A1", "A2"...)

### `trouverPlaces()` (Algorithme de placement)
- ⚠️ **À adapter** : L'algorithme doit tenir compte de la numérotation
- En mode français : Placer les groupes de manière logique
  - Exemple : Pour 3 places → A1, A3, A5 (côté impairs)
  - Ou : A2, A4, A6 (côté pairs)

---

## 📝 Cas d'Usage

### Théâtre avec Numérotation Française
**Exemple** : Théâtre Municipal de Bélaud

1. **Configuration initiale** :
   - Accès à `/dashboard/plan-salle`
   - Sélection "Française (impairs/pairs)"
   - Configuration des rangées (A, B, C...)
   - Sauvegarde

2. **Réservation** :
   - Client appelle : "Je voudrais 2 places au premier rang"
   - Association : Mode automatique
   - Système attribue : **A1, A3** (côté impairs, contiguës)

3. **Affichage** :
   - Plan de salle montre clairement l'allée centrale
   - Numéros visibles sur chaque siège
   - Facile de localiser "A1" (milieu gauche)

---

## ✅ Avantages

### Pour l'Association
1. **Conformité** : Respecte la convention française
2. **Clarté** : Les spectateurs comprennent mieux
3. **Flexibilité** : Choix entre standard et français

### Pour les Spectateurs
1. **Familiarité** : Convention connue dans les théâtres
2. **Localisation** : Facile de trouver son siège
3. **Logique** : Impairs/pairs = gauche/droite

---

## 🚀 Prochaines Étapes

### Court Terme
- [ ] Mettre à jour `SeatingPlanSelector` pour afficher la numérotation française
- [ ] Adapter l'algorithme `trouverPlaces()` pour la numérotation française
- [ ] Tester avec un plan de salle réel

### Moyen Terme
- [ ] Ajouter une option "Inverser" (impairs à droite, pairs à gauche)
- [ ] Permettre de configurer le numéro de départ (ex: commencer à 101)
- [ ] Support des balcons (numérotation différente)

### Long Terme
- [ ] Configuration par zone (orchestre, balcon, poulailler)
- [ ] Import de plans depuis un fichier CSV
- [ ] Générateur automatique de plan selon les dimensions

---

## 📚 Références

### Conventions Théâtrales Françaises
- Numérotation impairs/pairs standard depuis le 19ème siècle
- Utilisée dans la majorité des théâtres français
- Facilite la gestion des flux (entrée/sortie)

### Exemples de Théâtres
- Comédie-Française (Paris)
- Théâtre des Champs-Élysées
- Opéra Garnier
- La plupart des théâtres municipaux

---

**Date d'implémentation** : 3 décembre 2024  
**Statut** : ✅ Configuration et prévisualisation implémentées  
**À faire** : Adapter SeatingPlanSelector et algorithme de placement
