import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class YouTubeVideoPlayer extends StatelessWidget {
  final String videoId;
  final String title;
  final String description;
  final String thumbnailPath;
  final double width;
  final double height;
  final VoidCallback? onVideoPlayed;

  const YouTubeVideoPlayer({
    super.key,
    required this.videoId,
    this.title = 'Vidéo YouTube',
    this.description = 'Cliquez pour regarder la vidéo',
    this.thumbnailPath = 'assets/images/Formation_trading.png',
    this.width = double.infinity,
    this.height = 200,
    this.onVideoPlayed,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        _launchYouTubeApp();
        onVideoPlayed?.call();
      },
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.blue.withValues(alpha: 0.1),
              Colors.purple.withValues(alpha: 0.1),
            ],
          ),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        ),
        child: Stack(
          children: [
            // Image de fond (thumbnail)
            Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                image: DecorationImage(
                  image: _getImageProvider(),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            // Overlay sombre
            Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: Colors.black.withValues(alpha: 0.4),
              ),
            ),
            // Bouton de lecture central
            Center(
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(40),
                                      boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                ),
                child: const Icon(
                  Icons.play_arrow,
                  size: 40,
                  color: Color(0xFF0f0f23),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Méthode pour déterminer le bon type d'image (asset ou réseau)
  ImageProvider _getImageProvider() {
    if (thumbnailPath.startsWith('http')) {
      return NetworkImage(thumbnailPath);
    } else {
      return AssetImage(thumbnailPath);
    }
  }


  // Fonction pour lancer l'app YouTube
  Future<void> _launchYouTubeApp() async {
    final url = Uri.parse('https://www.youtube.com/watch?v=$videoId');
    
    try {
      // Essayer d'ouvrir dans l'app YouTube
      if (await canLaunchUrl(url)) {
        await launchUrl(
          url,
          mode: LaunchMode.externalApplication,
        );
      } else {
        debugPrint('Impossible d\'ouvrir YouTube');
      }
    } catch (e) {
      debugPrint('Erreur lors de l\'ouverture: $e');
    }
  }
}
