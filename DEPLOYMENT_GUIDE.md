# Guide de Déploiement Vercel - Finéa Académie

## 🚀 Déploiement du Backend (API)

### 1. Préparation
- Assurez-vous d'avoir un compte Vercel
- Installez Vercel CLI : `npm i -g vercel`

### 2. Configuration des Variables d'Environnement
Dans le dashboard Vercel, ajoutez ces variables :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finea_academie
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
NODE_ENV=production
FRONTEND_URL=https://finea-admin.vercel.app
FLUTTER_APP_URL=https://finea-academie.vercel.app
```

### 3. Déploiement
```bash
cd backend
vercel --prod
```

## 🎨 Déploiement du Frontend Admin

### 1. Configuration des Variables d'Environnement
Dans le dashboard Vercel, ajoutez :

```env
REACT_APP_API_URL=https://finea-backend.vercel.app
```

### 2. Déploiement
```bash
cd admin-dashboard
vercel --prod
```

## 🔧 Configuration Post-Déploiement

### 1. Mise à jour des URLs CORS
Après le déploiement, mettez à jour les URLs autorisées dans `backend/server.js` :

```javascript
const allowedOrigins = [
  'https://finea-admin.vercel.app',
  'https://finea-academie.vercel.app',
  // ... autres URLs
];
```

### 2. Test des Endpoints
Testez les endpoints principaux :
- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/courses`

## 📱 Configuration Flutter App

Mettez à jour `lib/services/api_service.dart` avec la nouvelle URL :

```dart
static const String baseUrl = 'https://finea-backend.vercel.app/api';
```

## 🔒 Sécurité

### Variables d'Environnement Sensibles
- `JWT_SECRET` : Utilisez un secret fort (32+ caractères)
- `MONGODB_URI` : Utilisez une base de données MongoDB Atlas
- `EMAIL_PASS` : Utilisez un mot de passe d'application Gmail

### CORS Configuration
Assurez-vous que seules les URLs autorisées peuvent accéder à l'API.

## 🚨 Monitoring

### Logs Vercel
- Accédez aux logs via le dashboard Vercel
- Surveillez les erreurs 500 et les timeouts

### Performance
- Utilisez Vercel Analytics pour surveiller les performances
- Configurez des alertes pour les erreurs

## 🔄 Mise à Jour Continue

### Backend
```bash
cd backend
git add .
git commit -m "Update backend"
vercel --prod
```

### Frontend Admin
```bash
cd admin-dashboard
git add .
git commit -m "Update admin dashboard"
vercel --prod
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs Vercel
2. Testez les endpoints localement
3. Vérifiez les variables d'environnement
4. Contactez l'équipe de développement 