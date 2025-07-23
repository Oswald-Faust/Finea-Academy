import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../widgets/featured_article_card.dart';
import '../widgets/alerts_section.dart';
import '../widgets/contest_winner_card.dart';
import '../widgets/investor_profile_section.dart';
import '../widgets/finea_vision_section.dart';
import 'concours_screen.dart'; // Added import for ConcoursScreen
import 'profile_screen.dart'; // Added import for ProfileScreen

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
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

  @override
  void initState() {
    super.initState();
    initFCM();
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
            FeaturedArticleCard(
              title: "La guerre commerciale de Donald Trump, un immense défi pour l'économie mondiale",
              content: "La guerre commerciale lancée par Donald Trump, notamment contre la Chine, a marqué un tournant majeur dans l'économie mondiale. En imposant des droits de douane massifs sur des centaines de milliards de dollars de biens, son administration a cherché à réduire le déficit commercial américain et à rapatrier certaines industries.",
              date: "Finéa app 3 Juillet 2025",
              imagePath: 'assets/images/Bourse 1 .jpg',
              onReadMore: () {
                // Navigation vers l'article complet
              },
              onBookmark: () {
                // Ajouter aux favoris
              },
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
} 