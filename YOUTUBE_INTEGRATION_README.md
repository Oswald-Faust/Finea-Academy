# Intégration YouTube - FINEA Académie

## Vue d'ensemble

Cette intégration permet d'afficher et de lire des vidéos YouTube dans l'application FINEA Académie, spécifiquement sur l'écran du concours hebdomadaire.

## Fonctionnalités

### 🎥 Lecteur vidéo YouTube
- **Lecture dans l'app** : Ouverture de la vidéo dans l'application YouTube si installée
- **Redirection YouTube** : Ouverture directe sur YouTube
- **Interface moderne** : Design cohérent avec le thème de l'application
- **Thumbnail personnalisé** : Image de prévisualisation personnalisée

### 🔧 Configuration centralisée
- **Fichier de config** : `lib/config/youtube_config.dart`
- **Paramètres modifiables** : ID vidéo, titre, description, thumbnail
- **Support iframe** : Configuration HTML pour intégration web

## Structure des fichiers

```
lib/
├── config/
│   └── youtube_config.dart          # Configuration centralisée
├── widgets/
│   └── youtube_video_player.dart    # Widget principal du lecteur
└── screens/
    └── concours_screen.dart         # Écran utilisant le lecteur
```

## Configuration

### Vidéo actuelle
- **ID** : `Cnlm1ZguB3c`
- **URL** : `https://www.youtube.com/watch?v=Cnlm1ZguB3c&t=3s`
- **Titre** : "Formation Trading FINEA"
- **Description** : "Découvrez nos conseils d'investissement et déverrouillez votre premier niveau d'investisseur"

### Modifier la vidéo
Pour changer la vidéo, modifiez le fichier `youtube_config.dart` :

```dart
class YouTubeConfig {
  static const String weeklyContestVideoId = 'NOUVEAU_ID_VIDEO';
  static const String weeklyContestVideoTitle = 'Nouveau titre';
  static const String weeklyContestVideoDescription = 'Nouvelle description';
  // ...
}
```

## Utilisation

### Dans un écran
```dart
import '../widgets/youtube_video_player.dart';
import '../config/youtube_config.dart';

// Utilisation simple
YouTubeVideoPlayer(
  videoId: YouTubeConfig.weeklyContestVideoId,
  title: YouTubeConfig.weeklyContestVideoTitle,
  description: YouTubeConfig.weeklyContestVideoDescription,
  thumbnailPath: YouTubeConfig.weeklyContestThumbnailPath,
  onVideoPlayed: () {
    print('Vidéo lancée !');
  },
)
```

### Paramètres personnalisés
```dart
YouTubeVideoPlayer(
  videoId: 'ID_PERSONNALISE',
  title: 'Titre personnalisé',
  description: 'Description personnalisée',
  thumbnailPath: 'assets/images/mon_image.png',
  width: 300,
  height: 180,
)
```

## Fonctionnalités techniques

### Gestion des URLs
- **URL complète** : `https://www.youtube.com/watch?v=ID`
- **URL embed** : `https://www.youtube.com/embed/ID`
- **Paramètres** : Support du timestamp (`&t=3s`)

### Gestion des erreurs
- **Fallback automatique** : Si l'app YouTube n'est pas installée
- **Gestion des exceptions** : Logs d'erreur appropriés
- **Mode de lancement** : `LaunchMode.externalApplication`

### Responsive Design
- **Hauteur adaptative** : Modal de 450px pour éviter le débordement
- **Scroll automatique** : `SingleChildScrollView` pour le contenu
- **Boutons flexibles** : `Expanded` pour une répartition équitable

## Dépendances

- `url_launcher: ^6.1.7` - Pour ouvrir les liens YouTube
- `flutter/material.dart` - Widgets de base

## Tests

### Test de la vidéo
1. Ouvrir l'écran du concours hebdomadaire
2. Cliquer sur la section vidéo
3. Vérifier l'ouverture du modal
4. Tester les deux boutons (Regarder/YouTube)
5. Vérifier la redirection vers YouTube

### Test de configuration
1. Modifier l'ID de la vidéo dans `youtube_config.dart`
2. Redémarrer l'application
3. Vérifier que la nouvelle vidéo s'affiche

## Dépannage

### Erreur de débordement
- **Cause** : Hauteur du modal insuffisante
- **Solution** : Augmenter la hauteur du modal ou utiliser `SingleChildScrollView`

### Vidéo ne s'ouvre pas
- **Cause** : Problème avec `url_launcher`
- **Solution** : Vérifier les permissions et la configuration

### Thumbnail manquant
- **Cause** : Image non trouvée dans `assets/images/`
- **Solution** : Vérifier le chemin et ajouter l'image

## Évolutions futures

- [ ] Support de plusieurs vidéos
- [ ] Lecture en mode plein écran
- [ ] Historique des vidéos regardées
- [ ] Statistiques de visionnage
- [ ] Support des playlists YouTube

## Support

Pour toute question ou problème :
1. Vérifier les logs de l'application
2. Consulter la documentation `url_launcher`
3. Tester sur différents appareils
4. Vérifier la connectivité internet
