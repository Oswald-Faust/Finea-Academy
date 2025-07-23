import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../widgets/featured_article_card.dart';
import '../widgets/alerts_section.dart';
import '../widgets/contest_winner_card.dart';
import '../widgets/investor_profile_section.dart';
import '../widgets/finea_vision_section.dart';
import '../models/newsletter_model.dart';
import '../services/api_service.dart';
import 'concours_screen.dart';
import 'profile_screen.dart';
import 'newsletter_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();
  NewsletterArticle? _latestArticle;
  bool _isLoadingArticle = true;
  String _errorMessage = '';

  // Initialise FCM, request permissions et récupère le token
  Future<void> initFCM() async {
    try {
      final fcm = FirebaseMessaging.instance;
      
      // Demander les permissions (fonctionne sur web et mobile)
      await fcm.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );
      
      final token = await fcm.getToken();
      debugPrint('FCM token: '
          '[32m$token[0m'); // affichage vert dans la console

      FirebaseMessaging.onMessage.listen((message) async {
        final notif = message.notification;
        if (notif != null) {
          debugPrint('Notification reçue: ${notif.title} - ${notif.body}');
          
          // Affiche une notification locale seulement sur mobile
          if (!kIsWeb) {
            try {
              const android = AndroidNotificationDetails(
                'default',
                'Messages',
                importance: Importance.max,
                priority: Priority.high,
              );
              await FlutterLocalNotificationsPlugin().show(
                notif.hashCode,
                notif.title,
                notif.body,
                const NotificationDetails(android: android),
              );
            } catch (e) {
              debugPrint('Erreur lors de l\'affichage de la notification: $e');
            }
          } else {
            // Sur le web, on peut afficher un snackbar ou autre alternative
            debugPrint('Notification web: ${notif.title} - ${notif.body}');
          }
        }
      });
    } catch (e) {
      debugPrint('Erreur lors de l\'initialisation FCM: $e');
      // Continuer sans FCM si l'initialisation échoue
    }
  }

  Future<void> _loadLatestArticle() async {
    try {
      setState(() {
        _isLoadingArticle = true;
        _errorMessage = '';
      });

      final response = await _apiService.getNewsletterArticles(
        status: 'published',
        limit: 1,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
      );

      if (response.data != null && response.data!.isNotEmpty) {
        setState(() {
          _latestArticle = response.data!.first;
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
        _errorMessage = e.toString();
        _isLoadingArticle = false;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    initFCM();
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
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
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
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
              )
            else if (_latestArticle != null)
              FeaturedArticleCard(
                title: _latestArticle!.title,
                content: _latestArticle!.content.isNotEmpty 
                    ? _latestArticle!.content 
                    : _getTruncatedDescription(_latestArticle!.title),
                date: "Finéa app ${_formatDate(_latestArticle!.date)}",
                imagePath: _getImagePath(_latestArticle!.imageUrl),
                onReadMore: () {
                  // Navigation vers l'article complet
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => NewsletterDetailScreen(article: _latestArticle!),
                    ),
                  );
                },
                onBookmark: () {
                  // Ajouter aux favoris
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Article ajouté aux favoris'),
                      backgroundColor: Colors.blue,
                    ),
                  );
                },
              )
            else
              Container(
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
            
            const SizedBox(height: 24),
            
            // SECTION ALERTES CLÔTURÉES
            AlertsSection(alerts: alerts),
            
            const SizedBox(height: 24),
            
            // SECTION GAGNANT DU CONCOURS
            const Text(
              "Le gagnant du jeu concours !",
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
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
                // Navigation vers le profil investisseur
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Fonctionnalité en développement'),
                    backgroundColor: Colors.blue,
                  ),
                );
              },
            ),
            
            const SizedBox(height: 24),
            
            // SECTION LA VISION DE FINÉA
            const FineaVisionSection(),
          ],
        ),
      ),
    );
  }

  String _getImagePath(String imageUrl) {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    } else if (imageUrl.startsWith('/uploads/')) {
      return 'http://localhost:5000$imageUrl';
    } else if (imageUrl.isNotEmpty) {
      return imageUrl;
    } else {
      return 'assets/images/Bourse 1 .jpg';
    }
  }

  String _formatDate(DateTime date) {
    final months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  String _getTruncatedDescription(String title) {
    const maxLength = 100;
    if (title.length <= maxLength) {
      return title;
    }
    return '${title.substring(0, maxLength)}...';
  }
} 