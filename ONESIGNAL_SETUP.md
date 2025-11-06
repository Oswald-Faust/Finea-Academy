# 📱 Configuration OneSignal pour les Notifications Push

## 🎯 Vue d'ensemble

Ce projet utilise **OneSignal** au lieu de Firebase pour envoyer des notifications push. OneSignal est **gratuit jusqu'à 10,000 utilisateurs** et beaucoup plus simple à configurer que Firebase.

## ✅ Avantages de OneSignal

- 🆓 **Gratuit** jusqu'à 10,000 utilisateurs
- 🚀 **Simple** : pas besoin de fichiers de configuration complexes
- 📱 **Supporte Android, iOS et Web**
- 🎯 **API REST** facile à utiliser depuis le backend
- 📊 **Dashboard** pour voir les statistiques

## 📋 Étapes de configuration

### 1. Créer un compte OneSignal

1. Allez sur https://onesignal.com
2. Créez un compte gratuit
3. Cliquez sur "New App/Website"

### 2. Configurer l'application

#### Pour Android :
1. Choisissez **"Google Android (FCM - Firebase Cloud Messaging)"** ou **"Google Android (GCM)"**
2. Suivez les instructions pour configurer Firebase (nécessaire pour Android)
   - Téléchargez `google-services.json` et placez-le dans `android/app/`
3. Récupérez votre **App ID** et votre **REST API Key**

#### Pour iOS :
1. Choisissez **"Apple iOS (APNs)"**
2. Configurez votre certificat Apple Push Notification
3. Récupérez votre **App ID**

#### Pour Web :
1. Choisissez **"Web Push"**
2. Configurez votre domaine

### 3. Configurer le Backend

Ajoutez ces variables dans votre fichier `.env` du backend :

```env
ONESIGNAL_APP_ID=votre-app-id-onesignal
ONESIGNAL_REST_API_KEY=votre-rest-api-key-onesignal
```

**Où trouver ces clés :**
- **App ID** : Dans OneSignal Dashboard → Settings → Keys & IDs → OneSignal App ID
- **REST API Key** : Dans OneSignal Dashboard → Settings → Keys & IDs → REST API Key

### 4. Configurer l'App Flutter

#### Étape 1 : Installer les dépendances

Les dépendances sont déjà ajoutées dans `pubspec.yaml`. Exécutez :

```bash
flutter pub get
```

#### Étape 2 : Configurer l'App ID

Dans `lib/main.dart`, cherchez cette ligne :

```dart
const String? oneSignalAppId = null; // TODO: Configurez votre App ID OneSignal ici
```

Et remplacez-la par :

```dart
const String oneSignalAppId = 'VOTRE_APP_ID_ONESIGNAL';
```

**OU** créez un fichier `lib/config/onesignal_config.dart` :

```dart
class OneSignalConfig {
  static const String appId = 'VOTRE_APP_ID_ONESIGNAL';
}
```

Puis dans `main.dart` :

```dart
import 'config/onesignal_config.dart';

// ...
await pushNotificationService.initializeWithAppId(OneSignalConfig.appId);
```

### 5. Configuration Android

Si vous utilisez FCM pour Android, vous devez avoir `google-services.json` dans `android/app/`.

**Note** : Même si OneSignal utilise FCM pour Android, vous n'avez pas besoin de configurer Firebase complètement dans votre code - OneSignal gère tout.

### 6. Configuration iOS

Pour iOS, vous devez configurer les certificats APNs dans OneSignal Dashboard.

## 🧪 Tester

1. **Démarrer le backend** avec les variables d'environnement OneSignal
2. **Lancer l'app Flutter** sur un appareil réel (les notifications ne fonctionnent pas sur émulateur)
3. **Se connecter** pour que l'app enregistre le Player ID
4. **Aller dans l'admin dashboard** → Push Notifications
5. **Vérifier** que votre appareil apparaît dans la liste
6. **Envoyer une notification de test**

## 📊 Utiliser le Dashboard Admin

L'interface admin est déjà configurée pour utiliser OneSignal. Vous pouvez :

- ✅ Voir les appareils connectés
- ✅ Envoyer des notifications à tous les utilisateurs
- ✅ Envoyer des notifications par rôle
- ✅ Envoyer des notifications à des utilisateurs spécifiques
- ✅ Voir les statistiques

## 🔧 Endpoints API

Les endpoints REST sont les mêmes, mais utilisent maintenant OneSignal :

- `POST /api/push-notifications/register` - Enregistrer un Player ID
- `POST /api/push-notifications/send` - Envoyer une notification
- `GET /api/push-notifications/devices` - Liste des appareils
- `GET /api/push-notifications/stats` - Statistiques

## 🐛 Résolution de problèmes

### Les notifications n'arrivent pas

1. Vérifiez que l'App ID est correctement configuré dans `main.dart`
2. Vérifiez les variables d'environnement du backend
3. Vérifiez que l'utilisateur est bien connecté (le Player ID s'enregistre à la connexion)
4. Testez sur un appareil réel (pas émulateur)
5. Vérifiez les logs du backend pour les erreurs OneSignal

### Player ID non enregistré

1. Vérifiez la connexion internet
2. Vérifiez que l'utilisateur est authentifié
3. Vérifiez les logs Flutter : vous devriez voir "🔑 Player ID OneSignal obtenu"

### Erreur OneSignal dans les logs backend

1. Vérifiez que `ONESIGNAL_APP_ID` et `ONESIGNAL_REST_API_KEY` sont corrects
2. Vérifiez que les clés n'ont pas d'espaces avant/après
3. Vérifiez les logs OneSignal Dashboard pour plus de détails

## 📚 Documentation

- [Documentation OneSignal](https://documentation.onesignal.com/)
- [SDK Flutter OneSignal](https://documentation.onesignal.com/docs/flutter-sdk-setup)

## ✨ Félicitations !

Une fois configuré, vous pouvez envoyer des notifications push directement depuis l'admin dashboard vers tous vos utilisateurs Android et iPhone ! 🎉

