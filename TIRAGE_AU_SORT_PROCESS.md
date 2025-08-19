# 🎯 Processus de Tirage au Sort - Guide Complet

## 📋 Vue d'ensemble

Le système de concours hebdomadaire de Finéa Académie permet la gestion complète des participants et la sélection de **3 gagnants maximum** par concours.

## 🔄 Processus de Tirage au Sort

### **1. Inscription des Participants**
- **Authentification requise** : Seuls les utilisateurs connectés peuvent participer
- **Un ticket par utilisateur** : Participation unique par concours
- **Stockage sécurisé** : ID utilisateur stocké en base avec date d'inscription

### **2. Sélection des Gagnants (Admin)**

#### **A. Interface Admin Dashboard**
1. **Accès** : Page "Concours Hebdomadaire" → Bouton "Tous les participants"
2. **Filtrage** : Sélection du concours spécifique
3. **Sélection manuelle** : Choix de 1 à 3 gagnants parmi les participants
4. **Validation** : Confirmation de la sélection

#### **B. Processus Technique**
```javascript
// Endpoint: POST /api/contests/:id/winners/select
{
  "participants": [
    { "userId": "user_id_1", "userEmail": "user1@email.com" },
    { "userId": "user_id_2", "userEmail": "user2@email.com" },
    { "userId": "user_id_3", "userEmail": "user3@email.com" }
  ]
}
```

#### **C. Assignation des Positions**
- **Position 1** : Premier gagnant sélectionné
- **Position 2** : Deuxième gagnant sélectionné
- **Position 3** : Troisième gagnant sélectionné

### **3. Stockage en Base de Données**

#### **Structure des Gagnants**
```javascript
winners: [{
  user: ObjectId,           // Référence utilisateur
  position: Number,         // Position (1, 2, ou 3)
  prize: String,           // Prix attribué
  selectedAt: Date,        // Date de sélection
  selectedBy: ObjectId     // Admin qui a sélectionné (optionnel)
}]
```

#### **Mise à Jour du Statut**
- **Ancien gagnants** : Effacés avant nouvelle sélection
- **Nouveaux gagnants** : Ajoutés avec horodatage
- **Statut concours** : Peut passer à "completed" après tirage

## 🔔 Système de Notifications

### **1. Backend - Notification des Gagnants**
```javascript
// TODO: À implémenter
const notifyWinners = async (contest, winners) => {
  for (const winner of winners) {
    // Envoyer notification push
    await sendPushNotification(winner.user, {
      title: 'Félicitations ! 🎉',
      body: `Vous avez gagné le concours ${contest.title} !`,
      data: {
        contestId: contest._id,
        position: winner.position,
        prize: winner.prize
      }
    });
    
    // Envoyer email
    await sendEmailNotification(winner.user, {
      template: 'winner_announcement',
      data: {
        contestTitle: contest.title,
        position: winner.position,
        prize: winner.prize
      }
    });
  }
};
```

### **2. Application Flutter - Affichage Gagnant**

#### **A. Vérification du Statut**
- **Automatique** : Vérification à chaque chargement de l'écran concours
- **Endpoint** : `GET /api/contests/weekly/current` avec token utilisateur
- **Logique** : Comparaison ID utilisateur avec liste des gagnants

#### **B. Interface Utilisateur**
- **Carte d'annonce** : Affichage en haut de l'écran de concours
- **Design** : Dégradé bleu-violet avec éléments décoratifs
- **Informations** : Position, prix, date de tirage
- **Section MT5** : Accès aux comptes de trading

## 🎨 Interface Utilisateur

### **1. Admin Dashboard**

#### **Écran "Tous les Participants"**
- **Liste complète** : Tous les participants de tous les concours
- **Filtrage** : Par concours spécifique
- **Sélection multiple** : Jusqu'à 3 gagnants
- **Interface intuitive** : Clics pour sélectionner/désélectionner

