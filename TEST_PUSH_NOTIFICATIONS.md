# 🧪 Guide de Test des Notifications Push

## ✅ Prérequis

1. **OneSignal configuré** dans `backend/.env` (déjà fait ✅)
2. **Backend démarré** sur le port 5001
3. **Admin Dashboard démarré**
4. **App Flutter lancée** sur un appareil réel (Android ou iOS)

## 🚀 Étapes de Test

### 1. Démarrer le Backend

```bash
cd backend
npm install  # Si pas encore fait
npm start
```

Vérifiez que vous voyez :
```
✅ Service OneSignal initialisé
🚀 Serveur démarré sur le port 5001
```

### 2. Démarrer l'Admin Dashboard

```bash
cd admin-dashboard
npm install  # Si pas encore fait
npm start
```

L'admin dashboard devrait s'ouvrir sur `http://localhost:3000`

### 3. Configurer l'App Flutter

**IMPORTANT** : Dans `lib/main.dart`, ligne 96, configurez votre App ID OneSignal :

```dart
const String oneSignalAppId = 'd56e585c-9fc7-4a58-8277-4b1d7ed334f1'; // Votre App ID depuis .env
```

Puis :

```bash
flutter pub get
flutter run  # Sur un appareil réel (pas émulateur)
```

### 4. Se connecter avec l'App Flutter

- Ouvrez l'app Flutter sur votre téléphone
- Connectez-vous avec un compte utilisateur
- Vérifiez les logs : vous devriez voir `🔑 Player ID OneSignal obtenu` et `✅ Player ID OneSignal enregistré sur le serveur`

### 5. Accéder à l'Admin Dashboard

1. Ouvrez `http://localhost:3000`
2. Connectez-vous en tant qu'admin
3. Cliquez sur **"Push Notifications"** dans le menu de gauche

### 6. Vérifier les Appareils Connectés

Dans la page "Push Notifications", vous devriez voir :
- **Statistiques** : nombre d'appareils connectés
- **Appareils récemment connectés** : votre téléphone devrait apparaître avec son email et sa plateforme (Android/iOS)

Si aucun appareil n'apparaît :
- Vérifiez que l'utilisateur est bien connecté dans l'app
- Vérifiez les logs du backend pour les erreurs
- Attendez quelques secondes et actualisez la page

### 7. Envoyer une Notification de Test

#### Option A : Test rapide sur un utilisateur spécifique

1. Dans la liste des appareils, trouvez votre utilisateur
2. Cliquez sur le bouton **"Test"** à côté de votre nom
3. La notification devrait arriver sur votre téléphone dans quelques secondes

#### Option B : Envoyer une notification personnalisée

1. Cliquez sur **"Envoyer une Notification"** (bouton en haut à droite)
2. Remplissez le formulaire :
   - **Titre** : "Test depuis Admin"
   - **Message** : "Ceci est un test !"
   - **Type** : Sélectionnez "Général"
   - **Priorité** : "Normale"
   - **Ciblage** : 
     - Pour tester sur vous-même : Sélectionnez "Utilisateurs spécifiques" et cochez votre email
     - Pour tester sur tous : Sélectionnez "Tous les utilisateurs"
3. Cliquez sur **"Envoyer la notification push"**

### 8. Vérifier la Réception

La notification devrait :
- ✅ Apparaître sur votre téléphone dans les 5-10 secondes
- ✅ Faire sonner le téléphone (si pas en mode silencieux)
- ✅ S'afficher dans la barre de notifications
- ✅ Au tap : ouvrir l'app

## 🐛 Résolution de Problèmes

### Problème : Aucun appareil dans la liste

**Solutions :**
1. Vérifiez que l'app Flutter est bien connectée (utilisateur authentifié)
2. Vérifiez les logs du backend :
   ```bash
   # Vous devriez voir :
   📱 Player ID OneSignal enregistré pour email@example.com (android)
   ```
3. Vérifiez que l'App ID OneSignal est correct dans `main.dart`
4. Vérifiez les permissions de notifications sur le téléphone

### Problème : La notification n'arrive pas

