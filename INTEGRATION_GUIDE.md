# Guide d'intégration - Application Finéa Académie

Ce guide vous explique comment intégrer complètement l'application Flutter avec le backend API que nous avons créé.

## 🚀 Étapes de configuration

### 1. Installation des dépendances Flutter

Exécutez ces commandes dans le répertoire racine du projet :

```bash
# Installer les dépendances Flutter
flutter pub get

# Générer les fichiers JSON (modèles)
flutter packages pub run build_runner build --delete-conflicting-outputs
```

### 2. Configuration du Backend

#### Installation des dépendances Node.js :

```bash
cd backend
npm install
```

#### Configuration de l'environnement :

Créez un fichier `.env` dans le dossier `backend/` avec ce contenu :

```env
# Configuration du serveur
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/finea-academie

# JWT Secret
JWT_SECRET=finea-academie-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# Configuration Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@finea-academie.fr

# URLs de redirection
RESET_PASSWORD_URL=http://localhost:3000/reset-password
```

#### Démarrage du serveur backend :

```bash
# Dans le dossier backend/
npm run dev
```

Le serveur sera accessible sur `http://localhost:5000`

### 3. Installation de MongoDB

#### Option 1 : MongoDB local

```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS avec Homebrew
brew install mongodb-community

# Démarrer MongoDB
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

#### Option 2 : MongoDB Atlas (Cloud)

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Récupérez l'URL de connexion
4. Remplacez `MONGODB_URI` dans le fichier `.env`

### 4. Configuration Email (Optionnel)

Pour tester l'envoi d'emails (mot de passe oublié, vérification) :

1. **Gmail** :

   - Activez l'authentification à 2 facteurs
   - Générez un mot de passe d'application
   - Utilisez ce mot de passe dans `EMAIL_PASS`

2. **Autre service** :
   - Modifiez `EMAIL_SERVICE` avec votre fournisseur
   - Configurez les paramètres SMTP appropriés

## 📱 Fonctionnalités intégrées

### ✅ Authentification complète

- **Inscription** : Création de compte avec validation
- **Connexion** : Authentification sécurisée avec JWT
- **Mot de passe oublié** : Envoi d'email de réinitialisation
- **Gestion des erreurs** : Messages d'erreur personnalisés
- **Stockage sécurisé** : Tokens JWT stockés de manière sécurisée

### ✅ Services Flutter

- **ApiService** : Communication avec le backend
- **AuthService** : Gestion de l'état d'authentification
- **ErrorHandler** : Gestion centralisée des erreurs
- **Providers** : État global avec Provider

### ✅ Sécurité

- **JWT Tokens** : Authentification sécurisée
- **Rate Limiting** : Protection contre le spam
- **Validation des données** : Validation côté client et serveur
- **Stockage sécurisé** : flutter_secure_storage pour les tokens

## 🧪 Test de l'intégration

### 1. Démarrer le backend

```bash
cd backend
npm run dev
```

### 2. Tester l'API

```bash
# Test de santé de l'API
curl https://finea-api.cloud/api/health
```

### 3. Démarrer l'application Flutter

```bash
flutter run
```

### 4. Tester les fonctionnalités

1. **Inscription** :

   - Ouvrez l'application
   - Allez sur "S'inscrire"
   - Remplissez le formulaire
   - Vérifiez que l'utilisateur est créé dans MongoDB

2. **Connexion** :

   - Utilisez les identifiants créés
   - Vérifiez la redirection vers l'écran principal

3. **Mot de passe oublié** :
   - Testez avec un email valide
   - Vérifiez l'envoi d'email (si configuré)

## 🔧 Configuration avancée

### Modification de l'URL de l'API

Pour changer l'URL du backend, modifiez dans `lib/services/api_service.dart` :

```dart
static const String baseUrl = kDebugMode
    ? 'https://finea-api.cloud/api'  // Développement
    : 'https://your-api-domain.com/api';  // Production
```

### Gestion des erreurs personnalisées

Utilisez `ErrorHandler` pour afficher des messages d'erreur :

```dart
import '../utils/error_handler.dart';

// Afficher une erreur
ErrorHandler.showError(context, 'Message d\'erreur');

// Afficher un succès
ErrorHandler.showSuccess(context, 'Opération réussie');
```

### Ajout de nouvelles fonctionnalités API

1. **Backend** : Ajoutez des routes dans `backend/routes/`
2. **Flutter** : Ajoutez des méthodes dans `ApiService`
3. **État** : Utilisez `AuthService` ou créez un nouveau service

## 🐛 Résolution des problèmes

### Erreur de connexion à l'API

- Vérifiez que le backend est démarré
- Vérifiez l'URL dans `api_service.dart`
- Vérifiez les paramètres CORS du backend

### Erreurs de génération JSON

```bash
flutter packages pub run build_runner clean
flutter packages pub run build_runner build --delete-conflicting-outputs
```

### Erreurs de dépendances

```bash
flutter clean
flutter pub get
```

### Erreurs MongoDB

- Vérifiez que MongoDB est démarré
- Vérifiez l'URL de connexion dans `.env`
- Vérifiez les permissions réseau

## 📚 Structure des fichiers importants

```
lib/
├── models/
│   └── user_model.dart         # Modèles de données
├── services/
│   ├── api_service.dart        # Communication API
│   └── auth_service.dart       # Gestion authentification
├── screens/
│   ├── login_screen.dart       # Écran de connexion
│   ├── register_screen.dart    # Écran d'inscription
│   └── forgot_password_screen.dart # Mot de passe oublié
├── utils/
│   └── error_handler.dart      # Gestion d'erreurs
└── main.dart                   # Configuration des providers

backend/
├── controllers/                # Logique métier
├── models/                     # Modèles de données
├── routes/                     # Routes API
├── services/                   # Services (email, etc.)
├── middleware/                 # Middlewares de sécurité
└── server.js                   # Serveur principal
```

## 🚀 Déploiement

### Backend

1. **Heroku** : Utilisez le Procfile fourni
2. **DigitalOcean** : Utilisez PM2 pour la gestion des processus
3. **MongoDB Atlas** : Pour la base de données en production

### Flutter

1. **Android** : `flutter build apk --release`
2. **iOS** : `flutter build ios --release`
3. **Web** : `flutter build web`

## 📞 Support

En cas de problème :

1. Vérifiez les logs du backend : `npm run dev`
2. Vérifiez les logs Flutter : `flutter run --verbose`
3. Consultez la documentation de l'API dans `backend/README.md`

Votre application Finéa Académie est maintenant complètement intégrée avec un backend fonctionnel ! 🎉