#### **Modal de Sélection**
- **Vue détaillée** : Informations complètes des participants
- **Compteur** : "X/3 gagnants sélectionnés"
- **Validation** : Bouton "Confirmer la Sélection"

### **2. Application Flutter**

#### **Carte d'Annonce Gagnant**
```dart
WinnerAnnouncementCard(
  contestTitle: 'Concours Hebdomadaire - Semaine X',
  position: 1,
  prize: 'Formation Premium',
  selectedAt: DateTime(2025, 1, 5),
)
```

#### **Éléments Visuels**
- **Gradient** : Bleu foncé → Violet
- **Icône trophée** : Mise en évidence du statut gagnant
- **Informations MT5** : Login, mot de passe, serveur
- **Note explicative** : Règles d'accès aux comptes

## 🚀 Flux Complet de Tirage

### **Étape 1 : Préparation**
1. **Concours actif** : Vérification qu'un concours est en cours
2. **Participants inscrits** : Au moins 3 participants pour 3 gagnants
3. **Date limite** : Respecter la date de fin (dimanche 19h00)

### **Étape 2 : Sélection (Admin)**
1. **Accès admin** : Page "Tous les participants"
2. **Filtrage** : Sélection du concours concerné
3. **Choix gagnants** : Sélection manuelle de 1 à 3 participants
4. **Validation** : Confirmation de la sélection

### **Étape 3 : Traitement Backend**
1. **Effacement** : Suppression des anciens gagnants
2. **Ajout** : Insertion des nouveaux gagnants avec positions
3. **Horodatage** : Date et heure de sélection
4. **Notification** : Envoi des notifications (TODO)

### **Étape 4 : Affichage Utilisateur**
1. **Vérification** : L'utilisateur ouvre l'app
2. **Comparaison** : Vérification si l'utilisateur est gagnant
3. **Affichage** : Carte d'annonce si gagnant
4. **Informations** : Détails du prix et accès MT5

## 🔧 Configuration Technique

### **Routes API**
- `GET /api/contests/participants/all` - Liste tous les participants
- `POST /api/contests/:id/winners/select` - Sélection des gagnants
- `GET /api/contests/weekly/current` - Concours actuel (avec gagnants)
- `GET /api/contests/weekly/participation` - Statut participation utilisateur

### **Authentification**
- **Admin Dashboard** : Pas d'authentification (routes publiques)
- **Application Flutter** : Token JWT obligatoire
- **Participation** : Authentification requise

### **Base de Données**
- **Participants** : Collection avec ObjectId utilisateurs
- **Gagnants** : Sous-collection avec position et prix
- **Horodatage** : Dates d'inscription et sélection

## 📱 Intégration Mobile

### **Services Flutter**
```dart
class ContestService {
  static Future<Map<String, dynamic>?> checkUserWinnings();
  static Future<bool> isUserParticipating(String contestId);
  static Future<bool> participateInWeeklyContest();
}
```

### **Widgets Personnalisés**
- `WinnerAnnouncementCard` : Affichage du statut gagnant
- `ContestCountdownSection` : Compte à rebours dynamique
- `MT5AccountCard` : Accès aux comptes de trading

## 🎯 Prochaines Améliorations

### **Notifications Push**
- [ ] Service de notifications Firebase
- [ ] Templates d'email personnalisés
- [ ] Notifications en temps réel

### **Tirage Automatique**
- [ ] Algorithme de sélection aléatoire
- [ ] Programmation automatique (cron jobs)
- [ ] Historique des tirages

### **Analytics**
- [ ] Statistiques de participation
- [ ] Taux de conversion
- [ ] Engagement utilisateurs

## 🛡️ Sécurité

### **Validation**
- **Authentification** : Vérification des tokens
- **Autorisations** : Validation des rôles utilisateur
- **Données** : Sanitisation des entrées

### **Audit**
- **Logs** : Traçabilité des sélections
- **Horodatage** : Dates de toutes les actions
- **Historique** : Conservation des données
