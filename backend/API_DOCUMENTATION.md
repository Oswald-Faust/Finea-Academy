# 📚 Documentation API Finéa Académie

## 🌐 URL de base
```
https://finea-api-production.up.railway.app/api 
```

## ✨ Caractéristiques
- ✅ **Accès public** - Aucune authentification requise
- 🚀 **Données en temps réel** - Statistiques et analyses
- 📊 **Pagination** - Support pour grandes collections
- 🔍 **Filtrage** - Recherche et tri avancés
- 📧 **Notifications** - Système complet d'alertes

---

## 👥 Routes Utilisateurs

### Gestion des utilisateurs

#### `GET /api/users`
Récupérer tous les utilisateurs
```bash
curl "https://finea-api-production.up.railway.app/api /users?page=1&limit=10&search=jean"
```

#### `GET /api/users/:id`
Récupérer un utilisateur spécifique
```bash
curl "https://finea-api-production.up.railway.app/api /users/123"
```

#### `POST /api/users/create`
Créer un utilisateur manuellement (admin)
```bash
curl -X POST "https://finea-api-production.up.railway.app/api /users/create" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont", 
    "email": "jean@example.com",
    "password": "motdepasse123",
    "role": "user"
  }'
```

#### `POST /api/users/register`
Inscription d'un nouvel utilisateur
```bash
curl -X POST "https://finea-api-production.up.railway.app/api /users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marie",
    "lastName": "Martin",
    "email": "marie@example.com", 
    "password": "motdepasse123"
  }'
```

### Statistiques utilisateurs

#### `GET /api/users/stats`
Statistiques de base des utilisateurs
```bash
curl "https://finea-api-production.up.railway.app/api /users/stats"
```

#### `GET /api/users/detailed-stats`
Statistiques détaillées avec croissance et répartition
```bash
curl "https://finea-api-production.up.railway.app/api /users/detailed-stats"
```

---

## 📧 Routes Email & Newsletter

#### `POST /api/email/send`
Envoyer un email générique
```bash
curl -X POST "https://finea-api-production.up.railway.app/api /email/send" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "utilisateur@example.com",
    "subject": "Bienvenue !",
    "message": "Bienvenue dans Finéa Académie"
  }'
```

#### `POST /api/email/newsletter`
Envoyer une newsletter à tous les utilisateurs
```bash
curl -X POST "https://finea-api-production.up.railway.app/api /email/newsletter" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Nouvelles formations disponibles",
    "message": "Découvrez nos nouvelles formations...",
    "targetUsers": []
  }'
```

#### `GET /api/email/newsletter/history`
Historique des newsletters envoyées
```bash
curl "https://finea-api-production.up.railway.app/api /email/newsletter/history"
```

#### `GET /api/email/templates`
Templates d'email prédéfinis
```bash
curl "https://finea-api-production.up.railway.app/api /email/templates"
```

---

## 🎓 Routes Cours & Formations

#### `GET /api/courses`
Récupérer tous les cours avec filtres
```bash
curl "https://finea-api-production.up.railway.app/api /courses?category=Finance&level=Débutant&search=trading"
```

#### `GET /api/courses/:id`
Détails complets d'un cours
```bash
curl "https://finea-api-production.up.railway.app/api /courses/1"
```

#### `POST /api/courses`
Créer un nouveau cours
```bash
curl -X POST "https://finea-api-production.up.railway.app/api /courses" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Investissement Immobilier",
    "description": "Apprenez les bases de l investissement immobilier",
    "instructor": "Expert Immobilier",
    "duration": "6 semaines",
    "level": "Intermédiaire",
    "price": 199.99,
    "category": "Immobilier"
  }'
```

#### `POST /api/courses/:id/enroll`
Inscrire un utilisateur à un cours
```bash
curl -X POST "https://finea-api-production.up.railway.app/api /courses/1/enroll" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123",
    "userEmail": "user@example.com",
    "userName": "Jean Dupont"
  }'
```

#### `GET /api/courses/stats/overview`
Statistiques générales des cours
```bash
curl "https://finea-api-production.up.railway.app/api /courses/stats/overview"
```

---

## 📊 Routes Analytics & Rapports

#### `GET /api/analytics/activity`
Rapport d'activité générale
```bash
curl "https://finea-api-production.up.railway.app/api /analytics/activity?period=30d"
```

#### `GET /api/analytics/courses/performance`
Performance détaillée des cours
```bash
curl "https://finea-api-production.up.railway.app/api /analytics/courses/performance"
```

#### `GET /api/analytics/users/demographics`
Données démographiques des utilisateurs
```bash
curl "https://finea-api-production.up.railway.app/api /analytics/users/demographics"
```

#### `GET /api/analytics/revenue`
Analyse des revenus
```bash
curl "https://finea-api-production.up.railway.app/api /analytics/revenue?period=12m"
```

#### `POST /api/analytics/reports/custom`
Générer un rapport personnalisé
```bash
curl -X POST "https://finea-api-production.up.railway.app/api /analytics/reports/custom" \
  -H "Content-Type: application/json" \
  -d '{
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-06-30"
    },
    "metrics": ["users", "courses", "revenue"],
    "format": "json"
  }'
```

