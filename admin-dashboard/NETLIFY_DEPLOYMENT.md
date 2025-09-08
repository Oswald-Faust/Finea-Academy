# 🚀 Déploiement Dashboard Admin sur Netlify

## 📋 **Prérequis**

- Compte Netlify
- API Railway déployée et fonctionnelle
- Git configuré

## 🔧 **Configuration**

### **1. Variables d'environnement Netlify**

Dans l'interface Netlify, ajoutez ces variables :

```env
REACT_APP_API_URL=https://finea-academy-1.onrender.com/api 
```

### **2. Configuration de build**

Le fichier `netlify.toml` est déjà configuré avec :
- **Base directory** : `admin-dashboard`
- **Build command** : `npm run build`
- **Publish directory** : `build`

## 🚀 **Déploiement**

### **Option 1 : Déploiement via Git (Recommandé)**

1. **Poussez votre code sur GitHub/GitLab**
2. **Connectez votre repo à Netlify**
3. **Configurez les variables d'environnement**
4. **Déployez automatiquement**

### **Option 2 : Déploiement manuel**

1. **Build local :**
```bash
cd admin-dashboard
npm install
npm run build
```

2. **Déployez le dossier `build` sur Netlify**

## 🔗 **URLs importantes**

- **API Backend** : `https://finea-academy-1.onrender.com`
- **Dashboard Admin** : `https://votre-site.netlify.app`

## 🧪 **Test après déploiement**

1. **Vérifiez la connexion API**
2. **Testez la connexion admin**
3. **Vérifiez les fonctionnalités**

## 🔧 **Dépannage**

### **Erreur CORS**
- Vérifiez que l'API Railway autorise votre domaine Netlify

### **Erreur de build**
- Vérifiez les variables d'environnement
- Vérifiez les dépendances

### **Erreur de connexion API**
- Vérifiez l'URL de l'API
- Vérifiez que l'API Railway fonctionne

## 📞 **Support**

En cas de problème, vérifiez :
1. Les logs de build Netlify
2. Les logs de l'API Railway
3. La console du navigateur 