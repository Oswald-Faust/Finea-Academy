import 'package:flutter/material.dart';
import '../models/actus_model.dart';
import '../utils/image_utils.dart';

class ActusSection extends StatelessWidget {
  final List<ActusArticle> actus;
  final VoidCallback? onViewAll;
  final Function(ActusArticle)? onArticleTap;
  final Function(ActusArticle)? onBookmark;

  const ActusSection({
    super.key,
    required this.actus,
    this.onViewAll,
    this.onArticleTap,
    this.onBookmark,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // En-tête de la section
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Actualités',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
            ),
            if (onViewAll != null)
              TextButton(
                onPressed: onViewAll,
                child: const Text(
                  'Voir tout',
                  style: TextStyle(
                    color: Colors.blue,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    fontFamily: 'Poppins',
                  ),
                ),
              ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        // Article principal uniquement
        if (actus.isEmpty)
          _buildEmptyState()
        else
          _buildFeaturedActusCard(actus.first),
      ],
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

  Widget _buildFeaturedActusCard(ActusArticle article) {
    return GestureDetector(
      onTap: () => onArticleTap?.call(article),
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: IntrinsicHeight(
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
                        article.content,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 10,
                          fontFamily: 'Poppins',
                          height: 1.3,
                        ),
                        maxLines: 12,
                        overflow: TextOverflow.ellipsis,
                      ),
                      
                      const Spacer(),
                      
                      // Métadonnées et bouton
                      Row(
                        children: [
                          Text(
                            article.formattedDate,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.6),
                              fontSize: 9,
                              fontFamily: 'Poppins',
                            ),
                          ),
                          if (article.readTime != null) ...[
                            const SizedBox(width: 6),
                            Text(
                              '• ${article.readTime} min',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.6),
                                fontSize: 9,
                                fontFamily: 'Poppins',
                              ),
                            ),
                          ],
                          const Spacer(),
                          GestureDetector(
                            onTap: () => onBookmark?.call(article),
                            child: Icon(
                              article.isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                              color: article.isBookmarked ? Colors.yellow : Colors.white.withOpacity(0.6),
                              size: 16,
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 8),
                      
                      // Bouton "Lire plus"
                      Text(
                        'Lire plus....',
                        style: TextStyle(
                          color: Colors.blue,
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          fontFamily: 'Poppins',
                        ),
                      ),
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
                        if (article.imageUrl != null)
                          Container(
                            width: double.infinity,
                            height: double.infinity,
                            decoration: BoxDecoration(
                              image: DecorationImage(
                                image: NetworkImage(ImageUtils.getImageUrl(article.imageUrl!)),
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
