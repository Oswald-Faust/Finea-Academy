# 🚀 Déploiement Automatique Netlify

## 📋 **Configuration de l'automatisation**

### **1. Via l'interface Netlify (Recommandé)**

1. **Allez sur** [Netlify Dashboard](https://app.netlify.com)
2. **Cliquez sur votre site** `finea-admin-dashboard`
3. **Allez dans "Site settings"**
4. **Cliquez sur "Build & deploy"**
5. **Dans "Build settings" :**
   - **Base directory** : `admin-dashboard`
   - **Build command** : `npm run build`
   - **Publish directory** : `build`

6. **Dans "Deploy contexts" :**
   - **Production branch** : `main`
   - **Branch deploys** : Activé
   - **Deploy previews** : Activé

### **2. Connexion GitHub**

1. **Dans "Build & deploy" → "Continuous Deployment"**
2. **Cliquez sur "Connect to Git provider"**
3. **Sélectionnez GitHub**
4. **Autorisez Netlify**
5. **Sélectionnez votre repo** `Oswald-Faust/Finea-Academy`
6. **Configurez :**
   - **Branch to deploy** : `main`
   - **Base directory** : `admin-dashboard`
   - **Build command** : `npm run build`
   - **Publish directory** : `build`

### **3. Variables d'environnement**

Dans "Build & deploy" → "Environment variables" :

```env
REACT_APP_API_URL=https://finea-academy-1.onrender.com/api 
```

## ✅ **Résultat**

Après configuration, chaque push sur la branche `main` déclenchera automatiquement :

1. **Déclenchement du build** Netlify
2. **Installation des dépendances** (`npm install`)
3. **Build de l'application** (`npm run build`)
4. **Déploiement automatique** sur `https://finea-admin-dashboard.netlify.app`

## 🔄 **Workflow de développement**

```bash
# 1. Faire des modifications
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main

# 2. Netlify déploie automatiquement !
# 3. Vérifier le déploiement sur Netlify Dashboard
```

## 📊 **Monitoring**

- **Netlify Dashboard** : Voir les déploiements en temps réel
- **GitHub** : Voir les commits et leur statut de déploiement
- **Notifications** : Email/Slack pour les succès/échecs

## 🛠️ **Dépannage**

### **Build échoue ?**
- Vérifiez les logs dans Netlify Dashboard
- Vérifiez les variables d'environnement
- Testez le build local : `npm run build`

### **Déploiement ne se déclenche pas ?**
- Vérifiez la connexion GitHub
- Vérifiez la branche configurée
- Vérifiez les permissions Netlify

---

**🎉 Avec cette configuration, votre dashboard se déploiera automatiquement à chaque push !** 