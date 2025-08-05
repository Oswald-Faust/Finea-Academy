# 🌍 Variables d'Environnement - Finéa Académie

## 📋 Configuration Standardisée

**Ce fichier sert de référence unique pour toutes les variables d'environnement du projet.**

### **🔧 Variables Principales**

```env
# Configuration de la base de données MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finea_academie

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRE=30d

# Configuration email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app

# Configuration serveur
PORT=5000
NODE_ENV=production

# URLs autorisées
FRONTEND_URL=https://finea-admin.vercel.app
FLUTTER_APP_URL=https://finea-academie.vercel.app
```

### **🚀 Variables par Environnement**

#### **Développement Local**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finea_academie
```

#### **Production Railway**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://finea_admin:password@cluster.mongodb.net/finea_academie
RAILWAY_URL=https://finea-api-production.up.railway.app
```

#### **Production Vercel**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://finea_admin:password@cluster.mongodb.net/finea_academie
VERCEL_URL=https://finea-backend.vercel.app
```

### **📱 Configuration Flutter**

Dans `lib/services/api_service.dart` :
```dart
static const String baseUrl = kDebugMode 
    ? 'http://localhost:5000/api'  // Développement
    : 'https://finea-api-production.up.railway.app/api';  // Production Railway
```

### **🔐 Sécurité**

#### **Variables sensibles à changer en production :**
- `JWT_SECRET` : Utilisez un secret fort et unique
- `MONGODB_URI` : Utilisez des identifiants sécurisés
- `EMAIL_PASS` : Utilisez un mot de passe d'application

#### **Variables à adapter selon l'environnement :**
- `NODE_ENV` : development/production
- `PORT` : 5000 (développement) / auto (production)
- URLs : Selon votre domaine de déploiement

### **📁 Fichiers de Configuration**

- `backend/env.example` : Template pour le développement
- `backend/railway-vars.txt` : Variables pour Railway
- `MONGODB_SETUP.md` : Guide MongoDB Atlas
- `ENVIRONMENT_VARIABLES.md` : Ce fichier de référence

### **🧪 Test de Configuration**

```bash
# Test de santé de l'API
curl https://finea-api-production.up.railway.app/api/health

# Vérifier les variables
railway variables
```

### **🔄 Mise à jour**

**Important :** Quand vous modifiez les variables, mettez à jour :
1. Ce fichier de référence
2. `backend/env.example`
3. `backend/railway-vars.txt`
4. Les variables dans Railway/Vercel
5. La configuration Flutter si nécessaire

---

**🎯 Objectif : Maintenir la cohérence des variables d'environnement dans tout le projet.** 