---

## 🔔 Routes Notifications

#### `GET /api/notifications`
Récupérer toutes les notifications
```bash
curl "https://finea-api-production.up.railway.app/api /notifications?status=unread&type=course_enrollment"
```

#### `POST /api/notifications`
Créer une nouvelle notification
```bash
curl -X POST "https://finea-api-production.up.railway.app/api /notifications" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "system_alert",
    "title": "Maintenance prévue",
    "message": "Maintenance du système dimanche matin",
    "priority": "high"
  }'
```

#### `PUT /api/notifications/:id/read`
Marquer une notification comme lue
```bash
curl -X PUT "https://finea-api-production.up.railway.app/api /notifications/1/read"
```

#### `PUT /api/notifications/read-all`
Marquer toutes les notifications comme lues
```bash
curl -X PUT "https://finea-api-production.up.railway.app/api /notifications/read-all"
```

#### `GET /api/notifications/stats`
Statistiques des notifications
```bash
curl "https://finea-api-production.up.railway.app/api /notifications/stats"
```

#### `POST /api/notifications/preferences`
Configurer les préférences de notifications
```bash
curl -X POST "https://finea-api-production.up.railway.app/api /notifications/preferences" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123",
    "emailNotifications": true,
    "pushNotifications": false,
    "types": ["course_enrollment", "payment_received"]
  }'
```

---

## 📱 Routes Notifications Push

#### `POST /api/push-notifications/register`
Enregistrer un token FCM pour un utilisateur
```bash
curl -X POST "https://finea-api-production.up.railway.app/api /push-notifications/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "token": "FCM_TOKEN_STRING",
    "platform": "android",
    "deviceId": "unique-device-id"
  }'
```

#### `DELETE /api/push-notifications/unregister`
Supprimer un token FCM
```bash
curl -X DELETE "https://finea-api-production.up.railway.app/api /push-notifications/unregister" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "deviceId": "unique-device-id"
  }'
```

#### `POST /api/push-notifications/send`
Envoyer une notification push immédiate (Admin)
```bash
curl -X POST "https://finea-api-production.up.railway.app/api /push-notifications/send" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nouvelle formation disponible !",
    "message": "Découvrez notre nouvelle formation en trading",
    "type": "course_announcement",
    "priority": "high",
    "image": "https://example.com/image.jpg",
    "isGlobal": true
  }'
```

#### `POST /api/push-notifications/test`
Envoyer une notification de test
```bash
curl -X POST "https://finea-api-production.up.railway.app/api /push-notifications/test" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserId": "user-id-here"
  }'
```

#### `GET /api/push-notifications/stats`
Statistiques des notifications push
```bash
curl "https://finea-api-production.up.railway.app/api /push-notifications/stats"
```

#### `GET /api/push-notifications/devices`
Récupérer les appareils enregistrés (Admin)
```bash
curl "https://finea-api-production.up.railway.app/api /push-notifications/devices?page=1&limit=20"
```

---

## 🏥 Routes Système

#### `GET /api/health`
Vérification de l'état de l'API
```bash
curl "https://finea-api-production.up.railway.app/api /health"
```

---

## 📋 Paramètres de requête communs

### Pagination
- `page` - Numéro de page (défaut: 1)
- `limit` - Nombre d'éléments par page (défaut: 10-20)

### Filtrage
- `search` - Recherche textuelle
- `status` - Filtrer par statut
- `type` - Filtrer par type
- `category` - Filtrer par catégorie

### Dates
- `period` - Période (7d, 30d, 12m)
- `startDate` - Date de début
- `endDate` - Date de fin

---

## 🔧 Tests

### Tester toutes les routes
```bash
cd backend
node test-routes.js
```

### Réponses types

#### Succès
```json
{
  "success": true,
  "data": { ... },
  "message": "Opération réussie"
}
```

#### Erreur
```json
{
  "success": false,
  "error": "Description de l'erreur"
}
```

#### Avec pagination
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🚀 Fonctionnalités Principales

### ✅ Complètement Implémenté
- 👥 Gestion complète des utilisateurs
- 📧 Système d'emails et newsletters  
- 🎓 Catalogue de cours avec statistiques
- 📊 Analytics et rapports détaillés
- 🔔 Système de notifications complet
- 📱 **Notifications Push avec Firebase Cloud Messaging**
- 🏥 Monitoring de santé de l'API

### 🔄 Données Fictives (Pour Demo)
- Cours avec modules et leçons
- Statistiques d'engagement
- Données démographiques
- Historique des newsletters
- Notifications système

### 🎯 Prochaines Étapes
- Connection à une vraie base de données
- Système de paiement
- Upload de fichiers/vidéos
- API de chat/forum
- Certificats et badges

---

## 📞 Support

Pour toute question ou problème:
1. Vérifiez que le serveur fonctionne sur le port 5000
2. Testez avec `GET /api/health`
3. Consultez les logs du serveur
4. Utilisez le script de test: `node test-routes.js`

**🎉 L'API Finéa Académie est maintenant prête pour votre dashboard admin !** 