# 🗄️ Configuration MongoDB Atlas pour Finéa Académie

## 🚀 Option 1 : MongoDB Atlas (Recommandé)

### **Étape 1 : Créer un compte MongoDB Atlas**

1. **Allez sur** : https://www.mongodb.com/cloud/atlas
2. **Cliquez** sur "Try Free"
3. **Créez un compte** ou connectez-vous

### **Étape 2 : Créer un cluster gratuit**

1. **Choisissez** "FREE" (M0)
2. **Sélectionnez** un provider (AWS, Google Cloud, Azure)
3. **Choisissez** une région (Europe recommandée)
4. **Cliquez** sur "Create"

### **Étape 3 : Configurer la sécurité**

#### **A. Créer un utilisateur de base de données**
1. Allez dans **Database Access**
2. Cliquez sur **"Add New Database User"**
3. **Username** : `finea_admin`
4. **Password** : Créez un mot de passe sécurisé
5. **Role** : "Atlas admin" ou "Read and write to any database"
6. Cliquez sur **"Add User"**

#### **B. Configurer l'accès réseau**
1. Allez dans **Network Access**
2. Cliquez sur **"Add IP Address"**
3. Cliquez sur **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Cliquez sur **"Confirm"**

### **Étape 4 : Récupérer la chaîne de connexion**

1. Allez dans **Database**
2. Cliquez sur **"Connect"**
3. Choisissez **"Connect your application"**
4. **Copy** la chaîne de connexion

### **Étape 5 : Configurer dans Railway**

1. **Ouvrez** l'interface Railway : `railway open`
2. Allez dans **Variables**
3. **Ajoutez** la variable `MONGODB_URI`
4. **Collez** votre chaîne de connexion Atlas

## 🔧 Option 2 : MongoDB local (Développement)

### **Pour le développement local uniquement**

```env
MONGODB_URI=mongodb://localhost:27017/finea_academie
```

## 📋 Variables d'environnement complètes

```env
# Configuration de la base de données MongoDB
MONGODB_URI=mongodb+srv://finea_admin:password@cluster.mongodb.net/finea_academie

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

# Configuration Railway
RAILWAY_URL=https://finea-api-production.up.railway.app
```

## 🧪 Test de connexion

Une fois configuré, testez :

```bash
curl https://finea-api-production.up.railway.app/api/health
```

Vous devriez voir : `"mongodb":"connected"`

## 🔍 Résolution des problèmes

### **Erreur de connexion**
- Vérifiez que l'IP 0.0.0.0/0 est autorisée
- Vérifiez les identifiants utilisateur
- Vérifiez la chaîne de connexion

### **Erreur d'authentification**
- Vérifiez le nom d'utilisateur et mot de passe
- Vérifiez les permissions de l'utilisateur

---

**🎉 Une fois MongoDB configuré, votre API sera 100% fonctionnelle !** 