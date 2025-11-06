# 🚀 Test Rapide des Notifications Push

## ✨ Configuration déjà faite ✅

- ✅ Backend avec OneSignal configuré
- ✅ Admin Dashboard prêt
- ✅ App ID configuré dans `main.dart`

## 📱 Étapes de Test (5 minutes)

### 1️⃣ Démarrer le Backend

```bash
cd backend
npm start
```

Vérifiez les logs : `✅ Service OneSignal initialisé`

### 2️⃣ Démarrer l'Admin Dashboard

```bash
cd admin-dashboard
npm start
```

Ouvrez `http://localhost:3000`

### 3️⃣ Lancer l'App Flutter

```bash
flutter pub get
flutter run  # Sur un appareil RÉEL (pas émulateur)
```

- **Connectez-vous** avec un compte utilisateur
- Vérifiez les logs : `🔑 Player ID OneSignal obtenu`

### 4️⃣ Tester depuis l'Admin

1. **Allez sur** `http://localhost:3000`
2. **Connectez-vous** en tant qu'admin
3. **Cliquez** sur "Push Notifications" dans le menu
4. **Vérifiez** que votre appareil apparaît dans la liste (votre email)

### 5️⃣ Envoyer une Notification

#### Option A : Test Rapide
- Trouvez votre nom dans la liste des appareils
- Cliquez sur **"Test"** à côté de votre nom
- ✅ Notification devrait arriver dans 5-10 secondes

#### Option B : Notification Personnalisée
1. Cliquez sur **"Envoyer une Notification"**
2. Remplissez :
   - Titre : "🎉 Test"
   - Message : "Cette notification vient de l'admin !"
   - Ciblage : "Utilisateurs spécifiques" → Cochez votre email
3. Cliquez sur **"Envoyer la notification push"**

## ⚠️ Si ça ne marche pas

### Aucun appareil dans la liste ?
- Vérifiez que l'utilisateur est **connecté** dans l'app Flutter
- Vérifiez les **logs du backend** : `📱 Player ID OneSignal enregistré pour...`
- **Attendez 10 secondes** et actualisez la page admin

### La notification n'arrive pas ?
- Vérifiez les **logs du backend** après l'envoi
- Testez sur un **appareil réel** (pas émulateur)
- Vérifiez les **permissions de notifications** sur le téléphone :
  - Android : Paramètres → Apps → Finéa Académie → Notifications ✅
  - iOS : Paramètres → Notifications → Finéa Académie ✅

### Erreur dans les logs backend ?
- Vérifiez que les clés OneSignal sont correctes dans `backend/.env`
- Vérifiez que l'App ID dans `main.dart` correspond à `ONESIGNAL_APP_ID` dans `.env`

## 🎯 Test Complet

1. ✅ Backend démarré → Logs OneSignal OK
2. ✅ Admin Dashboard accessible → Page Push Notifications visible
3. ✅ App Flutter connectée → Player ID enregistré
4. ✅ Appareil visible dans admin → Votre email apparaît
5. ✅ Notification envoyée → Arrive sur le téléphone dans 5-10 sec

**C'est tout !** 🎉

Plus de détails ? Voir `TEST_PUSH_NOTIFICATIONS.md`

