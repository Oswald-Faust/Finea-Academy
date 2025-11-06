import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import '../widgets/finea_app_bar.dart';
import '../widgets/alerts_section.dart';
import '../widgets/contest_winner_card.dart';
import '../widgets/investor_profile_section.dart';
import '../widgets/finea_vision_section.dart';
import '../widgets/actus_section.dart';
import '../widgets/myfxbook_widget.dart';
import '../widgets/newsletter_card.dart';
import '../models/newsletter_model.dart';
import '../services/api_service.dart';
import '../utils/image_utils.dart';
import 'concours_screen.dart';
import 'profile_screen.dart';
import 'newsletter_detail_screen.dart';
import 'tally_form_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();
  NewsletterArticle? _latestArticle;
  bool _isLoadingArticle = true;

  // Initialise OneSignal et récupère le Player ID
  Future<void> initPushNotifications() async {
    try {
      // Le Player ID sera récupéré automatiquement par le service
      // qui a déjà été initialisé dans main.dart
      debugPrint('📱 Notifications push initialisées (OneSignal)');
    } catch (e) {
      debugPrint('Erreur lors de l\'initialisation des notifications: $e');
      // Continuer sans notifications si l'initialisation échoue
    }
  }

  Future<void> _loadLatestArticle() async {
    try {
      setState(() {
        _isLoadingArticle = true;
      });

      final response = await _apiService.getNewsletterArticles(
        status: 'published',
        limit: 1,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      );

      if (response.data != null && response.data!.isNotEmpty) {
        final article = response.data!.first;
        
        // Vérifier si l'article est dans les favoris
        try {
          final favoriteResponse = await _apiService.checkIfFavorite(article.id);
          if (favoriteResponse.success && favoriteResponse.data != null) {
            article.isBookmarked = favoriteResponse.data!['isFavorite'] ?? false;
            debugPrint('💖 Article ${article.id} - En favori: ${article.isBookmarked}');
          }
        } catch (e) {
          debugPrint('Erreur lors de la vérification des favoris: $e');
          article.isBookmarked = false;
        }
        
        setState(() {
          _latestArticle = article;
          _isLoadingArticle = false;
        });
      } else {
        setState(() {
          _latestArticle = null;
          _isLoadingArticle = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoadingArticle = false;
      });
    }
  }

  Future<void> _toggleBookmark() async {
    if (_latestArticle == null) return;
    
    try {
      if (_latestArticle!.isBookmarked) {
        // Retirer des favoris
        await _apiService.removeFromFavorites(_latestArticle!.id);
        setState(() {
          _latestArticle!.isBookmarked = false;
        });
        debugPrint('💔 Article retiré des favoris - isBookmarked: ${_latestArticle!.isBookmarked}');
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Article retiré des favoris'),
              backgroundColor: Colors.orange,
              duration: Duration(seconds: 1),
            ),
          );
        }
      } else {
        // Ajouter aux favoris
        await _apiService.addToFavorites(_latestArticle!.id, type: 'article');
        setState(() {
          _latestArticle!.isBookmarked = true;
        });
        debugPrint('❤️ Article ajouté aux favoris - isBookmarked: ${_latestArticle!.isBookmarked}');
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Article ajouté aux favoris'),
              backgroundColor: Colors.blue,
              duration: Duration(seconds: 1),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  @override
  void initState() {
    super.initState();
    initPushNotifications();
    _loadLatestArticle();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Données des alertes
    final alerts = [
      {'date': '25-02-25', 'trade': 'BUY XAUUSD : 3333.3', 'tp': 'TP : 3340', 'sl': 'SL : 3330'},
      {'date': '24-02-25', 'trade': 'SELL EURUSD : 1.0850', 'tp': 'TP : 1.0820', 'sl': 'SL : 1.0880'},
      {'date': '23-02-25', 'trade': 'BUY GBPUSD : 1.2650', 'tp': 'TP : 1.2680', 'sl': 'SL : 1.2620'},
      {'date': '22-02-25', 'trade': 'SELL USDJPY : 150.50', 'tp': 'TP : 150.20', 'sl': 'SL : 150.80'},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0f0f23),
      appBar: FineaAppBar(
        actions: [
          IconButton(
            icon: const Icon(Icons.person, color: Colors.white),
            onPressed: () {
              // Navigation vers le profil
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const ProfileScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ARTICLE D'ACTUALITÉ EN VEDETTE
            if (_isLoadingArticle)
              Container(
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
              )
            else if (_latestArticle != null)
              NewsletterCard(
                title: _latestArticle!.title,
                date: "Finéa app ${_formatDate(_latestArticle!.date)}",
                imagePath: _getImagePath(_latestArticle!.imageUrl),
                isBookmarked: _latestArticle!.isBookmarked,
                onTap: () {
                  // Navigation vers l'article complet
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => NewsletterDetailScreen(article: _latestArticle!),
                    ),
                  );
                },
                onBookmark: _toggleBookmark,
              )
            else
              Container(
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.article_outlined,
                        color: Colors.white54,
                        size: 48,
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Aucun article disponible',
                        style: TextStyle(
                          color: Colors.white54,
                          fontSize: 16,
                          fontFamily: 'Poppins',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            
            const SizedBox(height: 20),
            
            // SECTION ACTUS
            const ActusSection(),
            
            const SizedBox(height: 40),
            
            // SECTION GAGNANT DU CONCOURS
            const Center(
              child: Text(
                "Le gagnant du dernier tirage !",
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Poppins',
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            ContestWinnerCard(
              drawDate: "01/01/2025",
              winner: "@username",
              gains: "147€",
              ethscanAddress: "0x1234...5678",
              onTap: () {
                // Navigation vers l'écran concours
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const ConcoursScreen(),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 24),
            
            // SECTION PROFIL INVESTISSEUR
            InvestorProfileSection(
              onDiscoverProfile: () {
                // Navigation vers l'outil Profil Investisseur
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const TallyFormScreen(),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 24),
            
            // SECTION LA VISION DE FINÉA
            const FineaVisionSection(),
            
            const SizedBox(height: 24),
            
           
            
            const SizedBox(height: 12),
            
            MyfxbookWidget(
              portfolioId: '11712757', // ID du portfolio "FINÉA"
              height: 400,
            ),
            
            const SizedBox(height: 24),
            
            // SECTION ALERTES CLÔTURÉES
            AlertsSection(alerts: alerts),
          ],
        ),
      ),
    );
  }

  String _getImagePath(String imageUrl) {
    return ImageUtils.getImageUrl(imageUrl);
  }

  String _formatDate(DateTime date) {
    final months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

} 