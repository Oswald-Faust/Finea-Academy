# 🚀 Configuration Railway - Finéa Académie

## ✅ Variables à configurer dans Railway

Dans l'interface Railway qui s'est ouverte, allez dans **Variables** et ajoutez :

### **🔧 Variables principales**

```env
# Configuration de la base de données MongoDB
MONGODB_URI=mongodb+srv://faustfrank370:writer55FF@cluster0.km3u4wj.mongodb.net/finea_academie?retryWrites=true&w=majority&appName=Cluster0

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

## 🧪 Test après configuration

Une fois les variables ajoutées, testez :

```bash
# Test de santé avec MongoDB
curl https://finea-api-production.up.railway.app/api/health

# Test d'inscription utilisateur
curl -X POST https://finea-api-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@finea.com",
    "password": "password123"
  }'
```

## 🎯 Résultat attendu

Après configuration, vous devriez voir :
- `"mongodb":"connected"` dans le test de santé
- Inscription d'utilisateurs fonctionnelle
- Toutes les fonctionnalités de l'API opérationnelles

---

**🎉 Votre API sera alors 100% fonctionnelle avec base de données !** 