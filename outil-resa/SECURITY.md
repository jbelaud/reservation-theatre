# 🔒 Guide de Sécurité - Application de Réservation

## Variables d'Environnement Requises

### ⚠️ CRITIQUE - À configurer AVANT le déploiement

```bash
# JWT Secret (OBLIGATOIRE)
# Générer avec: openssl rand -base64 32
JWT_SECRET=votre-secret-jwt-tres-long-et-aleatoire-minimum-32-caracteres

# Base de données PostgreSQL (Neon)
DATABASE_URL=postgresql://user:password@host/database

# Cloudinary (pour les uploads d'images)
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret

# Environnement
NODE_ENV=production
```

## ✅ Corrections de Sécurité Appliquées

### 1. JWT_SECRET Obligatoire
- ❌ **Avant**: Secret par défaut si variable non définie
- ✅ **Après**: Application refuse de démarrer sans JWT_SECRET

**Impact**: Empêche le forgery de tokens JWT

### 2. Rate Limiting
- **Connexion Association**: 5 tentatives / 15 minutes par IP
- **Connexion Admin**: 3 tentatives / 15 minutes par IP (plus strict)

**Impact**: Protection contre les attaques par force brute

### 3. Logs Sensibles Retirés
- Emails, tokens et chemins ne sont plus loggés en production
- Logs détaillés uniquement en développement (`NODE_ENV=development`)

**Impact**: Pas d'exposition d'informations sensibles dans les logs

### 4. Validation Stricte (Zod)
- **Email**: Format email valide requis
- **Mot de passe**: Minimum 8 caractères
- **Téléphone**: Format français validé (0612345678 ou +33612345678)
- **Réservations**: Maximum 10 places par réservation

**Impact**: Protection contre les injections et données malformées

## 🚀 Checklist Avant Déploiement

### Obligatoire
- [ ] Générer un JWT_SECRET fort (32+ caractères aléatoires)
- [ ] Configurer DATABASE_URL avec Neon
- [ ] Vérifier que NODE_ENV=production
- [ ] Tester la connexion avec rate limiting
- [ ] Vérifier que les logs sensibles ne s'affichent pas

### Recommandé
- [ ] Configurer Cloudinary pour les uploads
- [ ] Activer les backups automatiques sur Neon
- [ ] Configurer un monitoring (Sentry)
- [ ] Mettre en place un système d'alertes

## 🔐 Bonnes Pratiques

### Génération de JWT_SECRET
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: En ligne (utiliser un site sécurisé)
# https://generate-secret.vercel.app/32
```

### Rotation des Secrets
- Changer JWT_SECRET tous les 6 mois minimum
- En cas de compromission suspectée, changer immédiatement
- Invalider toutes les sessions actives après rotation

### Monitoring
- Surveiller les tentatives de connexion échouées
- Alerter si rate limit dépassé fréquemment
- Logger les actions admin (création/suppression d'associations)

## 📊 Rate Limiting - Détails Techniques

### Implémentation
- **Type**: En mémoire (Map JavaScript)
- **Nettoyage**: Automatique toutes les 10 minutes
- **Identifiant**: IP (x-forwarded-for ou x-real-ip)

### Headers de Réponse
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1706134800000
Retry-After: 900 (en cas de dépassement)
```

### Migration vers Redis (Production à grande échelle)
Si vous avez plusieurs instances Vercel, migrer vers Redis:
```bash
pnpm add @upstash/ratelimit @upstash/redis
```

## 🛡️ Protection Multi-Tenant

### Isolation des Données
- Chaque requête filtre par `associationId`
- Middleware vérifie le token avant accès au dashboard
- Validation de propriété sur toutes les mutations

### Recommandations Futures
1. **Row Level Security (RLS)** dans PostgreSQL
2. **Audit trail** pour tracer toutes les actions
3. **Tests automatisés** pour vérifier l'isolation

## 📝 Conformité RGPD

### Données Collectées
- **Associations**: nom, email, téléphone, slug
- **Réservations**: prénom, nom, téléphone, email (optionnel)

### Droits des Utilisateurs
- **Droit à l'oubli**: Supprimer les réservations via le dashboard
- **Export de données**: Fonction d'export Excel disponible
- **Consentement**: Politique de confidentialité à ajouter

### À Implémenter
- [ ] Politique de confidentialité visible
- [ ] Consentement cookies (si analytics)
- [ ] Procédure de notification en cas de breach
- [ ] Durée de conservation des données (RGPD Article 5)

## 🚨 En Cas d'Incident de Sécurité

### Procédure
1. **Isoler**: Mettre l'application en maintenance
2. **Analyser**: Identifier la faille et l'étendue
3. **Corriger**: Patcher la vulnérabilité
4. **Notifier**: Informer les utilisateurs si données exposées (RGPD)
5. **Documenter**: Rapport post-mortem

### Contacts
- **Admin**: ets.belaud@gmail.com
- **Hébergement**: Vercel Support
- **Base de données**: Neon Support

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [RGPD - CNIL](https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on)

---

**Dernière mise à jour**: 24 janvier 2026
**Version**: 1.0.0
