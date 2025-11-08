# 🚀 Guide de Déploiement sur Render

## Problèmes Résolus

✅ **Cloudflare R2 optionnel** - L'application ne plantera plus si Cloudflare n'est pas configuré  
✅ **Environnement en production** - Configuration correcte de NODE_ENV  
✅ **Gestion des erreurs** - Meilleure gestion des services non configurés

---

## 📋 Variables d'Environnement Requises

### 1️⃣ Variables OBLIGATOIRES

Ces variables doivent être configurées dans le **Dashboard Render** :

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://votre_user:votre_password@cluster0.xxxxx.mongodb.net/finea-academie?retryWrites=true&w=majority
JWT_SECRET=votre_secret_jwt_ultra_securise_en_production
JWT_EXPIRE=30d
FRONTEND_URL=https://votre-frontend.com
```

### 2️⃣ Variables OPTIONNELLES - Cloudflare R2

⚠️ **Important** : Si vous ne configurez PAS ces variables, l'application fonctionnera quand même, mais les uploads d'images seront désactivés.

Pour activer Cloudflare R2 :

```env
CLOUDFLARE_R2_ENDPOINT=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=votre_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=votre_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=finea-academie
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxxxxxxxxxxxxx.r2.dev
```

### 3️⃣ Variables OPTIONNELLES - OneSignal (Notifications Push)

```env
ONESIGNAL_APP_ID=votre_app_id
ONESIGNAL_REST_API_KEY=votre_rest_api_key
```

### 4️⃣ Variables OPTIONNELLES - Email (Nodemailer)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
```

---

## 🔧 Configuration sur Render

### Méthode 1 : Via le Dashboard Render (Recommandé)

1. **Aller sur votre service** : https://dashboard.render.com/
2. **Sélectionner votre service** : `finea-academy-1`
3. **Cliquer sur "Environment"** dans le menu de gauche
4. **Ajouter les variables une par une** :
   - Cliquer sur "Add Environment Variable"
   - Entrer le nom (ex: `NODE_ENV`)
   - Entrer la valeur (ex: `production`)
   - Cliquer sur "Save Changes"

5. **Variables CRITIQUES à ajouter immédiatement** :
   ```
   NODE_ENV = production
   MONGODB_URI = votre_uri_mongodb_complète
   JWT_SECRET = un_secret_très_sécurisé_différent_du_dev
   FRONTEND_URL = https://votre-frontend.com
   ```

6. **Après avoir ajouté toutes les variables obligatoires** :
   - Cliquer sur "Manual Deploy" → "Deploy latest commit"
   - Ou attendre le prochain déploiement automatique

### Méthode 2 : Via render.yaml (Avancé)

Un fichier `render.yaml` a été créé dans votre projet. Pour l'utiliser :

1. **Commitez le fichier render.yaml** :
   ```bash
   git add backend/render.yaml
   git commit -m "Ajout configuration Render"
   git push
   ```

2. **Dans Render Dashboard** :
   - Les variables marquées `sync: false` doivent être configurées manuellement
   - Render lira automatiquement le fichier pour les autres configurations

---

## 🔍 Vérification du Déploiement

### 1. Vérifier que le serveur démarre sans erreur

Dans les logs Render, vous devriez voir :

```
✅ Service Cloudflare R2 initialisé
  OU
⚠️  Cloudflare R2 non configuré - Les uploads seront désactivés

✅ Service de notifications push initialisé
MongoDB connecté: ac-p4zr0o3-shard-00-00.km3u4wj.mongodb.net
🚀 Serveur démarré sur le port 5000
🌐 Environnement: production  👈 DOIT ÊTRE "production" et non "development"
📡 API disponible sur: http://localhost:5000/api
```

### 2. Tester l'endpoint de santé

```bash
curl https://finea-academy-1.onrender.com/api/health
```

Réponse attendue :
```json
{
  "success": true,
  "message": "API Finéa Académie opérationnelle",
  "timestamp": "2025-11-06T...",
  "environment": "production",  👈 DOIT ÊTRE "production"
  "version": "1.0.0"
}
```

### 3. Vérifier Cloudflare R2 (si configuré)

Si vous avez configuré Cloudflare, testez l'upload :

```bash
curl -X POST https://finea-academy-1.onrender.com/api/users/avatar \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -F "avatar=@image.jpg"
```

Si Cloudflare n'est **PAS** configuré, vous obtiendrez :
```json
{
  "success": false,
  "message": "Cloudflare R2 non configuré. Veuillez configurer les variables d'environnement.",
  "suggestion": "Ajoutez CLOUDFLARE_R2_ENDPOINT, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY et CLOUDFLARE_R2_BUCKET_NAME dans vos variables d'environnement Render."
}
```

---

## ❌ Erreurs Courantes et Solutions

### Erreur : "bucket is required"

**Cause** : Les variables Cloudflare ne sont pas toutes configurées

**Solution** : 
- **Option 1** : Configurer TOUTES les variables Cloudflare (endpoint, access_key, secret, bucket_name, public_url)
- **Option 2** : Ne PAS configurer Cloudflare du tout (l'app fonctionnera sans uploads)

### Erreur : "Environnement: development" en production

**Cause** : La variable `NODE_ENV` n'est pas configurée

**Solution** :
1. Aller dans Dashboard Render → Environment
2. Ajouter : `NODE_ENV = production`
3. Redéployer

### Erreur : "Connection timeout" (Email)

**Cause** : Les variables email ne sont pas configurées ou incorrectes

**Solution** : C'est normal si vous n'utilisez pas les emails. Pour désactiver ces erreurs, ne configurez pas les variables EMAIL_*.

### Erreur : "Route non trouvée - /"

**Cause** : C'est normal ! Votre API n'a pas de route à la racine `/`

**Solution** : Utilisez `/api/health` ou vos autres routes API. Ceci n'est pas une erreur.

---

## 🎯 Résumé des Actions Requises

### Pour réparer le problème actuel :

1. **Aller sur** : https://dashboard.render.com/web/srv-XXXXXX/env (votre service)

2. **Ajouter CES VARIABLES OBLIGATOIRES** :
   ```
   NODE_ENV = production
   MONGODB_URI = mongodb+srv://faustfrank370:writer55FF@cluster0.km3u4wj.mongodb.net/finea-academie?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET = [générer un nouveau secret pour la production]
   FRONTEND_URL = https://votre-frontend-production.com
   ```

3. **Décider pour Cloudflare** :
   - **Si vous voulez les uploads** : Ajouter TOUTES les 5 variables Cloudflare
   - **Si pas nécessaire maintenant** : Ne rien ajouter, l'app fonctionnera sans

4. **Redéployer** :
   - Cliquer sur "Manual Deploy" → "Deploy latest commit"
   - OU attendre le prochain commit/push

5. **Vérifier** :
   - Aller sur : https://finea-academy-1.onrender.com/api/health
   - Vérifier que `"environment": "production"`

---

## 📞 Support

Si vous avez encore des problèmes après avoir suivi ce guide, vérifiez :
- Les logs Render pour les erreurs spécifiques
- Que toutes les variables obligatoires sont bien configurées
- Que MONGODB_URI est correct et accessible depuis Render

---

**Fichiers modifiés pour résoudre le problème** :
- ✅ `services/cloudflareService.js` - Cloudflare maintenant optionnel
- ✅ `middleware/cloudflareUploads.js` - Meilleure gestion des erreurs
- ✅ `render.yaml` - Configuration Render
- ✅ `RENDER_DEPLOYMENT_GUIDE.md` - Ce guide




