# 🎯 Système de Concours Hebdomadaire - Guide de Test

## 📱 Fonctionnalités Implémentées

### 1. **Affichage du Concours Actuel**
- ✅ Titre et description du concours
- ✅ Dates de début, fin et tirage
- ✅ Statut du concours (Actif, Terminé, Tirage)
- ✅ Nombre de participants actuels
- ✅ Badge de statut coloré

### 2. **Participation au Concours**
- ✅ Bouton "Participer au concours"
- ✅ Vérification si l'utilisateur est déjà inscrit
- ✅ Gestion des états de chargement
- ✅ Messages de succès/erreur

### 3. **Compte à Rebours Dynamique**
- ✅ Compte à rebours en temps réel jusqu'au tirage
- ✅ Affichage des jours, heures, minutes, secondes
- ✅ Formatage automatique des dates en français

### 4. **Statistiques du Concours**
- ✅ Nombre total de concours cette année
- ✅ Total des participants
- ✅ Nombre de concours terminés

### 5. **Liste des Participants**
- ✅ Affichage de tous les participants
- ✅ Numérotation automatique
- ✅ Date d'inscription
- ✅ Indicateur pour les gagnants

### 6. **Section des Gagnants**
- ✅ Affichage des gagnants avec leurs prix
- ✅ Modal de détails au clic
- ✅ Informations complètes (position, prix, date)

## 🚀 Comment Tester

### **Prérequis**
1. **Backend démarré** : `npm run dev` dans le dossier `backend/`
2. **Application Flutter** : `flutter run` dans le dossier racine
3. **Concours créé** : Utilisez le dashboard admin pour créer un concours

### **Étapes de Test**

#### **1. Créer un Concours (Dashboard Admin)**
```bash
cd admin-dashboard
npm start
```
- Allez sur `http://localhost:3000`
- Créez un nouveau concours hebdomadaire
- Notez les dates de début, fin et tirage

#### **2. Tester l'Application Flutter**
```bash
flutter run
```
- Naviguez vers l'écran "Concours"
- Vérifiez que le concours s'affiche correctement
- Testez le bouton de participation

#### **3. Vérifier les Fonctionnalités**
- ✅ Le concours s'affiche avec toutes les informations
- ✅ Le compte à rebours fonctionne
- ✅ Le bouton de participation est actif
- ✅ Les statistiques s'affichent
- ✅ La liste des participants se met à jour

## 🔧 Configuration

### **URLs API**
- **Backend** : `http://localhost:5000/api`
- **Admin Dashboard** : `http://localhost:3000`
- **Application Flutter** : `http://localhost:5000/api`

### **Endpoints Utilisés**
- `GET /contests/weekly/current` - Concours actuel
- `GET /contests/weekly/stats` - Statistiques
- `POST /contests/weekly/participate` - Participation
- `GET /contests/:id` - Détails d'un concours

## 🎨 Interface Utilisateur

### **Design System**
- **Couleurs** : Thème sombre avec accents bleus
- **Typographie** : Police Poppins
- **Espacement** : Système de 8px (8, 16, 24, 32)
- **Bordures** : Rayon de 12-16px

### **Composants**
- **ContestCard** : Carte principale du concours
- **ParticipationButton** : Bouton d'inscription
- **CountdownSection** : Compte à rebours
- **StatsSection** : Statistiques
- **ParticipantsList** : Liste des participants
- **WinnersSection** : Section des gagnants

## 🐛 Dépannage

### **Problèmes Courants**

#### **1. Concours ne s'affiche pas**
- Vérifiez que le backend est démarré
- Vérifiez qu'un concours est créé
- Regardez les logs de l'application

#### **2. Erreur de participation**
- Vérifiez que l'utilisateur est connecté
- Vérifiez que le concours est actif
- Regardez les logs du backend

#### **3. Compte à rebours incorrect**
- Vérifiez la date de tirage dans le concours
- Redémarrez l'application Flutter

### **Logs Utiles**
```bash
# Backend
cd backend && npm run dev

# Application Flutter
flutter run --verbose

# Dashboard Admin
cd admin-dashboard && npm start
```

## 📱 Captures d'Écran Attendues

1. **Écran vide** : "Aucun concours actif" si aucun concours
2. **Écran avec concours** : Carte du concours + bouton participation
3. **Participation** : Bouton "Déjà inscrit" après inscription
4. **Compte à rebours** : Timer en temps réel
5. **Statistiques** : 3 cartes avec icônes et chiffres
6. **Participants** : Liste numérotée des participants
7. **Gagnants** : Section dorée avec les gagnants

## 🎯 Prochaines Étapes

- [ ] Notifications push pour les gagnants
- [ ] Historique des concours passés
- [ ] Système de récompenses
- [ ] Intégration avec les réseaux sociaux
- [ ] Analytics et métriques avancées
