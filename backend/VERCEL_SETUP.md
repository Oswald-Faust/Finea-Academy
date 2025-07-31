# 🚀 Guide de Configuration Vercel pour Finéa Backend

## 📋 Variables d'environnement requises

Vous devez configurer ces variables dans votre dashboard Vercel :

### 🔐 Variables obligatoires
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finea_academie
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRE=30d
```

### 📧 Variables email (optionnelles)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
```

### 🌐 Variables URLs
```
FRONTEND_URL=https://finea-admin.vercel.app
FLUTTER_APP_URL=https://finea-academie.vercel.app
```

## 🔧 Configuration Vercel

### 1. Aller sur votre dashboard Vercel
- Connectez-vous à [vercel.com](https://vercel.com)
- Sélectionnez votre projet `finea-backend`

### 2. Configurer les variables d'environnement
- Allez dans **Settings** > **Environment Variables**
- Ajoutez chaque variable ci-dessus
- Assurez-vous que **Production** est coché pour toutes

### 3. Redéployer
- Allez dans **Deployments**
- Cliquez sur **Redeploy** sur le dernier déploiement

## 🧪 Tests de diagnostic

Une fois déployé, testez ces endpoints :

### Test de base
```
GET https://finea-backend.vercel.app/test
```

### Test de santé
```
GET https://finea-backend.vercel.app/health
```

### Test des variables d'environnement
```
GET https://finea-backend.vercel.app/env-test
```

## 🔍 Diagnostic des erreurs

### Erreur 500 - FUNCTION_INVOCATION_FAILED
**Causes possibles :**
1. Variables d'environnement manquantes
2. Connexion MongoDB échouée
3. Erreur de syntaxe dans le code

**Solutions :**
1. Vérifier toutes les variables d'environnement
2. Tester la connexion MongoDB localement
3. Vérifier les logs dans le dashboard Vercel

### Erreur de connexion MongoDB
**Solutions :**
1. Vérifier l'URI MongoDB
2. S'assurer que l'IP de Vercel est autorisée
3. Vérifier les credentials

## 📝 Logs Vercel

Pour voir les logs d'erreur :
1. Dashboard Vercel > **Functions**
2. Cliquez sur votre fonction
3. Onglet **Logs**

## 🚀 Commandes utiles

```bash
# Test local
npm run dev

# Test de production
npm start

# Vérifier les variables
node -e "console.log(process.env.MONGODB_URI ? 'MongoDB OK' : 'MongoDB MANQUANT')"
```

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs Vercel
2. Testez les endpoints de diagnostic
3. Vérifiez la configuration MongoDB
4. Contactez le support si nécessaire 