# 🚀 Guide de Déploiement Netlify - Finéa Académie

## 📋 Prérequis

### **1. Compte Netlify**
- Créez un compte sur [netlify.com](https://netlify.com)
- Connectez-vous à votre compte

### **2. MongoDB Atlas (Recommandé)**
- Créez un cluster MongoDB Atlas gratuit
- Récupérez votre chaîne de connexion

### **3. Variables d'environnement**
Préparez vos variables d'environnement pour Netlify.

## 🔧 Configuration

### **1. Installation des dépendances**

```bash
# Installer Netlify CLI globalement
npm install -g netlify-cli

# Installer les dépendances du projet
npm install

# Installer les dépendances du backend
cd backend
npm install
cd ..
```

### **2. Configuration des variables d'environnement**

Dans votre dashboard Netlify, allez dans **Site settings > Environment variables** et ajoutez :

```env
# Configuration du serveur
NODE_ENV=production
NETLIFY=true

# Base de données MongoDB (Atlas recommandé)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finea-academie

# JWT Secret (changez en production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Configuration Email (optionnel)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@finea-academie.fr

# URLs de redirection
FRONTEND_URL=https://your-frontend-domain.netlify.app
RESET_PASSWORD_URL=https://your-frontend-domain.netlify.app/reset-password

# Autres configurations
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=2h
```

## 🚀 Déploiement

### **Option 1 : Déploiement via Git (Recommandé)**

1. **Poussez votre code sur GitHub/GitLab**
```bash
git add .
git commit -m "Préparation déploiement Netlify"
git push origin main
```

2. **Connectez Netlify à votre repo**
- Allez sur [app.netlify.com](https://app.netlify.com)
- Cliquez sur **"New site from Git"**
- Choisissez votre provider (GitHub/GitLab)
- Sélectionnez votre repository

3. **Configuration du build**
```
Build command: npm run build
Publish directory: public
```

4. **Variables d'environnement**
- Ajoutez toutes les variables d'environnement dans **Site settings > Environment variables**

5. **Déployez**
- Cliquez sur **"Deploy site"**

### **Option 2 : Déploiement manuel**

```bash
# Build du projet
npm run build

# Déploiement
netlify deploy --prod
```

## 🔍 Test du déploiement

### **1. Vérification de l'API**

Une fois déployé, testez votre API :

```bash
# Test de santé
curl https://your-site.netlify.app/api/health

# Test d'inscription
curl -X POST https://your-site.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **2. Interface web**

Visitez votre site pour voir la page d'accueil :
```
https://your-site.netlify.app
```

## 📱 Configuration Flutter

### **Mise à jour de l'URL API**

Dans votre application Flutter, mettez à jour l'URL de l'API :

```dart
// lib/services/api_service.dart
static const String baseUrl = kDebugMode 
    ? 'http://localhost:5000/api'  // Développement local
    : 'https://your-site.netlify.app/api';  // Production Netlify
```

## 🔧 Résolution des problèmes

### **Erreur de connexion MongoDB**

1. **Vérifiez votre chaîne de connexion**
2. **Assurez-vous que MongoDB Atlas est accessible**
3. **Vérifiez les variables d'environnement**

### **Erreur CORS**

1. **Vérifiez la configuration CORS dans le backend**
2. **Ajoutez votre domaine frontend dans les origines autorisées**

### **Fonction serverless non trouvée**

1. **Vérifiez que le dossier `netlify/functions` existe**
2. **Assurez-vous que `serverless-http` est installé**
3. **Vérifiez la configuration `netlify.toml`**

## 📊 Monitoring

### **Logs Netlify**

- Allez dans **Functions > api** pour voir les logs
- Surveillez les erreurs et performances

### **Métriques**

- **Temps de réponse** : Surveillez les performances
- **Erreurs 500** : Vérifiez les logs
- **Utilisation** : Surveillez les limites Netlify

## 🔄 Mise à jour

### **Déploiement automatique**

Avec Git connecté, chaque push déclenche un nouveau déploiement.

### **Déploiement manuel**

```bash
# Mise à jour du code
git add .
git commit -m "Mise à jour"
git push origin main

# Ou déploiement manuel
netlify deploy --prod
```

## 🎯 Avantages Netlify

### **✅ Points forts**
- **Déploiement automatique** depuis Git
- **CDN global** pour de meilleures performances
- **SSL gratuit** automatique
- **Fonctions serverless** incluses
- **Interface simple** et intuitive

### **⚠️ Limitations**
- **Timeout** : 10 secondes par fonction
- **Taille** : 50MB max par déploiement
- **Requêtes** : 125k/mois sur le plan gratuit

## 📞 Support

### **Ressources utiles**
- [Documentation Netlify](https://docs.netlify.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Variables d'environnement](https://docs.netlify.com/environment-variables/overview/)

### **En cas de problème**
1. Vérifiez les logs dans le dashboard Netlify
2. Testez localement avec `netlify dev`
3. Consultez la documentation officielle

---

**🎉 Votre backend Finéa Académie est maintenant déployé sur Netlify !** 