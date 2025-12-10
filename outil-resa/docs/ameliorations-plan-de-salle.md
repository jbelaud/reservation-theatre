# Améliorations du Plan de Salle

## Date : 2025-12-04

## Problème Initial
Le système de plan de salle était trop long à remplir :
- Il fallait ajouter chaque rangée une par une
- Modifier chaque nombre de sièges individuellement
- Pour une salle de 1000 places, l'interface était surchargée et difficile à utiliser

## Solutions Implémentées

### 1. **Ajout Rapide de Rangées** 🚀
- Nouvelle section "Ajout rapide de rangées" avec fond violet/bleu
- Permet de créer plusieurs rangées identiques en une seule fois
- Deux champs :
  - **Nombre de rangées** : Combien de rangées créer (ex: 10)
  - **Sièges par rangée** : Nombre de sièges pour chaque rangée (ex: 20)
- Bouton dynamique qui affiche : "Ajouter X rangée(s) de Y sièges"

**Exemple d'utilisation :**
- Pour une salle de 1000 places avec 50 rangées de 20 sièges
- Avant : 50 clics + 50 modifications = 100 actions
- Maintenant : 2 champs + 1 clic = **3 actions** ✨

### 2. **Modification Globale** ✏️
- Nouvelle section "Modification globale" avec fond ambre/orange
- Permet d'appliquer le même nombre de sièges à toutes les rangées existantes
- Utile pour uniformiser rapidement toutes les rangées

**Exemple d'utilisation :**
- Vous avez créé 50 rangées de 20 sièges
- Vous voulez passer à 22 sièges partout
- Avant : Modifier 50 fois individuellement
- Maintenant : 1 champ + 1 clic = **2 actions** ✨

### 3. **Modification Individuelle** 🎯
- Les rangées individuelles restent modifiables
- Parfait pour les cas particuliers (ex: dernière rangée avec 2 places de plus/moins)
- Chaque rangée peut être ajustée indépendamment

### 4. **Interface Compacte avec Sélecteurs** 📦

#### Type de Numérotation
- **Avant** : Radio buttons qui prenaient beaucoup de place
- **Maintenant** : Select dropdown compact
- Options :
  - Standard (1, 2, 3, 4...)
  - Française (impairs/pairs)
- Info contextuelle qui s'adapte au choix

#### Rangées Individuelles
- **Avant** : Toutes les rangées affichées en même temps (problème pour 50+ rangées)
- **Maintenant** : Accordion collapsible
- Badge affichant le nombre total de rangées
- Peut être ouvert/fermé pour économiser l'espace
- Chaque rangée a un fond gris clair avec effet hover

## Workflow Recommandé

### Pour créer un nouveau plan de salle :

1. **Choisir le type de numérotation** (Standard ou Française)

2. **Ajout rapide** :
   - Entrer le nombre de rangées (ex: 10)
   - Entrer le nombre de sièges par rangée (ex: 20)
   - Cliquer sur "Ajouter 10 rangées de 20 sièges"

3. **Ajustements globaux** (optionnel) :
   - Si besoin de modifier toutes les rangées
   - Utiliser la modification globale

4. **Ajustements individuels** (optionnel) :
   - Ouvrir l'accordion "Rangées individuelles"
   - Modifier les rangées spécifiques qui ont des particularités
   - Ex: Dernière rangée avec 18 sièges au lieu de 20

5. **Enregistrer** la configuration

## Avantages

✅ **Gain de temps massif** : De 100+ actions à 3-5 actions pour une grande salle
✅ **Interface harmonieuse** : Utilisation de sélecteurs au lieu de longs formulaires
✅ **Scalable** : Fonctionne aussi bien pour 10 places que 1000 places
✅ **Flexible** : Combine rapidité (ajout/modification globale) et précision (modification individuelle)
✅ **UX améliorée** : Cartes colorées, badges, accordéon, transitions fluides

## Composants Techniques Ajoutés

- `@radix-ui/react-accordion` : Pour l'accordion collapsible
- `components/ui/accordion.tsx` : Composant Accordion de shadcn/ui
- Animations CSS : `accordion-up` et `accordion-down`
- Icônes : `Zap` (ajout rapide), `Edit3` (modification globale)

## Compatibilité

- ✅ Compatible avec la numérotation Standard
- ✅ Compatible avec la numérotation Française
- ✅ Prévisualisation en temps réel
- ✅ Sauvegarde de la configuration complète
