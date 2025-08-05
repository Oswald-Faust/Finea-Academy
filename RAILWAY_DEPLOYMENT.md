# 🚀 Guide de Déploiement Railway - Finéa Académie

## ✅ Votre configuration est parfaite pour Railway !

Votre backend Node.js/Express est **100% compatible** avec Railway.app.

## 🔧 Configuration des Variables d'Environnement

### **1. Accéder aux variables Railway**

```bash
# Ouvrir l'interface web
railway variables
```

### **2. Variables à configurer**

Ajoutez ces variables dans l'interface Railway :

```env
# Configuration de la base de données MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finea_academie

# Configuration JWT
JWT_SECRET=finea-academie-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# Configuration email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Configuration serveur
PORT=5000
NODE_ENV=production

# URLs autorisées
FRONTEND_URL=https://finea-admin.vercel.app
FLUTTER_APP_URL=https://finea-academie.vercel.app
```

## 🚀 Déploiement

### **Étape 1 : Vérifier la configuration**

```bash
# Vérifier que vous êtes dans le bon dossier
cd backend

# Vérifier la configuration
railway status
```

### **Étape 2 : Configurer les variables**

```bash
# Ouvrir l'interface des variables
railway variables
```

### **Étape 3 : Déployer**

```bash
# Déployer l'application
railway up
```

### **Étape 4 : Vérifier le déploiement**

```bash
# Voir les logs
railway logs

# Ouvrir l'application
railway open
```

## 🔍 Test de l'API

Une fois déployé, testez votre API :

```bash
# Test de santé
curl https://your-app.railway.app/api/health

# Test d'inscription
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Railway",
    "email": "test@railway.com",
    "password": "password123"
  }'
```

## 📱 Configuration Flutter

Mettez à jour votre app Flutter :

```dart
// lib/services/api_service.dart
static const String baseUrl = kDebugMode 
    ? 'http://localhost:5000/api'  // Développement
    : 'https://your-app.railway.app/api';  // Production Railway
```

## 🎯 Avantages Railway

### **✅ Pourquoi Railway est parfait pour votre API**

1. **🚀 Déploiement ultra-simple** - Git push = déploiement automatique
2. **⚡ Performance** - Pas de limitations serverless
3. **🔒 SSL automatique** - HTTPS gratuit
4. **📊 Monitoring** - Logs et métriques intégrés
5. **🔄 Auto-scaling** - S'adapte à la charge
6. **💾 Base de données** - MongoDB intégré ou externe
7. **🌍 CDN global** - Excellentes performances

### **✅ Compatibilité confirmée**

- ✅ **Node.js 18+** - Supporté nativement
- ✅ **Express.js** - Framework standard
- ✅ **MongoDB** - Connexion flexible
- ✅ **Uploads** - Support complet des fichiers
- ✅ **Emails** - Service SMTP intégré
- ✅ **CORS** - Configuration adaptative

## 🔧 Résolution des problèmes

### **Erreur de déploiement**

1. **Vérifiez les variables d'environnement**
2. **Assurez-vous que MongoDB est accessible**
3. **Vérifiez les logs** : `railway logs`

### **Erreur de connexion MongoDB**

1. **Vérifiez MONGODB_URI**
2. **Testez la connexion localement**
3. **Vérifiez les permissions MongoDB Atlas**

### **Erreur CORS**

1. **Ajoutez votre domaine dans FRONTEND_URL**
2. **Vérifiez la configuration CORS**

## 📊 Monitoring

### **Logs en temps réel**

```bash
# Voir les logs
railway logs --follow

# Voir les métriques
railway status
```

### **Interface web**

- Allez sur [railway.app](https://railway.app)
- Sélectionnez votre projet
- Voir les métriques et logs

## 🔄 Mise à jour

### **Déploiement automatique**

```bash
# Push vers Git = déploiement automatique
git add .
git commit -m "Mise à jour API"
git push origin main
```

### **Déploiement manuel**

```bash
# Déploiement manuel
railway up
```

## 🎉 Résultat

Votre API Finéa Académie sera accessible sur :
```
https://your-app.railway.app/api
```

**Avec toutes les fonctionnalités :**
- ✅ Authentification complète
- ✅ Gestion des utilisateurs
- ✅ Catalogue de cours
- ✅ Analytics et statistiques
- ✅ Newsletter et emails
- ✅ Notifications
- ✅ Upload de fichiers

---

**🚀 Votre backend est maintenant prêt pour la production sur Railway !** 