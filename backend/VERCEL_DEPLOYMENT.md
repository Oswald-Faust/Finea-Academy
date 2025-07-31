# Guide de Déploiement Vercel - Backend Finéa Académie

## 🚨 Résolution de l'erreur 500: INTERNAL_SERVER_ERROR

Cette erreur est généralement causée par des problèmes de configuration. Suivez ce guide pour résoudre le problème.

## 📋 Variables d'Environnement Requises

Allez dans **Settings > Environment Variables** de votre projet Vercel et ajoutez ces variables :

### Variables Obligatoires

```bash
# Configuration MongoDB (CRITIQUE)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finea_academie

# Configuration JWT (CRITIQUE)
JWT_SECRET=votre_secret_jwt_tres_securise_minimum_32_caracteres
JWT_EXPIRE=30d

# Configuration Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application

# Configuration Production
NODE_ENV=production
PORT=5000

# URLs Frontend
FRONTEND_URL=https://finea-admin.vercel.app
FLUTTER_APP_URL=https://finea-academie.vercel.app
```

### Variables Optionnelles

```bash
# Configuration Vercel
VERCEL_URL=https://finea-backend.vercel.app
VERCEL=1
```

## 🔧 Étapes de Déploiement

### 1. Vérification des Variables d'Environnement

**⚠️ PROBLÈME PRINCIPAL** : Les variables d'environnement ne sont pas configurées sur Vercel.

1. Connectez-vous à [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `finea-backend`
3. Allez dans **Settings** > **Environment Variables**
4. Ajoutez **TOUTES** les variables listées ci-dessus

### 2. Configuration MongoDB

Assurez-vous que :
- Votre cluster MongoDB Atlas est actif
- L'adresse IP de Vercel est autorisée (ou utilisez `0.0.0.0/0` pour autoriser toutes les IPs)
- Le nom d'utilisateur et mot de passe MongoDB sont corrects
- La base de données `finea_academie` existe

### 3. Test de Configuration

Après avoir ajouté les variables d'environnement :

1. Redéployez votre application Vercel
2. Testez l'endpoint de santé : `https://finea-backend.vercel.app/api/health`
3. Vérifiez les logs Vercel pour les erreurs

## 🔍 Diagnostic des Problèmes

### Vérifier l'Endpoint de Santé

```bash
curl https://finea-backend.vercel.app/api/health
```

**Réponse attendue :**
```json
{
  "status": "success",
  "message": "API Finéa Académie fonctionne correctement",
  "mongodb": {
    "status": "connected",
    "readyState": 1
  },
  "vercel": true
}
```

### Problèmes Courants

| Erreur | Cause | Solution |
|--------|-------|----------|
| `MONGODB_URI environment variable is required` | Variable manquante | Ajouter `MONGODB_URI` dans Vercel |
| `MongoDB connection not ready` | Problème de connexion DB | Vérifier les paramètres MongoDB Atlas |
| `Non autorisé par la politique CORS` | CORS mal configuré | Ajouter votre domaine frontend |
| `Function timeout` | Fonction trop lente | Optimiser les requêtes DB |

## 📝 Checklist de Débogage

- [ ] ✅ Variables d'environnement ajoutées sur Vercel
- [ ] ✅ MongoDB Atlas configuré et accessible
- [ ] ✅ JWT_SECRET défini (minimum 32 caractères)
- [ ] ✅ Configuration email correcte
- [ ] ✅ Redéploiement effectué après configuration
- [ ] ✅ Test de l'endpoint `/api/health`
- [ ] ✅ Vérification des logs Vercel

## 🚀 Commandes de Test Locales

Avant de déployer, testez localement :

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Test de l'API
curl http://localhost:5000/api/health
```

## 📊 Monitoring

Une fois déployé, surveillez :
- Les métriques Vercel (fonction executions, errors)
- Les logs d'erreur dans la console Vercel
- La performance des requêtes MongoDB
- Le taux d'erreur des endpoints

## 🆘 Support

Si le problème persiste :
1. Vérifiez les logs Vercel Functions
2. Testez chaque variable d'environnement individuellement
3. Contactez le support Vercel si nécessaire

---

**Note importante** : La cause principale de l'erreur 500 est généralement l'absence de variables d'environnement critiques comme `MONGODB_URI` et `JWT_SECRET`.