# Calendrier Économique - ForexFactory Integration

## 📋 Description

Le Calendrier Économique est un nouvel outil intégré dans l'application Finéa Academy qui permet de suivre en temps réel les événements économiques importants qui peuvent impacter les marchés financiers. Les données sont récupérées depuis ForexFactory.com, une référence mondiale pour le trading Forex.

## ✨ Fonctionnalités

### Backend (Node.js)

#### Service de Scraping
- **Fichier**: `backend/services/forexFactoryService.js`
- Récupération des événements du calendrier économique depuis ForexFactory
- Parsing HTML avec Cheerio
- Classification des événements par impact (Fort, Moyen, Faible)
- Extraction des données: date, heure, devise, prévision, valeur actuelle, valeur précédente

#### API Endpoints
- **Route**: `backend/routes/forexFactory.js`
- **Base URL**: `/api/forex-factory`

**Endpoints disponibles:**

1. **GET /api/forex-factory/calendar**
   - Récupère tous les événements du calendrier
   - Query param: `date` (YYYY-MM-DD, optionnel)
   - Exemple: `/api/forex-factory/calendar?date=2025-11-05`

2. **GET /api/forex-factory/weekly**
   - Récupère les événements de la semaine groupés par jour
   - Retourne un objet avec les dates comme clés

3. **GET /api/forex-factory/high-impact**
   - Filtre uniquement les événements à fort impact
   - Idéal pour les alertes importantes

4. **GET /api/forex-factory/currency/:currency**
   - Filtre les événements par devise
   - Exemple: `/api/forex-factory/currency/USD`

5. **GET /api/forex-factory/summary**
   - Résumé statistique des événements du jour
   - Nombre total, répartition par impact, devises concernées

### Frontend (Flutter)

#### Modèle de données
- **Fichier**: `lib/models/economic_event.dart`
- Classe `EconomicEvent`: représente un événement économique
- Classe `EconomicCalendarSummary`: résumé des événements
- Méthodes utilitaires pour les couleurs et libellés d'impact

#### Service API
- **Fichier**: `lib/services/economic_calendar_service.dart`
- Consomme les endpoints backend
- Gestion des erreurs et timeouts
- Configuration automatique des URLs (dev/prod)

#### Interface Utilisateur
- **Fichier**: `lib/screens/economic_calendar_screen.dart`

**Caractéristiques de l'UI:**

1. **Résumé en haut**
   - Card avec gradient moderne
   - Statistiques du jour (total, répartition par impact)
   - Liste des devises concernées

2. **Onglets**
   - "Tous les événements": vue complète avec filtres
   - "Fort impact": uniquement les événements critiques

3. **Filtres**
   - Filtre par niveau d'impact (Fort, Moyen, Faible)
   - Filtre par devise (USD, EUR, GBP, JPY, etc.)
   - Application en temps réel

4. **Cards d'événements**
   - Design moderne avec ombres et couleurs d'impact
   - Badge de devise et heure
   - Nom de l'événement
   - Données économiques (Précédent, Prévision, Actuel)
   - Action: tap pour voir les détails

5. **Modal de détails**
   - Bottom sheet avec informations complètes
   - Icon d'impact coloré
   - Toutes les données de l'événement

#### Widget Card
- **Fichier**: `lib/widgets/economic_calendar_card.dart`
- Card attrayante pour l'écran Outils
- Gradient bleu professionnel
- Badge "LIVE" pour indiquer la mise à jour en temps réel
- Features badges: Impact, Devises, Alertes

## 🎨 Design

### Palette de couleurs

**Impacts:**
- Fort (High): `#FF5252` (Rouge)
- Moyen (Medium): `#FFA726` (Orange)
- Faible (Low): `#FFD54F` (Jaune)

**Thème général:**
- Primaire: `#000D64` (Bleu Finea)
- Accent: `#001B99` (Bleu Finea clair)
- Succès: `#27AE60` (Vert)

### Icons
- Fort impact: `trending_up`
- Moyen impact: `show_chart`
- Faible impact: `trending_flat`
- Calendrier: `calendar_today`

## 🚀 Utilisation

### Pour les utilisateurs

1. Ouvrir l'application Finéa Academy
2. Aller dans l'onglet "Outils"
3. Cliquer sur la card "Calendrier Économique"
4. Consulter les événements du jour
5. Utiliser les filtres pour affiner la recherche
6. Taper sur un événement pour voir plus de détails

### Pour les développeurs

#### Tester le backend localement

```bash
cd backend
npm install
npm start
```

Tester l'API:
```bash
# Tous les événements
curl http://localhost:5001/api/forex-factory/calendar

# Événements à fort impact
curl http://localhost:5001/api/forex-factory/high-impact

# Résumé
curl http://localhost:5001/api/forex-factory/summary

# Par devise
curl http://localhost:5001/api/forex-factory/currency/USD
```

#### Tester le frontend Flutter

```bash
# Vérifier que le backend est lancé
flutter run
```

## 📦 Dépendances ajoutées

### Backend
- `cheerio`: ^1.0.0-rc.12 - Parser HTML pour le web scraping
- `node-fetch`: ^3.3.2 - Client HTTP (Note: axios déjà présent peut remplacer)

### Frontend
Aucune nouvelle dépendance - utilise les packages existants:
- `http`: pour les requêtes API
- `flutter/material.dart`: pour l'UI

## ⚠️ Notes importantes

### Scraping et rate limiting
- ForexFactory n'a pas d'API officielle, nous utilisons du web scraping
- **Important**: Ne pas abuser des requêtes pour éviter d'être bloqué
- Recommandation: implémenter un cache côté backend (Redis ou en mémoire)
- Possibilité d'ajouter un délai entre les requêtes

### Structure HTML de ForexFactory
Si ForexFactory change la structure de leur site, le scraping peut cesser de fonctionner. Dans ce cas:
1. Vérifier la structure HTML actuelle
2. Mettre à jour les sélecteurs CSS dans `forexFactoryService.js`
3. Tester à nouveau

### Headers HTTP
Le service utilise des headers pour simuler un navigateur réel:
- User-Agent: Chrome sur Windows
- Accept: text/html
- Accept-Language: en-US,en,fr

## 🔄 Améliorations futures possibles

1. **Cache intelligent**
   - Implémenter Redis pour mettre en cache les événements
   - Rafraîchir toutes les 5-15 minutes

2. **Notifications push**
   - Alertes pour les événements à fort impact
   - Notification 30 min avant l'événement

3. **Favoris**
   - Permettre aux utilisateurs de suivre certaines devises
   - Recevoir uniquement les alertes pour leurs devises favorites

4. **Graphiques historiques**
   - Afficher l'historique des données économiques
   - Graphiques de tendances

5. **Analyse d'impact**
   - Analyser l'impact réel sur les paires de devises
   - Corrélations avec les mouvements de prix

6. **Export**
   - Exporter les événements en CSV
   - Intégration avec Google Calendar

## 📱 Captures d'écran

L'interface comprend:
- ✅ Card d'accès dans l'écran Outils avec gradient bleu
- ✅ Écran principal avec résumé des événements
- ✅ Liste des événements avec design moderne
- ✅ Filtres par impact et devise
- ✅ Modal de détails complet
- ✅ Indicateurs visuels d'impact (couleurs et icons)

## 🤝 Contribution

Pour contribuer à l'amélioration du calendrier économique:
1. Fork le projet
2. Créer une branche feature
3. Tester localement
4. Soumettre une pull request

## 📄 License

Ce module fait partie de l'application Finéa Academy.

---

**Développé avec ❤️ pour Finéa Academy**

