# 🐛 Guide de Debug - Notifications Push

## Problème Actuel

- ✅ Notifications globales envoyées avec succès via OneSignal
- ❌ Aucune notification reçue sur le téléphone
- ❌ Test sur utilisateur échoue : "Aucun token push actif"

## Diagnostic : Pourquoi vous ne recevez rien

### 1. Vérifier que l'app Flutter s'enregistre

**Ouvrez l'app Flutter sur votre téléphone et connectez-vous avec `test@finea-academie.fr`**

**Dans les logs Flutter, cherchez :**

```
🚀 Initialisation OneSignal avec App ID: d56e585c-9fc7-4a58-8277...
✅ OneSignal SDK initialisé
📱 Permission notifications: granted
✅ Handlers OneSignal configurés
🔍 Tentative d'obtention du Player ID OneSignal...
🔍 Player ID brut de OneSignal: [UUID_VALIDE]
✅ Player ID OneSignal obtenu et enregistré: xxxxxxxx-xxxx-xxxx...
📤 Envoi du Player ID au serveur: [UUID] (platform: android, device: [UUID])
✅ Player ID OneSignal enregistré sur le serveur avec succès
```

**Si vous NE voyez PAS ces logs :**
- L'app ne s'initialise pas avec OneSignal
- Redémarrez l'app complètement
- Vérifiez que l'App ID est correct dans `main.dart`

**Si vous voyez une erreur :**
- Copiez l'erreur complète et envoyez-la moi

### 2. Vérifier les logs du Backend

**Quand l'utilisateur se connecte, vous devriez voir dans les logs backend :**

```
📱 Player ID OneSignal enregistré pour test@finea-academie.fr (android)
```

**Si vous ne voyez PAS ce log :**
- L'app Flutter n'envoie pas le Player ID au serveur
- Vérifiez la connexion réseau
- Vérifiez que l'utilisateur est bien authentifié

### 3. Vérifier dans l'Admin Dashboard

1. Allez sur **Push Notifications**
2. Vérifiez la liste des appareils
3. Votre utilisateur devrait avoir un **Player ID valide** (UUID format)

**Si l'appareil n'apparaît pas ou n'a pas de Player ID valide :**
- L'enregistrement n'a pas fonctionné
- Reconnectez-vous dans l'app Flutter
- Attendez 5-10 secondes
- Actualisez la page admin

### 4. Nettoyer les Tokens Invalides

Exécutez ce script pour supprimer les anciens tokens :

```bash
cd backend
node scripts/clean-invalid-tokens.js
```

## Actions Correctives

### Solution 1 : Forcer la réinitialisation de OneSignal dans l'app

1. **Désinstallez et réinstallez l'app Flutter** (pour nettoyer le cache OneSignal)
2. **Relancez l'app**
3. **Connectez-vous** avec `test@finea-academie.fr`
4. **Vérifiez les logs** pour voir le Player ID

### Solution 2 : Vérifier les permissions

Sur Android :
1. Paramètres → Apps → Finéa Académie
2. Notifications → **ACTIVER** ✅
3. Autorisations → Notifications → **AUTORISER** ✅

### Solution 3 : Vérifier que OneSignal fonctionne

1. Allez sur https://onesignal.com
2. Connectez-vous
3. Allez dans votre app
4. Vérifiez dans **"Delivery"** ou **"Audience"** → **"Segments"** → **"All Users"**
5. Vous devriez voir au moins 1 utilisateur si l'app s'est enregistrée

## Test Manuel Rapide

### Depuis OneSignal Dashboard

1. Allez sur https://onesignal.com → Votre App → **Messages** → **New Push**
2. Écrivez un message de test
3. Sélectionnez **"All Users"** ou **"Test Device"** (si vous avez enregistré un device de test)
4. Envoyez
5. **Vérifiez si la notification arrive** sur votre téléphone

Si la notification arrive depuis OneSignal Dashboard mais pas depuis votre admin :
- Le problème est dans votre code backend/admin
- OneSignal fonctionne correctement

Si la notification n'arrive pas même depuis OneSignal Dashboard :
- Le problème est dans la configuration OneSignal ou dans l'app Flutter
- Vérifiez l'enregistrement OneSignal dans l'app

## Prochaines Étapes

Une fois que vous avez vérifié les points ci-dessus, envoyez-moi :

1. **Les logs Flutter** après connexion (les lignes avec OneSignal/Player ID)
2. **Les logs Backend** quand vous essayez d'envoyer une notification
3. **Un screenshot de la page "Push Notifications"** dans l'admin montrant les appareils

Et je pourrai identifier exactement où ça bloque ! 🔍

