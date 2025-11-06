# Guide de Configuration Cloudflare R2 pour Finéa Académie

## 🚀 Configuration Cloudflare R2

### 1. Créer un compte Cloudflare R2

1. Connectez-vous à [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Allez dans **R2 Object Storage**
3. Cliquez sur **Create bucket**
4. Nommez votre bucket (ex: `finea-images`)
5. Choisissez une région proche de vos utilisateurs

### 2. Configurer les clés d'API

1. Dans le dashboard R2, allez dans **Manage R2 API tokens**
2. Cliquez sur **Create API token**
3. Configurez les permissions :
   - **Permissions** : `Object:Edit`, `Object:Read`
   - **Bucket** : Sélectionnez votre bucket
4. Copiez les clés générées

### 3. Configurer un domaine personnalisé (optionnel mais recommandé)

1. Dans votre bucket R2, allez dans **Settings** > **Custom Domains**
2. Ajoutez un domaine personnalisé (ex: `images.finea-academie.com`)
3. Configurez les DNS selon les instructions Cloudflare

### 4. Variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```env
# Configuration Cloudflare R2
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=finea-images
CLOUDFLARE_R2_PUBLIC_URL=https://images.finea-academie.com
```

### 5. Configuration Vercel (si déployé sur Vercel)

Ajoutez les variables d'environnement dans votre projet Vercel :

1. Allez dans votre projet Vercel
2. **Settings** > **Environment Variables**
3. Ajoutez toutes les variables Cloudflare R2

## 📁 Structure des dossiers dans R2

```
finea-images/
├── articles/          # Images des actualités
├── newsletters/       # Images des newsletters
├── avatars/          # Avatars des utilisateurs
└── images/           # Images générales
```

## 🔧 Fonctionnalités implémentées

### Backend
- ✅ Service Cloudflare R2 (`cloudflareService.js`)
- ✅ Middleware d'upload (`cloudflareUploads.js`)
- ✅ Routes mises à jour pour les actualités
- ✅ Routes mises à jour pour les newsletters
- ✅ Routes mises à jour pour les avatars
- ✅ Gestion des erreurs et fallbacks

### Frontend Flutter
- ✅ `ImageUtils` mis à jour pour gérer les URLs Cloudflare
- ✅ Support des URLs complètes HTTP/HTTPS
- ✅ Fallback vers l'ancien système `/uploads/`
- ✅ Images par défaut en cas d'erreur

## 🧪 Test de l'intégration

### 1. Test d'upload d'image

```bash
curl -X POST http://localhost:5001/api/news/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-image.jpg"
```

### 2. Vérification de l'URL retournée

L'API devrait retourner :
```json
{
  "success": true,
  "data": {
    "url": "https://images.finea-academie.com/articles/image-123456789.jpg",
    "key": "articles/image-123456789.jpg",
    "filename": "image-123456789.jpg",
    "originalName": "test-image.jpg",
    "size": 123456,
    "mimetype": "image/jpeg",
    "bucket": "finea-images"
  }
}
```

## 🔄 Migration depuis l'ancien système

### Images existantes
Les images déjà uploadées avec l'ancien système (`/uploads/`) continueront de fonctionner grâce au fallback dans `ImageUtils`.

### Nouveaux uploads
Tous les nouveaux uploads iront automatiquement vers Cloudflare R2.

## 🚨 Dépannage

### Erreur "Cloudflare R2 non configuré"
- Vérifiez que toutes les variables d'environnement sont définies
- Redémarrez le serveur après avoir ajouté les variables

### Erreur d'upload
- Vérifiez les permissions de votre token API
- Vérifiez que le bucket existe et est accessible
- Vérifiez la connectivité réseau

### Images qui ne s'affichent pas
- Vérifiez que l'URL publique est correcte
- Vérifiez que le domaine personnalisé est configuré
- Vérifiez les logs du navigateur pour les erreurs CORS

## 📊 Avantages de Cloudflare R2

- ✅ **Performance** : CDN mondial de Cloudflare
- ✅ **Coût** : Tarification compétitive
- ✅ **Fiabilité** : Infrastructure robuste
- ✅ **Sécurité** : Intégration native avec Cloudflare
- ✅ **Scalabilité** : Pas de limite de bande passante