**Solutions :**
1. **Vérifiez les logs du backend** après l'envoi :
   ```bash
   # Vous devriez voir :
   📱 Notifications OneSignal: X/1 succès
   ```
2. **Vérifiez les variables OneSignal** dans `.env` :
   ```env
   ONESIGNAL_APP_ID=d56e585c-9fc7-4a58-8277-4b1d7ed334f1
   ONESIGNAL_REST_API_KEY=os_v2_app_2vxfqxe7y5ffratxjmox5uzu6hcm6jp6kmjeiynu5gcjgm4cklvkq5phdpgjsawo4br5nbttar5vvwbyhup6atp5yd7hnnllew6dgmy
   ```
3. **Testez sur un appareil réel** (les notifications ne fonctionnent pas sur émulateur)
4. **Vérifiez les paramètres de notifications** du téléphone :
   - Android : Paramètres → Apps → Finéa Académie → Notifications (activer)
   - iOS : Paramètres → Notifications → Finéa Académie (activer)
5. **Vérifiez que le mode "Ne pas déranger" est désactivé**

### Problème : Erreur OneSignal dans les logs backend

**Messages d'erreur courants :**

- `All included players are not subscribed` : L'utilisateur n'a pas accepté les notifications ou le Player ID est invalide
- `Invalid app_id` : Vérifiez que `ONESIGNAL_APP_ID` est correct
- `Invalid REST API key` : Vérifiez que `ONESIGNAL_REST_API_KEY` est correct

**Solutions :**
1. Vérifiez que les clés OneSignal sont correctes dans `.env`
2. Allez sur https://onesignal.com → Votre App → Settings → Keys & IDs
3. Copiez-collez les clés exactement (sans espaces)

### Problème : L'admin dashboard ne peut pas se connecter au backend

**Solutions :**
1. Vérifiez que le backend tourne sur `http://localhost:5001`
2. Vérifiez que l'API est accessible : ouvrez `http://localhost:5001/api/health` dans le navigateur
3. Vérifiez la console du navigateur (F12) pour les erreurs CORS

## 📊 Vérification Complète du Flux

### Checklist avant de tester

- [ ] Backend démarré avec OneSignal configuré ✅
- [ ] Admin Dashboard démarré et accessible ✅
- [ ] App Flutter lancée sur appareil réel ✅
- [ ] App ID OneSignal configuré dans `main.dart` ⚠️ À FAIRE
- [ ] Utilisateur connecté dans l'app Flutter
- [ ] Permissions de notifications accordées sur le téléphone

### Checklist après l'envoi

- [ ] La notification apparaît sur le téléphone ✅
- [ ] La notification fait sonner le téléphone ✅
- [ ] Le titre et le message sont corrects ✅
- [ ] Au tap, l'app s'ouvre ✅
- [ ] Les statistiques dans l'admin sont mises à jour ✅

## 🎯 Test Avancé : Notification Globale

Pour tester une notification à tous les utilisateurs :

1. Dans l'admin dashboard → Push Notifications
2. Cliquez sur "Envoyer une Notification"
3. Sélectionnez **"Tous les utilisateurs"**
4. Remplissez le titre et le message
5. Envoyez

**Note** : OneSignal enverra la notification à tous les appareils enregistrés dans votre app OneSignal, pas seulement ceux dans votre base MongoDB.

## 📝 Logs Utiles

### Backend (terminal)

```
✅ Service OneSignal initialisé
📱 Player ID OneSignal enregistré pour user@example.com (android)
📱 Notification envoyée via OneSignal (chunk): abc123def456
📱 Notifications OneSignal: 1/1 succès
```

### App Flutter (logs)

```
✅ Service OneSignal initialisé (en attente de App ID)
✅ OneSignal initialisé avec App ID: d56e585c-9fc7-4a58-8277-4b1d7ed334f1
🔑 Player ID OneSignal obtenu: abc123def456...
✅ Player ID OneSignal enregistré sur le serveur
📱 Notification reçue: Test depuis Admin
```

## ✨ C'est Prêt !

Une fois tout configuré, vous pouvez envoyer des notifications push depuis l'admin dashboard vers tous vos utilisateurs Android et iPhone ! 🎉

