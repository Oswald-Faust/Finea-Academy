# Backend API Finéa Académie

Backend API complet pour l'application Finéa Académie développé avec Node.js, Express et MongoDB.

## 🚀 Fonctionnalités

- **Authentification complète** : Inscription, connexion, déconnexion
- **Gestion des mots de passe** : Mot de passe oublié, réinitialisation
- **Vérification email** : Email de vérification et de bienvenue
- **Gestion des utilisateurs** : CRUD complet, rôles, permissions
- **Sécurité avancée** : JWT, rate limiting, validation, sanitization
- **Upload de fichiers** : Gestion des avatars utilisateur
- **Service d'emails** : Templates personnalisés, newsletter
- **Statistiques** : Dashboard admin avec métriques
- **API RESTful** : Routes bien structurées et documentées

## 📦 Installation

### Prérequis

- Node.js (version 18 ou supérieure)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Configuration

1. Créez un fichier `.env` à la racine du projet :

```env
# Configuration du serveur
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/finea-academie

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Configuration Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@finea-academie.fr

# URLs de redirection
RESET_PASSWORD_URL=http://localhost:3000/reset-password
```

2. Créez les dossiers pour les uploads :

```bash
mkdir -p uploads/avatars
```

### Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 🛠 Structure du projet

```
backend/
├── controllers/           # Contrôleurs des routes
│   ├── authController.js  # Authentification
│   └── userController.js  # Gestion des utilisateurs
├── middleware/            # Middlewares personnalisés
│   ├── auth.js           # Authentification JWT
│   ├── errorHandler.js   # Gestion d'erreurs
│   ├── notFound.js       # Routes non trouvées
│   └── validation.js     # Validation des données
├── models/               # Modèles MongoDB
│   └── User.js           # Modèle utilisateur
├── routes/               # Routes API
│   ├── auth.js           # Routes d'authentification
│   ├── email.js          # Routes d'emails
│   └── users.js          # Routes utilisateurs
├── services/             # Services métier
│   └── emailService.js   # Service d'emails
├── uploads/              # Fichiers uploadés
│   └── avatars/          # Avatars utilisateur
├── .env                  # Variables d'environnement
├── package.json          # Dépendances et scripts
├── README.md             # Ce fichier
└── server.js             # Point d'entrée principal
```

## 🔐 Endpoints API

### Authentification (`/api/auth`)

| Méthode | Endpoint                     | Description                    | Accès    |
|---------|------------------------------|--------------------------------|----------|
| POST    | `/register`                  | Inscription utilisateur        | Public   |
| POST    | `/login`                     | Connexion utilisateur          | Public   |
| POST    | `/logout`                    | Déconnexion utilisateur        | Privé    |
| GET     | `/me`                        | Profil utilisateur connecté    | Privé    |
| POST    | `/forgot-password`           | Demande de réinitialisation    | Public   |
| PUT     | `/reset-password/:token`     | Réinitialiser mot de passe     | Public   |
| PUT     | `/update-password`           | Modifier mot de passe          | Privé    |
| GET     | `/verify-email/:token`       | Vérifier email                 | Public   |
| POST    | `/resend-verification`       | Renvoyer email de vérification | Privé    |

### Utilisateurs (`/api/users`)

| Méthode | Endpoint            | Description                   | Accès           |
|---------|---------------------|-------------------------------|-----------------|
| GET     | `/`                 | Liste des utilisateurs       | Admin/Modérateur|
| GET     | `/:id`              | Utilisateur par ID            | Propriétaire    |
| PUT     | `/:id`              | Modifier utilisateur          | Propriétaire    |
| DELETE  | `/:id`              | Désactiver utilisateur        | Admin           |
| PUT     | `/:id/activate`     | Réactiver utilisateur         | Admin           |
| PUT     | `/:id/role`         | Changer rôle utilisateur      | Admin           |
| GET     | `/stats`            | Statistiques utilisateurs     | Admin           |
| POST    | `/:id/avatar`       | Upload avatar                 | Propriétaire    |

### Emails (`/api/email`)

| Méthode | Endpoint      | Description            | Accès |
|---------|---------------|------------------------|-------|
| POST    | `/send`       | Envoyer email          | Admin |
| POST    | `/newsletter` | Envoyer newsletter     | Admin |

### Utilitaires

| Méthode | Endpoint      | Description            | Accès  |
|---------|---------------|------------------------|--------|
| GET     | `/api/health` | Statut de l'API        | Public |

## 🛡️ Sécurité

### Middlewares de sécurité

- **Helmet** : Protection des headers HTTP
- **CORS** : Gestion des requêtes cross-origin
- **Rate Limiting** : Limitation des requêtes
- **Express Validator** : Validation des données
- **Mongo Sanitize** : Protection contre les injections NoSQL
- **XSS Clean** : Protection contre les attaques XSS
- **HPP** : Protection contre la pollution des paramètres

### Authentification

- **JWT** : Tokens sécurisés avec expiration
- **Bcrypt** : Hachage sécurisé des mots de passe
- **Account Locking** : Verrouillage après tentatives échouées
- **Role-based Access** : Contrôle d'accès basé sur les rôles

## 📧 Service d'emails

### Templates disponibles

- Email de bienvenue
- Réinitialisation de mot de passe
- Vérification d'email
- Notification de connexion
- Newsletter personnalisée

### Configuration email

Supporte plusieurs services d'email :
- Gmail (recommandé)
- SendGrid
- Mailgun
- SMTP personnalisé

## 📊 Monitoring et Logs

- **Morgan** : Logging des requêtes HTTP
- **Error Handling** : Gestion centralisée des erreurs
- **Health Check** : Endpoint de vérification du statut
- **User Statistics** : Métriques utilisateur pour le dashboard

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests en mode watch
npm run test:watch
```

## 🚀 Déploiement

### Variables d'environnement production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finea-academie
JWT_SECRET=your-very-secure-production-secret
FRONTEND_URL=https://your-frontend-domain.com
EMAIL_SERVICE=gmail
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
```

### Commandes de déploiement

```bash
# Build et démarrage
npm start

# Avec PM2 (recommandé pour la production)
npm install -g pm2
pm2 start server.js --name finea-api
pm2 save
pm2 startup
```

## 📝 Utilisation

### Exemple d'inscription

```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password123',
    phone: '+33123456789'
  })
});
```

### Exemple de connexion

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'Password123'
  })
});
```

### Utilisation du token JWT

```javascript
const token = localStorage.getItem('token');
const response = await fetch('/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez créer une issue avant de soumettre une pull request.

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement à support@finea-academie.fr 