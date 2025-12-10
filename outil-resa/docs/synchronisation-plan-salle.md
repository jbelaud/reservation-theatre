# Synchronisation Automatique du Plan de Salle

## Problème Résolu

Lorsque le plan de salle était modifié, les représentations existantes gardaient leur ancienne capacité. Cela créait une incohérence entre :
- La capacité du plan de salle (ex: 200 places)
- La capacité des représentations déjà créées (ex: 100 places)

## Solution Implémentée

### Synchronisation Automatique

Quand le plan de salle est sauvegardé, le système met maintenant à jour **automatiquement** :

1. ✅ **Le plan de salle** avec la nouvelle structure et capacité
2. ✅ **TOUTES les représentations existantes** avec la nouvelle capacité

### Fonctionnement Technique

#### API (`app/api/plan-salle/route.ts`)

```typescript
// 1. Calculer la nouvelle capacité
const capaciteTotal = structure.rangees.reduce(
    (acc, row) => acc + (row.sieges || 0),
    0
)

// 2. Mettre à jour le plan de salle
const plan = await prisma.planSalle.update({
    where: { associationId },
    data: { structure, capaciteTotal, configuration }
})

// 3. Synchroniser TOUTES les représentations
const updatedRepresentations = await prisma.representation.updateMany({
    where: { associationId },
    data: { capacite: capaciteTotal }
})

// 4. Retourner le nombre de représentations mises à jour
return NextResponse.json({
    ...plan,
    representationsUpdated: updatedRepresentations.count
})
```

#### Interface Utilisateur

Le message de confirmation affiche maintenant :
```
✅ Plan sauvegardé
Capacité mise à jour : 200 places • 5 représentation(s) synchronisée(s)
```

## Exemples d'Utilisation

### Scénario 1 : Augmentation de la Capacité

**Avant :**
- Plan de salle : 100 places
- Représentation "Tartuffe" : 100 places

**Action :** Ajout de 5 rangées de 20 sièges → 200 places

**Après (automatique) :**
- Plan de salle : 200 places ✅
- Représentation "Tartuffe" : 200 places ✅

### Scénario 2 : Diminution de la Capacité

**Avant :**
- Plan de salle : 200 places
- Représentation "Molière" : 200 places

**Action :** Suppression de rangées → 150 places

**Après (automatique) :**
- Plan de salle : 150 places ✅
- Représentation "Molière" : 150 places ✅

### Scénario 3 : Nouvelle Salle (0 places)

**Avant :**
- Plan de salle : 100 places (ancien)
- 3 représentations : 100 places chacune

**Action :** Réinitialisation à 0 places

**Après (automatique) :**
- Plan de salle : 0 places ✅
- 3 représentations : 0 places chacune ✅
- Message : "3 représentation(s) synchronisée(s)"

## Avantages

✅ **Cohérence garantie** : Plus jamais de décalage entre plan de salle et représentations
✅ **Automatique** : Aucune action manuelle requise
✅ **Transparent** : L'utilisateur est informé du nombre de représentations mises à jour
✅ **Sécurisé** : Toutes les représentations de l'association sont synchronisées

## Cas Particuliers

### Représentations avec Réservations

⚠️ **Important** : Si des places sont déjà réservées et que la capacité diminue, les réservations existantes sont conservées. Le système ne supprime jamais automatiquement des réservations.

**Exemple :**
- Capacité : 200 places
- 50 places réservées
- Nouvelle capacité : 150 places
- Résultat : Les 50 réservations restent valides

### Nouvelles Représentations

Les nouvelles représentations créées **après** la modification du plan de salle utiliseront automatiquement la nouvelle capacité.

## Script de Migration

Pour les bases de données existantes, un script de réinitialisation est disponible :

```bash
npx tsx scripts/reset-plan-salle.ts
```

Ce script :
1. Réinitialise le plan de salle à 0 places
2. Met à jour toutes les représentations à 0 places
3. Vide les réservations

## Workflow Recommandé

1. **Configurer le plan de salle** en premier
2. **Créer les représentations** ensuite
3. Si modification du plan : toutes les représentations sont **automatiquement synchronisées** ✨

## Conclusion

Cette fonctionnalité garantit que votre plan de salle et vos représentations sont toujours parfaitement synchronisés, sans aucune intervention manuelle ! 🎉
