import 'package:flutter/material.dart';
import '../models/news_model.dart';
import '../services/news_api_service.dart';
import '../utils/image_utils.dart';

class ActusSection extends StatefulWidget {
  final VoidCallback? onViewAll;
  final Function(NewsArticle)? onArticleTap;
  final Function(NewsArticle)? onBookmark;

  const ActusSection({
    super.key,
    this.onViewAll,
    this.onArticleTap,
    this.onBookmark,
  });

  @override
  State<ActusSection> createState() => _ActusSectionState();
}

class _ActusSectionState extends State<ActusSection> {
  NewsArticle? latestNews;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadLatestNews();
  }

  Future<void> _loadLatestNews() async {
    try {
      setState(() {
        isLoading = true;
        error = null;
      });

      final newsData = await NewsApiService.getLatestNews();
      
      if (newsData != null) {
        setState(() {
          latestNews = NewsArticle.fromJson(newsData);
          isLoading = false;
        });
      } else {
        setState(() {
          latestNews = null;
          isLoading = false;
          error = 'Aucune actualité disponible';
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        error = 'Erreur lors du chargement des actualités';
      });
      print('Erreur lors du chargement des actualités: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (isLoading)
          _buildLoadingState()
        else if (error != null)
          _buildErrorState()
        else if (latestNews == null)
          _buildEmptyState()
        else
          _buildFeaturedActusCard(latestNews!),
      ],
    );
  }

  Widget _buildLoadingState() {
    return Container(
      height: 200,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: Colors.white70),
            SizedBox(height: 16),
            Text(
              'Chargement des actualités...',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 16,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Container(
      height: 200,
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.withOpacity(0.3)),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 48,
            ),
            const SizedBox(height: 8),
            Text(
              error ?? 'Erreur de chargement',
              style: const TextStyle(
                color: Colors.red,
                fontSize: 16,
                fontFamily: 'Poppins',
              ),
            ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: _loadLatestNews,
              icon: const Icon(Icons.refresh, size: 16),
              label: const Text('Réessayer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      height: 200,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.newspaper_outlined,
              color: Colors.white54,
              size: 48,
            ),
            SizedBox(height: 16),
            Text(
              'Aucune actualité disponible',
              style: TextStyle(
                color: Colors.white54,
                fontSize: 16,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _extractTextFromContent(Map<String, dynamic> content) {
    if (content.containsKey('blocks')) {
      final blocks = content['blocks'] as List? ?? [];
      final text = blocks.map((block) {
        if (block['type'] == 'paragraph' && block['data'] != null) {
          return block['data']['text'] ?? '';
        }
        return '';
      }).join(' ');
      return text;
    }
    return '';
  }

  Widget _buildFeaturedActusCard(NewsArticle article) {
    return GestureDetector(
      onTap: () => widget.onArticleTap?.call(article),
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Container(
          height: 260,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Section texte (gauche) - réduite
              Expanded(
                flex: 1,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Contenu de l'actualité (sans titre)
                      Text(
                        article.summary ?? _extractTextFromContent(article.content),
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 11,
                          fontFamily: 'Poppins',
                          height: 1.4,
                        ),
                        maxLines: 16,
                        overflow: TextOverflow.ellipsis,
                      ),
                      
                      const Spacer(),
                    ],
                  ),
                ),
              ),
              
              // Section image (droite) - agrandie, commence au milieu
              Expanded(
                flex: 1,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(12),
                      bottomRight: Radius.circular(12),
                    ),
                    color: Colors.white.withOpacity(0.1),
                  ),
                  child: ClipRRect(
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(12),
                      bottomRight: Radius.circular(12),
                    ),
                    child: Stack(
                      children: [
                        // Image de fond - prend toute la hauteur
                        if (article.coverImage != null && article.coverImage!.isNotEmpty)
                          Container(
                            width: double.infinity,
                            height: double.infinity,
                            decoration: BoxDecoration(
                              image: DecorationImage(
                                image: NetworkImage(ImageUtils.getImageUrl(article.imageUrl)),
                                fit: BoxFit.cover,
                              ),
                            ),
                          )
                        else
                          Container(
                            width: double.infinity,
                            height: double.infinity,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  Colors.blue.withOpacity(0.8),
                                  Colors.purple.withOpacity(0.8),
                                ],
                              ),
                            ),
                            child: const Center(
                              child: Icon(
                                Icons.newspaper_outlined,
                                color: Colors.white,
                                size: 48,
                              ),
                            ),
                          ),
                        
                        // Overlay sombre en bas
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Container(
                            height: 80,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.transparent,
                                  Colors.black.withOpacity(0.8),
                                ],
                              ),
                            ),
                          ),
                        ),
                        
                        // Titre de l'article en overlay sur l'image
                        Positioned(
                          bottom: 8,
                          left: 8,
                          right: 8,
                          child: Text(
                            article.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Poppins',
                              shadows: [
                                Shadow(
                                  offset: Offset(1, 1),
                                  blurRadius: 2,
                                  color: Colors.black54,
                                ),
                              ],
                            ),
                            maxLines: 6,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

}
