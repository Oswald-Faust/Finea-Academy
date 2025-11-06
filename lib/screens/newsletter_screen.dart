import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../models/newsletter_model.dart';
import '../services/api_service.dart';
import '../utils/image_utils.dart';
import '../widgets/actus_section.dart';
import 'newsletter_detail_screen.dart';
import 'profile_screen.dart';

class NewsletterScreen extends StatefulWidget {
  const NewsletterScreen({super.key});

  @override
  State<NewsletterScreen> createState() => _NewsletterScreenState();
}

class _NewsletterScreenState extends State<NewsletterScreen> {
  final ApiService _apiService = ApiService();
  List<NewsletterArticle> _articles = [];
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _loadArticles();
  }

  Future<void> _loadArticles() async {
    try {
      setState(() {
        _isLoading = true;
        _hasError = false;
      });

      final response = await _apiService.getNewsletterArticles(
        status: 'published',
        limit: 20,
      );

      if (response.data != null) {
        // Vérifier l'état des favoris pour chaque article
        for (var article in response.data!) {
          try {
            final favoriteResponse = await _apiService.checkIfFavorite(article.id);
            if (favoriteResponse.success && favoriteResponse.data != null) {
              article.isBookmarked = favoriteResponse.data!['isFavorite'] ?? false;
            }
          } catch (e) {
            // En cas d'erreur, on garde l'état par défaut (non favori)
            article.isBookmarked = false;
          }
        }
      }

      setState(() {
        _articles = response.data ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _hasError = true;
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _toggleBookmark(NewsletterArticle article) async {
    try {
      if (article.isBookmarked) {
        // Retirer des favoris
        await _apiService.removeFromFavorites(article.id);
        setState(() {
          article.isBookmarked = false;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Article retiré des favoris'),
            backgroundColor: Colors.orange,
            duration: Duration(seconds: 1),
          ),
        );
      } else {
        // Ajouter aux favoris
        await _apiService.addToFavorites(article.id, type: 'article');
        setState(() {
          article.isBookmarked = true;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Article ajouté aux favoris'),
            backgroundColor: Colors.blue,
            duration: Duration(seconds: 1),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur: ${e.toString()}'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f23),
      body: CustomScrollView(
        slivers: [
          // AppBar avec logo Finea
          SliverAppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            pinned: true,
            centerTitle: true,
            title: Image.asset(
              'assets/images/finea-logo.png',
              height: 82,
              fit: BoxFit.contain,
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.person, color: Colors.white),
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => const ProfileScreen(),
                    ),
                  );
                },
              ),
            ],
          ),
          
          // Section d'actualités en haut
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: ActusSection(),
            ),
          ),
          
          // État de chargement
          if (_isLoading)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(32.0),
                child: Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
              ),
            ),
          
          // État d'erreur
          if (_hasError)
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: Colors.red,
                      size: 48,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Erreur de chargement',
                      style: const TextStyle(
                        color: Colors.red,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _errorMessage,
                      style: const TextStyle(
                        color: Colors.red,
                        fontSize: 14,
                        fontFamily: 'Poppins',
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadArticles,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Réessayer'),
                    ),
                  ],
                ),
              ),
            ),
          
          // Liste des articles
          if (!_isLoading && !_hasError)
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final article = _articles[index];
                  return FadeInUp(
                    duration: Duration(milliseconds: 600 + (index * 100)),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: _buildArticleCard(article),
                    ),
                  );
                },
                childCount: _articles.length,
              ),
            ),
          
          // Message si aucun article
          if (!_isLoading && !_hasError && _articles.isEmpty)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(32.0),
                child: Center(
                  child: Column(
                    children: [
                      Icon(
                        Icons.article_outlined,
                        color: Colors.white54,
                        size: 64,
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Aucun article disponible',
                        style: TextStyle(
                          color: Colors.white54,
                          fontSize: 18,
                          fontFamily: 'Poppins',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          
          // Espace en bas
          const SliverToBoxAdapter(
            child: SizedBox(height: 100),
          ),
        ],
      ),
    );
  }

  Widget _buildArticleCard(NewsletterArticle article) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _openArticle(article),
        child: Padding(
          padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Image de l'article
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    image: DecorationImage(
                      image: _getImageProvider(article.imageUrl),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                
                const SizedBox(width: 16),
                
                // Contenu de l'article
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        article.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${article.source} ${_formatDate(article.date)}',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 12,
                          fontFamily: 'Poppins',
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(width: 12),
                
                // Icône de favori (cœur)
                IconButton(
                  onPressed: () => _toggleBookmark(article),
                  icon: Icon(
                    article.isBookmarked ? Icons.favorite : Icons.favorite_border,
                    color: article.isBookmarked ? Colors.red : Colors.white,
                    size: 24,
                  ),
                ),
              ],
            ),
          ),
        ),
    );
  }

  ImageProvider _getImageProvider(String imageUrl) {
    final fullImageUrl = ImageUtils.getImageUrl(imageUrl);
    if (ImageUtils.isNetworkImage(fullImageUrl)) {
      return NetworkImage(fullImageUrl);
    } else {
      return AssetImage(fullImageUrl);
    }
  }

  void _openArticle(NewsletterArticle article) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => NewsletterDetailScreen(article: article),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}

// Peintre personnalisé pour le graphique en ligne
class LineChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blue
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final path = Path();
    path.moveTo(0, size.height * 0.8);
    path.lineTo(size.width * 0.3, size.height * 0.6);
    path.lineTo(size.width * 0.6, size.height * 0.4);
    path.lineTo(size.width, size.height * 0.2);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
} 