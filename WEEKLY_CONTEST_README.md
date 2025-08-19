# 🎯 Système de Concours Hebdomadaire - Finéa Académie

## 📋 Vue d'ensemble

Le système de concours hebdomadaire permet d'organiser automatiquement des tirages au sort chaque semaine. Un nouveau concours se met en place chaque dimanche et le tirage a lieu automatiquement le samedi à 20h.

## 🏗️ Architecture

### Backend (Node.js + MongoDB)
- **Modèle Contest** : Gère la structure des concours avec support des concours hebdomadaires
- **Service WeeklyContestService** : Logique métier pour la gestion automatique
- **Service SchedulerService** : Planificateur automatique des tirages
- **API REST** : Endpoints pour la gestion des concours

### Admin Dashboard (React)
- **Page WeeklyContest** : Interface d'administration pour gérer les concours
- **Création automatique** : Bouton pour créer un nouveau concours hebdomadaire
- **Suivi des participants** : Liste des participants et vainqueurs
- **Historique** : Historique des concours passés

### Application Flutter
- **Widget ContestVideoSection** : Interface utilisateur pour participer
- **Service ContestService** : Communication avec l'API backend
- **Modèle Contest** : Structure des données côté client

## 🚀 Installation et Configuration

### 1. Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` :
```env
MONGODB_URI=votre_uri_mongodb
NODE_ENV=development
```

Démarrer le serveur :
```bash
npm start
```

### 2. Admin Dashboard

```bash
cd admin-dashboard
npm install
npm start
```

### 3. Application Flutter

```bash
flutter pub get
flutter run
```

## 📅 Fonctionnement Automatique

### Création des Concours
- **Fréquence** : Chaque dimanche
- **Durée** : Du dimanche 00h00 au samedi 23h59
- **Tirage** : Samedi à 20h00

### Planificateur Automatique
Le `SchedulerService` vérifie toutes les 5 minutes :
- Si un concours doit être tiré
- Effectue le tirage automatique
- Envoie les notifications aux gagnants

## 🔧 API Endpoints

### Concours Hebdomadaire
- `GET /api/contests/weekly/current` - Concours actuel
- `POST /api/contests/weekly` - Créer un concours (Admin)
- `POST /api/contests/weekly/participate` - Participer (Utilisateur)
- `POST /api/contests/weekly/draw` - Effectuer le tirage (Admin)
- `GET /api/contests/weekly/stats` - Statistiques
- `GET /api/contests/weekly/history` - Historique

### Gestion des Concours
- `GET /api/contests` - Liste des concours
- `POST /api/contests` - Créer un concours (Admin)
- `PUT /api/contests/:id` - Modifier un concours (Admin)
- `DELETE /api/contests/:id` - Supprimer un concours (Admin)

## 🎮 Utilisation

### Pour les Administrateurs

1. **Accéder au Dashboard**
   - Aller sur `/weekly-contest`
   - Voir le concours actuel et les statistiques

2. **Créer un Concours**
   - Cliquer sur "Créer un concours"
   - Le système calcule automatiquement les dates

3. **Suivre les Participants**
   - Voir la liste des participants en temps réel
   - Surveiller le nombre d'inscriptions

4. **Effectuer le Tirage**
   - Le tirage se fait automatiquement
   - Possibilité de déclencher manuellement

### Pour les Utilisateurs

1. **Voir le Concours Actuel**
   - Afficher les informations du concours
   - Voir le nombre de participants
   - Consulter les règles

2. **Participer**
   - Cliquer sur "Prendre mes places !"
   - Confirmation de participation
   - Statut mis à jour en temps réel

## 🧪 Tests

### Tester le Backend

```bash
cd backend
node test-weekly-contest.js
```

### Tester l'API

```bash
# Vérifier le statut du planificateur
curl http://localhost:5000/api/scheduler/status

# Obtenir le concours actuel
curl http://localhost:5000/api/contests/weekly/current

# Créer un concours (avec token admin)
curl -X POST http://localhost:5000/api/contests/weekly \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔍 Monitoring

### Logs du Serveur
- Démarrage du planificateur
- Création des concours
- Exécution des tirages
- Erreurs et exceptions

### Statut du Planificateur
- `GET /api/scheduler/status`
- Vérifier si le planificateur fonctionne
- Dernière vérification effectuée

## 🚨 Dépannage

### Problèmes Courants

1. **Concours non créé automatiquement**
   - Vérifier que le planificateur est démarré
   - Contrôler les logs du serveur

2. **Tirage non effectué**
   - Vérifier la date de tirage
   - Contrôler le statut `autoDrawEnabled`

3. **Erreurs de participation**
   - Vérifier l'authentification utilisateur
   - Contrôler les dates du concours

### Logs Utiles

```bash
# Logs du planificateur
Planificateur de concours hebdomadaires démarré
Vérification initiale des tirages...
Tirage effectué pour le concours: Concours Hebdomadaire - Semaine X 2024

# Logs des concours
Nouveau concours hebdomadaire créé: Concours Hebdomadaire - Semaine X 2024
```

## 📈 Statistiques

Le système collecte automatiquement :
- Nombre total de concours
- Nombre de participants
- Taux de participation
- Historique des vainqueurs

## 🔐 Sécurité

- **Authentification** : JWT pour les routes protégées
- **Autorisation** : Rôles admin/utilisateur
- **Validation** : Vérification des données d'entrée
- **Rate Limiting** : Protection contre les abus

## 🚀 Déploiement

### Variables d'Environnement
```env
NODE_ENV=production
MONGODB_URI=mongodb://production-uri
PORT=5000
```

### Process Manager (PM2)
```bash
pm2 start server.js --name "finea-backend"
pm2 startup
pm2 save
```

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs du serveur
2. Consulter la documentation API
3. Tester avec les scripts de test
4. Contacter l'équipe de développement

---

**Finéa Académie** - Système de Concours Hebdomadaire v1.0.0
