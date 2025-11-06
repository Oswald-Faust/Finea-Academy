# 🔍 Guide de débogage des notifications push

## Problème actuel
- **0 appareils connectés** dans l'admin dashboard
- Les notifications échouent avec "Aucun token push actif pour cet utilisateur"
- L'app Flutter ne s'enregistre pas avec OneSignal

## ✅ Solution appliquée

### Changements dans le code
1. **Enregistrement automatique après connexion** : Le Player ID OneSignal est maintenant réenregistré automatiquement après chaque connexion, inscription ou reconnexion automatique.

2. **Meilleure gestion des erreurs** : Si l'enregistrement échoue (par exemple, utilisateur non connecté), le Player ID est conservé et réenregistré après connexion.

3. **Logs améliorés** : Les logs backend et Flutter sont maintenant plus détaillés pour faciliter le débogage.

## 📋 Étapes pour tester

### 1. Redémarrer l'app Flutter
```bash
# Arrêter l'app complètement puis relancer
flutter run
```

### 2. Observer les logs Flutter
Recherchez ces messages dans les logs Flutter :
```
🚀 Initialisation OneSignal avec App ID: ...
✅ OneSignal SDK initialisé
📱 Permission notifications: true (ou false)
✅ Handlers OneSignal configurés
🔍 Tentative d'obtention du Player ID OneSignal...
🔍 Player ID brut de OneSignal: [UUID]
📤 Envoi du Player ID au serveur: [UUID]
✅ Player ID OneSignal enregistré sur le serveur avec succès
```

### 3. Se connecter dans l'app
- Ouvrez l'app Flutter
- **Connectez-vous** avec votre compte de test (`test@finea-academie.fr` ou autre)
- Observer les logs pour voir :
  ```
  🔄 Réessai d'enregistrement du Player ID après connexion...
  📤 Envoi du Player ID au serveur: [UUID]
  ✅ Player ID OneSignal enregistré sur le serveur avec succès
  ```

### 4. Vérifier les logs backend
Dans les logs du backend, vous devriez voir :
```
📱 Enregistrement Player ID pour utilisateur [userId]: [UUID]... (android/ios)
✅ Player ID OneSignal enregistré pour [email]
```

### 5. Vérifier dans l'admin dashboard
- Rafraîchir la page `/push-notifications`
- Le nombre "Appareils connectés" devrait passer de 0 à 1 ou plus
- Vous devriez voir votre appareil dans "Appareils récemment connectés"

### 6. Tester l'envoi de notification
- Cliquez sur "Envoyer une Notification" dans l'admin dashboard
- Sélectionnez votre utilisateur de test ou "Tous les utilisateurs"
- Envoyez une notification de test
- Vous devriez recevoir la notification sur votre appareil Flutter

## 🐛 Si ça ne marche toujours pas

### Vérifier les permissions
1. **Android** : Vérifier que les notifications sont activées dans les paramètres de l'app
2. **iOS** : Vérifier que les notifications sont autorisées (l'app devrait demander la permission)

### Vérifier les logs
1. **Backend** : Regardez les logs pour voir si le Player ID est bien reçu
2. **Flutter** : Vérifiez les logs pour voir si OneSignal s'initialise correctement

### Vérifier OneSignal Dashboard
1. Allez sur https://onesignal.com
2. Ouvrez votre app
3. Allez dans "Audience" → "All Users"
4. Vérifiez qu'il y a des utilisateurs enregistrés avec des Player IDs valides (UUID)

### Réinitialiser complètement
Si rien ne fonctionne, essayez ceci :
1. Désinstallez complètement l'app Flutter
2. Supprimez les données de l'app si possible
3. Réinstallez l'app
4. Relancez et connectez-vous
5. Vérifiez les logs

## 📝 Notes importantes

- **Le Player ID n'est enregistré qu'APRÈS connexion** : Si vous n'êtes pas connecté, le Player ID ne sera pas enregistré sur le serveur, même s'il est obtenu par OneSignal.

- **Les anciens tokens FCM sont automatiquement nettoyés** : Si vous aviez des anciens tokens Firebase, ils sont automatiquement supprimés quand on détecte qu'ils ne sont pas des UUID valides.

- **Le retry après connexion** : Même si l'enregistrement échoue au démarrage (utilisateur non connecté), il sera réessayé automatiquement après connexion.

