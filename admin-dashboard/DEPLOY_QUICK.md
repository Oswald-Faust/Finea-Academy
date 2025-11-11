# 🚀 Déploiement Rapide - Admin Dashboard

## Option A : Via Netlify CLI (Le plus rapide)

### 1. Installer Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. Se connecter à Netlify
```bash
netlify login
```

### 3. Déployer depuis le dossier admin-dashboard
```bash
cd admin-dashboard
npm install
npm run build
netlify deploy --prod
```

Suivez les instructions :
- **Create & configure a new site** (première fois)
- **Team** : Votre équipe Netlify
- **Site name** : `finea-admin-dashboard` (ou autre)
- **Publish directory** : `./build`

---

## Option B : Via Interface Web Netlify (Sans code)

### 1. Build en local
```bash
cd admin-dashboard
npm install
npm run build
```

### 2. Déployer manuellement
1. Allez sur [Netlify Drop](https://app.netlify.com/drop)
2. Glissez-déposez le dossier `build`
3. C'est déployé ! 🎉

---

## Option C : Connexion GitHub (Déploiement automatique)

### 1. Poussez votre code sur GitHub
```bash
git add .
git commit -m "Configuration déploiement"
git push origin main
```

### 2. Connectez à Netlify
1. Allez sur [Netlify](https://app.netlify.com)
2. Cliquez sur **"Add new site"** → **"Import an existing project"**
3. Sélectionnez **GitHub**
4. Choisissez votre repo `Finea-Academy`
5. Configurez :
   - **Base directory** : `admin-dashboard`
   - **Build command** : `npm run build`
   - **Publish directory** : `build`
6. Ajoutez la variable d'environnement :
   - `REACT_APP_API_URL` = `https://finea-academy-1.onrender.com/api`
7. Cliquez sur **Deploy**

---

## ✅ Variables d'environnement nécessaires

```env
REACT_APP_API_URL=https://finea-academy-1.onrender.com/api
```

---

## 🔗 Après déploiement

Votre site sera accessible sur : `https://votre-site-nom.netlify.app`

Vous pourrez personnaliser le domaine dans les paramètres Netlify.

