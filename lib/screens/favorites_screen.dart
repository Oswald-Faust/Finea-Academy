import 'package:flutter/material.dart';
import '../widgets/custom_bottom_navigation.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import 'main_navigation_screen.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _favoriteArticles = [];
  List<Map<String, dynamic>> _favoriteNewsletters = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadFavorites();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadFavorites() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final apiService = ApiService();
      
      // Récupérer les articles favoris
      final articlesResponse = await apiService.getUserFavorites(type: 'article');
      if (articlesResponse.success && articlesResponse.data != null) {
        _favoriteArticles = articlesResponse.data!.map((favorite) {
          final article = favorite['article'] as Map<String, dynamic>;
          return {
            'id': article['_id'] ?? '',
            'title': article['title'] ?? '',
            'excerpt': _extractExcerpt(article['content']),
            'imageUrl': article['coverImage'] ?? '',
            'date': _formatDate(DateTime.parse(favorite['addedAt'])),
            'category': (article['tags'] as List<dynamic>?)?.isNotEmpty == true 
                ? (article['tags'] as List<dynamic>).first 
                : 'Article',
            'readTime': '5 min', // Temps de lecture estimé
          };
        }).toList();
      }

      // Récupérer les newsletters favoris
      final newslettersResponse = await apiService.getUserFavorites(type: 'newsletter');
      if (newslettersResponse.success && newslettersResponse.data != null) {
        _favoriteNewsletters = newslettersResponse.data!.map((favorite) {
          final article = favorite['article'] as Map<String, dynamic>;
          return {
            'id': article['_id'] ?? '',
            'title': article['title'] ?? '',
            'excerpt': _extractExcerpt(article['content']),
            'date': _formatDate(DateTime.parse(favorite['addedAt'])),
            'category': (article['tags'] as List<dynamic>?)?.isNotEmpty == true 
                ? (article['tags'] as List<dynamic>).first 
                : 'Newsletter',
            'readTime': '3 min', // Temps de lecture estimé
          };
        }).toList();
      }
    } catch (e) {
      print('Erreur lors du chargement des favoris: $e');
      // En cas d'erreur, on garde les listes vides
      _favoriteArticles = [];
      _favoriteNewsletters = [];
    }

    setState(() {
      _isLoading = false;
    });
  }

  String _extractExcerpt(Map<String, dynamic>? content) {
    if (content == null) return 'Aucun contenu disponible';
    
    try {
      final blocks = content['blocks'] as List<dynamic>?;
      if (blocks != null && blocks.isNotEmpty) {
        final firstBlock = blocks.first;
        final text = firstBlock['data']?['text'] ?? '';
        if (text.isNotEmpty) {
          return text.length > 100 ? '${text.substring(0, 100)}...' : text;
        }
      }
    } catch (e) {
      print('Erreur lors de l\'extraction de l\'extrait: $e');
    }
    
    return 'Contenu disponible';
  }

  String _formatDate(DateTime date) {
    final months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f23),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Mes Favoris',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.blue,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.grey,
          tabs: const [
            Tab(
              icon: Icon(Icons.article_outlined),
              text: 'Articles',
            ),
            Tab(
              icon: Icon(Icons.email_outlined),
              text: 'Newsletters',
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Onglet Articles
                _buildArticlesTab(),
                // Onglet Newsletters
                _buildNewslettersTab(),
              ],
            ),
          ),
          
          // Barre de navigation en bas
          CustomBottomNavigation(
            currentIndex: 2, // Profil est sélectionné
            onTap: (index) {
              if (index != 2) {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(
                    builder: (context) => const MainNavigationScreen(),
                  ),
                );
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildArticlesTab() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
        ),
      );
    }

    if (_favoriteArticles.isEmpty) {
      return _buildEmptyState(
        icon: Icons.article_outlined,
        title: 'Aucun article favori',
        subtitle: 'Les articles que vous marquerez comme favoris apparaîtront ici',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _favoriteArticles.length,
      itemBuilder: (context, index) {
        final article = _favoriteArticles[index];
        return _buildArticleCard(article);
      },
    );
  }

  Widget _buildNewslettersTab() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
        ),
      );
    }

    if (_favoriteNewsletters.isEmpty) {
      return _buildEmptyState(
        icon: Icons.email_outlined,
        title: 'Aucune newsletter favorite',
        subtitle: 'Les newsletters que vous marquerez comme favorites apparaîtront ici',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _favoriteNewsletters.length,
      itemBuilder: (context, index) {
        final newsletter = _favoriteNewsletters[index];
        return _buildNewsletterCard(newsletter);
      },
    );
  }

  Widget _buildArticleCard(Map<String, dynamic> article) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image de l'article
          ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(16),
            ),
            child: Image.network(
              article['imageUrl'],
              height: 200,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  height: 200,
                  color: Colors.grey[800],
                  child: const Icon(
                    Icons.image_not_supported,
                    color: Colors.grey,
                    size: 50,
                  ),
                );
              },
            ),
          ),
          
          // Contenu de l'article
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // En-tête avec catégorie et temps de lecture
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        article['category'],
                        style: const TextStyle(
                          color: Colors.blue,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(
                      Icons.access_time,
                      color: Colors.grey[400],
                      size: 16,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      article['readTime'],
                      style: TextStyle(
                        color: Colors.grey[400],
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // Titre de l'article
                Text(
                  article['title'],
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                  ),
                ),
                
                const SizedBox(height: 8),
                
                // Extrait de l'article
                Text(
                  article['excerpt'],
                  style: TextStyle(
                    color: Colors.grey[400],
                    fontSize: 14,
                    height: 1.4,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                
                const SizedBox(height: 16),
                
                // Actions
                Row(
                  children: [
                                         IconButton(
                       onPressed: () async {
                         try {
                           final apiService = ApiService();
                           await apiService.removeFromFavorites(article['id']);
                           
                           setState(() {
                             _favoriteArticles.removeWhere((a) => a['id'] == article['id']);
                           });
                           
                           ScaffoldMessenger.of(context).showSnackBar(
                             const SnackBar(
                               content: Text('Article retiré des favoris'),
                               backgroundColor: Colors.orange,
                             ),
                           );
                         } catch (e) {
                           ScaffoldMessenger.of(context).showSnackBar(
                             SnackBar(
                               content: Text('Erreur: ${e.toString()}'),
                               backgroundColor: Colors.red,
                             ),
                           );
                         }
                       },
                      icon: const Icon(
                        Icons.favorite,
                        color: Colors.red,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Retirer des favoris',
                      style: TextStyle(
                        color: Colors.grey[400],
                        fontSize: 12,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      article['date'],
                      style: TextStyle(
                        color: Colors.grey[500],
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNewsletterCard(Map<String, dynamic> newsletter) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // En-tête avec catégorie et temps de lecture
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.purple.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  newsletter['category'],
                  style: const TextStyle(
                    color: Colors.purple,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                Icons.access_time,
                color: Colors.grey[400],
                size: 16,
              ),
              const SizedBox(width: 4),
              Text(
                newsletter['readTime'],
                style: TextStyle(
                  color: Colors.grey[400],
                  fontSize: 12,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          // Titre de la newsletter
          Text(
            newsletter['title'],
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 8),
          
          // Extrait de la newsletter
          Text(
            newsletter['excerpt'],
            style: TextStyle(
              color: Colors.grey[400],
              fontSize: 14,
              height: 1.4,
            ),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
          
          const SizedBox(height: 16),
          
          // Actions
          Row(
            children: [
                             IconButton(
                 onPressed: () async {
                   try {
                     final apiService = ApiService();
                     await apiService.removeFromFavorites(newsletter['id']);
                     
                     setState(() {
                       _favoriteNewsletters.removeWhere((n) => n['id'] == newsletter['id']);
                     });
                     
                     ScaffoldMessenger.of(context).showSnackBar(
                       const SnackBar(
                         content: Text('Newsletter retirée des favoris'),
                         backgroundColor: Colors.orange,
                       ),
                     );
                   } catch (e) {
                     ScaffoldMessenger.of(context).showSnackBar(
                       SnackBar(
                         content: Text('Erreur: ${e.toString()}'),
                         backgroundColor: Colors.red,
                       ),
                     );
                   }
                 },
                icon: const Icon(
                  Icons.favorite,
                  color: Colors.red,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Retirer des favoris',
                style: TextStyle(
                  color: Colors.grey[400],
                  fontSize: 12,
                ),
              ),
              const Spacer(),
              Text(
                newsletter['date'],
                style: TextStyle(
                  color: Colors.grey[500],
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 80,
              color: Colors.grey[600],
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
                fontFamily: 'Poppins',
              ),
            ),
            const SizedBox(height: 12),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
