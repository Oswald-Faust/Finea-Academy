import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../models/newsletter_model.dart';
import '../services/api_service.dart';
import '../utils/image_utils.dart';

class NewsletterDetailScreen extends StatefulWidget {
  final NewsletterArticle article;

  const NewsletterDetailScreen({
    super.key,
    required this.article,
  });

  @override
  State<NewsletterDetailScreen> createState() => _NewsletterDetailScreenState();
}

class _NewsletterDetailScreenState extends State<NewsletterDetailScreen> {
  bool _isBookmarked = false;
  bool _isLoading = true;
  NewsletterArticle? _fullArticle;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _isBookmarked = widget.article.isBookmarked;
    _loadFullArticle();
  }

  Future<void> _loadFullArticle() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = '';
      });

      final apiService = ApiService();
      final response = await apiService.getNewsletterArticleById(widget.article.id);
      
      setState(() {
        _fullArticle = response.data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  ImageProvider _getImageProvider(String imageUrl) {
    final fullImageUrl = ImageUtils.getImageUrl(imageUrl);
    if (ImageUtils.isNetworkImage(fullImageUrl)) {
      return NetworkImage(fullImageUrl);
    } else {
      return AssetImage(fullImageUrl);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f23),
      body: CustomScrollView(
        slivers: [
          // AppBar personnalisé avec image
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            backgroundColor: const Color(0xFF0f0f23),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.of(context).pop(),
            ),
            actions: [
              IconButton(
                icon: Icon(
                  _isBookmarked ? Icons.favorite : Icons.favorite_border,
                  color: _isBookmarked ? Colors.red : Colors.white,
                ),
                onPressed: _toggleBookmark,
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Image de l'article
                  Image(
                    image: _getImageProvider(widget.article.imageUrl),
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Image.asset(
                        'assets/images/Bourse 1 .jpg',
                        fit: BoxFit.cover,
                      );
                    },
                  ),
                  // Gradient overlay pour améliorer la lisibilité
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.7),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Contenu de l'article
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Titre de l'article
                  FadeInUp(
                    duration: const Duration(milliseconds: 600),
                    child: Text(
                      widget.article.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Poppins',
                        height: 1.3,
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Métadonnées (source et date)
                  FadeInUp(
                    duration: const Duration(milliseconds: 700),
                    child: Row(
                      children: [
                        Icon(
                          Icons.access_time,
                          color: Colors.white.withOpacity(0.7),
                          size: 16,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${widget.article.source} • ${_formatDate(widget.article.date)}',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 14,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // État de chargement
                  if (_isLoading)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      ),
                    ),
                  
                  // État d'erreur
                  if (!_isLoading && _errorMessage.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.red.withOpacity(0.3)),
                      ),
                      child: Column(
                        children: [
                          const Icon(
                            Icons.error_outline,
                            color: Colors.red,
                            size: 32,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Erreur de chargement',
                            style: const TextStyle(
                              color: Colors.red,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Poppins',
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _errorMessage,
                            style: const TextStyle(
                              color: Colors.red,
                              fontSize: 12,
                              fontFamily: 'Poppins',
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  
                  // Contenu de l'article
                  if (!_isLoading && _errorMessage.isEmpty)
                    FadeInUp(
                      duration: const Duration(milliseconds: 800),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (_fullArticle?.content != null && _fullArticle!.content.isNotEmpty)
                            Text(
                              _fullArticle!.content,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                height: 1.6,
                                fontFamily: 'Poppins',
                              ),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.orange.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.orange.withOpacity(0.3)),
                              ),
                              child: const Column(
                                children: [
                                  Icon(
                                    Icons.info_outline,
                                    color: Colors.orange,
                                    size: 32,
                                  ),
                                  SizedBox(height: 8),
                                  Text(
                                    'Contenu non disponible',
                                    style: TextStyle(
                                      color: Colors.orange,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Poppins',
                                    ),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'Le contenu de cet article n\'est pas encore disponible.',
                                    style: TextStyle(
                                      color: Colors.orange,
                                      fontSize: 12,
                                      fontFamily: 'Poppins',
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                  
                  const SizedBox(height: 40),
                  
                  // Boutons d'action
                  FadeInUp(
                    duration: const Duration(milliseconds: 900),
                    child: Row(
                      children: [
                        // Expanded(
                        //   child: OutlinedButton.icon(
                        //     onPressed: _shareArticle,
                        //     icon: const Icon(Icons.share),
                        //     label: const Text('Partager'),
                        //     style: OutlinedButton.styleFrom(
                        //       foregroundColor: Colors.white,
                        //       side: const BorderSide(color: Colors.white),
                        //       padding: const EdgeInsets.symmetric(vertical: 16),
                        //       shape: RoundedRectangleBorder(
                        //         borderRadius: BorderRadius.circular(12),
                        //       ),
                        //     ),
                        //   ),
                        // ),
                        // const SizedBox(width: 16),
                        // Expanded(
                        //   child: ElevatedButton.icon(
                        //     onPressed: _readMore,
                        //     icon: const Icon(Icons.article),
                        //     label: const Text('Lire plus'),
                        //     style: ElevatedButton.styleFrom(
                        //       backgroundColor: Colors.white,
                        //       foregroundColor: const Color(0xFF000D64),
                        //       padding: const EdgeInsets.symmetric(vertical: 16),
                        //       shape: RoundedRectangleBorder(
                        //         borderRadius: BorderRadius.circular(12),
                        //       ),
                        //     ),
                        //   ),
                        // ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  
                  // Articles similaires
                  FadeInUp(
                    duration: const Duration(milliseconds: 1000),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Articles similaires',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Poppins',
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildSimilarArticleCard(),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSimilarArticleCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              image: const DecorationImage(
                image: AssetImage('assets/images/Bourse 2 .jpg'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Les pays pauvres étranglés par le poids de la dette',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    fontFamily: 'Poppins',
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  'Finéa app • 1 Juillet 2025',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 12,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _toggleBookmark() {
    setState(() {
      _isBookmarked = !_isBookmarked;
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _isBookmarked ? 'Article ajouté aux favoris' : 'Article retiré des favoris',
        ),
        backgroundColor: Colors.blue,
        duration: const Duration(seconds: 1),
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