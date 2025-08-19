# 📱 Guide des Notifications Push - Finéa Académie

## 🎯 Vue d'ensemble

Ce système permet d'envoyer des notifications push directement sur les téléphones des utilisateurs depuis le dashboard admin. Les notifications fonctionnent même quand l'application est fermée et font sonner le téléphone.

## ✨ Fonctionnalités

- ✅ **Notifications push en temps réel** avec Firebase Cloud Messaging (FCM)
- ✅ **Interface admin complète** pour envoyer des notifications
- ✅ **Support Android/iOS/Web** avec gestion automatique des plateformes
- ✅ **Templates prédéfinis** pour différents types de notifications
- ✅ **Ciblage flexible** : tous les utilisateurs, par rôles, ou utilisateurs spécifiques
- ✅ **Statistiques détaillées** : succès, échecs, appareils connectés
- ✅ **Navigation intelligente** : ouvre l'app sur la bonne page selon le type de notification
- ✅ **Gestion automatique des tokens** : enregistrement, suppression, nettoyage

## 🚀 Comment tester

### 1. Configuration Firebase (IMPORTANT)

Avant de tester, vous devez configurer Firebase :

1. **Créer un projet Firebase** sur https://console.firebase.google.com/
2. **Activer Cloud Messaging** dans votre projet
3. **Remplacer les valeurs** dans `lib/firebase_options.dart` avec vos vraies clés
4. **Télécharger `google-services.json`** et le placer dans `android/app/`
5. **Mettre à jour les variables d'environnement** backend avec vos clés Firebase

### 2. Configuration Backend

```bash
# Dans backend/.env
FIREBASE_PROJECT_ID=votre-projet-firebase-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account"...}
```

### 3. Test étape par étape

#### Étape 1 : Démarrer les services
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Admin Dashboard  
cd admin-dashboard
npm install
npm start

# Terminal 3 - App Flutter
flutter pub get
flutter run
```

#### Étape 2 : Tester l'enregistrement des tokens
1. **Ouvrir l'app Flutter** sur émulateur/téléphone
2. **Vérifier les logs** : vous devriez voir "✅ Token FCM enregistré"
3. **Aller dans l'admin dashboard** → Push Notifications
4. **Vérifier que l'appareil apparaît** dans la liste des appareils connectés

#### Étape 3 : Envoyer une notification de test
1. **Dans l'admin dashboard** → Push Notifications
2. **Cliquer sur "Test"** à côté d'un utilisateur
3. **Vérifier que la notification arrive** sur le téléphone

#### Étape 4 : Envoyer une notification complète
1. **Cliquer sur "Envoyer une Notification"**
2. **Choisir un template** ou écrire un message personnalisé
3. **Sélectionner les destinataires** (tous, par rôle, ou spécifiques)
4. **Cliquer sur "Envoyer"**
5. **Vérifier que la notification arrive** et fait sonner le téléphone

#### Étape 5 : Tester la navigation
1. **Envoyer une notification avec type "course"**
2. **Taper sur la notification** sur le téléphone
3. **Vérifier que l'app s'ouvre** sur la bonne page

## 🛠 Résolution des problèmes

### Problème : Les notifications n'arrivent pas

**Solutions :**
1. **Vérifier Firebase** : projet créé et configuré
2. **Vérifier les clés** dans `firebase_options.dart`
3. **Vérifier les permissions** Android dans les paramètres du téléphone
4. **Vérifier les logs** backend pour les erreurs FCM
5. **Redémarrer l'app** après changement de configuration

### Problème : Token FCM non enregistré

**Solutions :**
1. **Vérifier la connexion internet** de l'app
2. **Vérifier l'authentification** utilisateur (token JWT)
3. **Vérifier les logs** de l'app Flutter
4. **Redémarrer l'app** complètement

### Problème : Notifications arrivent mais sans son

**Solutions :**
1. **Vérifier les paramètres** de notification du téléphone
2. **Vérifier le mode "Ne pas déranger"**
3. **Tester sur un vrai téléphone** (pas émulateur)
4. **Vérifier la priorité** de la notification (urgent/high)

### Problème : Admin dashboard ne montre pas les appareils

**Solutions :**
1. **Vérifier que l'app Flutter est connectée** et a envoyé son token
2. **Vérifier les routes API** `/api/push-notifications/devices`
3. **Vérifier les logs backend** pour les erreurs
4. **Actualiser la page** admin

## 📊 Interface Admin

### Dashboard Push Notifications

L'interface admin offre :

- **📈 Statistiques** : total envoyées, appareils connectés, succès/échecs
- **📱 Répartition par plateforme** : Android, iOS, Web
- **👥 Appareils récents** : liste des utilisateurs avec leurs appareils
- **🚀 Envoi de notifications** : interface complète avec templates

### Templates disponibles

1. **🎓 Nouveau cours** - Annonce de nouvelle formation
2. **📚 Rappel** - Rappel de continuer l'apprentissage  
3. **🎉 Concours** - Nouveau concours disponible
4. **🔧 Maintenance** - Alerte de maintenance

### Types de ciblage

1. **Tous les utilisateurs** - Notification globale
2. **Par rôle** - Admin, utilisateurs, modérateurs
3. **Utilisateurs spécifiques** - Sélection manuelle

## 🔧 Configuration avancée

### Personnaliser les notifications

Dans `backend/services/pushNotificationService.js` :
- Modifier les **couleurs** et **icônes**
- Ajouter des **canaux de notification** personnalisés
- Configurer les **priorités** par type

### Ajouter des types de navigation

Dans `lib/services/push_notification_service.dart` :
- Ajouter de nouveaux **types de notification**
- Personnaliser la **logique de navigation**
- Ajouter des **actions personnalisées**

## 📱 Test sur différentes plateformes

### Android
- ✅ **Notifications push natives**
- ✅ **Son et vibration**
- ✅ **Icône et couleur personnalisées**
- ✅ **Navigation au tap**

### iOS (nécessite certificats Apple)
- ✅ **Notifications push natives**
- ✅ **Son et badges**
- ✅ **Navigation au tap**

### Web
- ✅ **Notifications navigateur**
- ✅ **Permission explicite**
- ✅ **Navigation au clic**

## 🎉 Félicitations !

Si vous arrivez à envoyer des notifications depuis l'admin dashboard et les recevoir sur votre téléphone avec le son, le système fonctionne parfaitement ! 

Les utilisateurs de votre app pourront maintenant recevoir :
- 📢 **Annonces importantes**
- 🎓 **Nouvelles formations**
- 🏆 **Résultats de concours**
- 💡 **Rappels d'apprentissage**
- 🔔 **Alertes système**

## 📞 Support

En cas de problème :
1. Vérifiez les **logs de l'app** Flutter avec `flutter logs`
2. Vérifiez les **logs du backend** 
3. Testez d'abord sur un **vrai téléphone Android**
4. Consultez la documentation Firebase si nécessaire

**Bonne notification ! 🚀📱**
