# Structure de l'Application Finéa

## 📁 Organisation des fichiers

### `lib/main.dart`
- **Rôle** : Point d'entrée de l'application
- **Contenu** : Configuration Firebase, services, et initialisation de l'app
- **Taille** : ~150 lignes (nettoyé de 1189 lignes)

### `lib/screens/`
- **`main_navigation_screen.dart`** : Écran principal avec navigation à 5 onglets
- **`home_screen.dart`** : Page d'accueil avec article et alertes
- **`newsletter_screen.dart`** : Page newsletter
- **`outils_screen.dart`** : Page outils
- **`concours_screen.dart`** : Page concours
- **`academie_screen.dart`** : Page académie

### `lib/widgets/`
- **`custom_bottom_navigation.dart`** : Barre de navigation personnalisée
- **`featured_article_card.dart`** : Carte d'article en vedette
- **`alert_card.dart`** : Carte d'alerte individuelle
- **`alerts_section.dart`** : Section des alertes clôturées

### `lib/services/`
- **`api_service.dart`** : Service API
- **`auth_service.dart`** : Service d'authentification

### `lib/models/`
- Modèles de données

### `lib/utils/`
- Utilitaires et helpers

## 🎯 Avantages de la nouvelle structure

### ✅ **Maintenabilité**
- Code séparé en composants réutilisables
- Chaque fichier a une responsabilité unique
- Facile à modifier et déboguer

### ✅ **Réutilisabilité**
- Composants modulaires
- Widgets réutilisables dans différentes pages
- Logique métier séparée de l'UI

### ✅ **Lisibilité**
- Fichiers plus courts et focalisés
- Structure claire et organisée
- Noms de fichiers explicites

### ✅ **Évolutivité**
- Facile d'ajouter de nouvelles pages
- Composants extensibles
- Architecture scalable

## 🔧 Navigation

### Barre de navigation (5 onglets)
1. **Newsletter** (index 0)
2. **Outils** (index 1)
3. **Accueil** (index 2) - Page principale
4. **Concours** (index 3)
5. **Académie** (index 4)

### Page d'accueil
- Article d'actualité en vedette
- Section alertes clôturées
- Design moderne avec fond sombre

## 📱 Composants principaux

### `CustomBottomNavigation`
- Barre de navigation personnalisée
- Icône accueil mise en évidence
- Icône outils avec sous-éléments

### `FeaturedArticleCard`
- Carte d'article avec image
- Overlay avec titre
- Contenu et bouton "Lire plus"

### `AlertCard`
- Carte d'alerte individuelle
- Date, trade, TP/SL
- Icône de validation

### `AlertsSection`
- Section horizontale scrollable
- Liste d'alertes clôturées
- Titre de section

## 🚀 Prochaines étapes

1. **Développer les pages manquantes** (Newsletter, Outils, Concours, Académie)
2. **Ajouter des modèles de données** pour les articles et alertes
3. **Implémenter la logique métier** pour chaque section
4. **Ajouter des animations** et transitions
5. **Optimiser les performances** et l'accessibilité

## 📊 Métriques

- **Avant** : 1189 lignes dans main.dart
- **Après** : ~150 lignes dans main.dart
- **Réduction** : 87% de code déplacé vers des composants
- **Composants créés** : 6 nouveaux widgets réutilisables 