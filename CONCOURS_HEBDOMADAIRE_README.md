# 🎯 Système de Concours Hebdomadaire - Finéa Académie

## 📋 Vue d'ensemble

Le système de concours hebdomadaire permet d'organiser automatiquement des tirages au sort chaque semaine. Les utilisateurs peuvent participer gratuitement et un gagnant est sélectionné automatiquement le samedi à 20h.

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Modèle Contest** : Gestion des concours avec champs spécifiques pour les concours hebdomadaires
- **Service WeeklyContestService** : Logique métier pour la gestion automatique
- **Service SchedulerService** : Planificateur automatique pour les tirages
- **API Routes** : Endpoints pour la gestion des concours

### Admin Dashboard (React)
- **Page WeeklyContest** : Interface d'administration complète
- **Gestion des concours** : Création, monitoring, tirage manuel
- **Statistiques** : Suivi des participants et résultats

### Application Flutter
- **Service ContestService** : Communication avec l'API
- **Modèle Contest** : Structure des données
- **Widget ContestVideoSection** : Interface utilisateur pour la participation

## 🚀 Installation et Configuration

### 1. Backend

```bash
cd backend
npm install
```

### 2. Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
```

### 3. Initialisation du premier concours

```bash
cd backend
node scripts/init-weekly-contest.js
```

## 📅 Fonctionnement

### Cycle hebdomadaire

1. **Dimanche 00h00** : Début du concours
2. **Lundi-Samedi** : Période de participation
3. **Samedi 20h00** : Tirage automatique
4. **Dimanche 00h00** : Nouveau concours

### Tirage automatique

Le système vérifie toutes les 5 minutes s'il y a des concours à tirer. Le tirage se fait automatiquement à 20h le samedi.

## 🔧 API Endpoints

### Concours hebdomadaire

```bash
# Obtenir le concours actuel
GET /api/contests/weekly/current

# Participer au concours
POST /api/contests/weekly/participate
Authorization: Bearer <token>

# Créer un concours (Admin)
POST /api/contests/weekly
Authorization: Bearer <token>

# Effectuer le tirage (Admin)
POST /api/contests/weekly/draw
Authorization: Bearer <token>

# Statistiques
GET /api/contests/weekly/stats

# Historique
GET /api/contests/weekly/history?limit=10
```

## 🎮 Utilisation

### Pour les utilisateurs (Flutter)

1. **Participation** : Cliquer sur "Prendre mes places !"
2. **Vérification** : Le bouton devient "Participation enregistrée !"
3. **Attente** : Le tirage a lieu automatiquement le samedi à 20h
4. **Notification** : Le gagnant reçoit un email automatique

### Pour les administrateurs (Dashboard)

1. **Accès** : Aller dans "Concours Hebdomadaire" dans le menu
2. **Création** : Cliquer sur "Créer un concours" si nécessaire
3. **Monitoring** : Suivre les participants en temps réel
4. **Tirage manuel** : Possibilité de déclencher le tirage manuellement
5. **Historique** : Consulter les résultats des concours précédents

## 📊 Fonctionnalités

### ✅ Implémentées

- [x] Création automatique des concours hebdomadaires
- [x] Participation des utilisateurs
- [x] Tirage automatique le samedi à 20h
- [x] Notification email au gagnant
- [x] Interface d'administration complète
- [x] Statistiques en temps réel
- [x] Historique des concours
- [x] Gestion des erreurs et validation

### 🔄 Automatisation

- **Planificateur** : Vérification toutes les 5 minutes
- **Tirage** : Sélection aléatoire du gagnant
- **Emails** : Notification automatique au gagnant
- **Statuts** : Mise à jour automatique des statuts

## 🛠️ Maintenance

### Vérification du planificateur

```bash
GET /api/scheduler/status
```

### Logs

Les logs du planificateur apparaissent dans la console du serveur :

```
⏰ Planificateur de concours hebdomadaires démarré
🎲 Tirage effectué pour le concours: Concours Hebdomadaire - Semaine 25 2024
📧 Email de victoire envoyé à user@example.com
```

### Nettoyage

Le système nettoie automatiquement les anciens concours (plus d'un an) :

```javascript
await WeeklyContestService.cleanupOldContests();
```

## 🔒 Sécurité

- **Authentification** : JWT requis pour la participation
- **Validation** : Vérification des données côté serveur
- **Rate limiting** : Protection contre les abus
- **CORS** : Configuration sécurisée

## 📱 Interface utilisateur

### États du bouton de participation

1. **Non connecté** : "Prendre mes places !" → Redirige vers connexion
2. **Connecté, non participant** : "Prendre mes places !" → Participe
3. **Participant** : "Participation enregistrée !" → Désactivé
4. **Chargement** : Spinner → En cours de traitement

### Affichage du concours

- **Titre et description** du concours actuel
- **Statut** : En cours, À venir, Terminé, Tirage en cours
- **Temps restant** : Jours/heures/minutes jusqu'à la fin
- **Nombre de participants** en temps réel

## 🎯 Prochaines améliorations

- [ ] Notifications push pour les résultats
- [ ] Système de points/badges
- [ ] Concours spéciaux (événements)
- [ ] Intégration avec les réseaux sociaux
- [ ] Analytics avancées
- [ ] Système de parrainage

## 🆘 Dépannage

### Problèmes courants

1. **Concours non créé** : Exécuter le script d'initialisation
2. **Tirage non effectué** : Vérifier les logs du planificateur
3. **Email non envoyé** : Vérifier la configuration SMTP
4. **Erreur de participation** : Vérifier l'authentification utilisateur

### Commandes utiles

```bash
# Vérifier le statut du planificateur
curl https://finea-api.up.railway.app/api/scheduler/status

# Obtenir le concours actuel
curl https://finea-api.up.railway.app/api/contests/weekly/current

# Vérifier la santé de l'API
curl https://finea-api.up.railway.app/api/health
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs du serveur
2. Consultez la documentation API
3. Testez les endpoints avec Postman
4. Contactez l'équipe technique

---

**🎉 Le système de concours hebdomadaire est maintenant opérationnel !**
