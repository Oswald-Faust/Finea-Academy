import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/onboarding_screen.dart';
import 'screens/login_screen.dart';
import 'screens/personal_info_screen.dart';
import 'screens/notifications_screen.dart'; 
import 'screens/security_screen.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';

Future<void> _firebaseBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  // You can handle background notifications here
}

final FlutterLocalNotificationsPlugin notificationsPlugin = FlutterLocalNotificationsPlugin();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    await Firebase.initializeApp();
    print('Firebase initialisé avec succès');
  } catch (e) {
    print('Erreur lors de l\'initialisation Firebase: $e');
    // Continuer sans Firebase si l'initialisation échoue
  }

  // Init local notifications (Android seulement)
  if (!kIsWeb) {
    try {
      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      await notificationsPlugin.initialize(const InitializationSettings(android: androidSettings));
      
      FirebaseMessaging.onBackgroundMessage(_firebaseBackgroundHandler);
      print('Notifications locales initialisées');
    } catch (e) {
      print('Erreur lors de l\'initialisation des notifications: $e');
    }
  } else {
    print('Mode web détecté - notifications locales désactivées');
  }
  
  runApp(const MyApp());
}

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late final ApiService apiService;
  late final AuthService authService;
  late final Future<void> _initializationFuture;

  @override
  void initState() {
    super.initState();
    // Créer les services
    apiService = ApiService();
    authService = AuthService(apiService);
    
    // Configurer la liaison entre les services
    ApiService.setTokenProvider(authService);
    
    // Initialiser une seule fois au démarrage
    _initializationFuture = authService.initialize();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiService>.value(value: apiService),
        ChangeNotifierProvider<AuthService>.value(value: authService),
      ],
      child: MaterialApp(
        title: 'Finéa App',
        debugShowCheckedModeBanner: false,
        navigatorKey: navigatorKey,
        theme: ThemeData(
          scaffoldBackgroundColor: const Color(0xFF000D64),
          fontFamily: 'Roboto',
        ),
        home: FutureBuilder(
          future: _initializationFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Scaffold(
                backgroundColor: Color(0xFF000D64),
                body: Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
              );
            }
            
            return const AppInitializer();
          },
        ),
      ),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const HomeScreen(),
      const FormationPage(),
      const PartnersPage(),
      const ProfilePage(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: const Color(0xFF000D64),
          unselectedItemColor: Colors.grey,
          selectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
          unselectedLabelStyle: const TextStyle(
            fontSize: 12,
          ),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home),
              activeIcon: Icon(Icons.home, size: 28),
              label: 'Accueil',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.school),
              activeIcon: Icon(Icons.school, size: 28),
              label: 'Formations',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.business),
              activeIcon: Icon(Icons.business, size: 28),
              label: 'Partenaires',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person),
              activeIcon: Icon(Icons.person, size: 28),
              label: 'Profil',
            ),
          ],
        ),
      ),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Timer timer;
  late Duration remaining;
  late DateTime nextSunday;

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
              await notificationsPlugin.show(
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
    updateCountdown();
    timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(updateCountdown);
    });
  }

  void updateCountdown() {
    // On utilise l'heure de Paris (UTC+2 en été)
    final nowUtc = DateTime.now().toUtc();
    final nowParis = nowUtc.add(const Duration(hours: 2));
    // Calcul du prochain dimanche à 19h (heure de Paris)
    nextSunday = DateTime(nowParis.year, nowParis.month, nowParis.day, 19);
    while (nextSunday.weekday != DateTime.sunday || !nextSunday.isAfter(nowParis)) {
      nextSunday = nextSunday.add(const Duration(days: 1));
    }
    remaining = nextSunday.difference(nowParis);
  }

  String formatDuration(Duration d) {
    final j = d.inDays;
    final h = d.inHours % 24;
    final m = d.inMinutes % 60;
    final s = d.inSeconds % 60;
    return '${j}j ${h}h ${m}m ${s}s';
  }

  String formatDate(DateTime date) {
    const weekdays = [
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
      'Dimanche'
    ];
    const months = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre'
    ];
    return '${weekdays[date.weekday - 1]} ${date.day} ${months[date.month - 1]} ${date.year} à ${date.hour}h';
  }

  @override
  void dispose() {
    timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          Builder(
            builder: (context) => IconButton(
              icon: const Icon(Icons.menu, color: Colors.white),
              onPressed: () => Scaffold.of(context).openEndDrawer(),
            ),
          ),
        ],
      ),
      endDrawer: _buildDrawer(),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 10),
            Image.asset('assets/images/logo_finea.png', width: 80),
            const SizedBox(height: 20),
            Image.asset('assets/images/roulette.png', width: 250),
            const SizedBox(height: 20),
            const Text(
              "Prochain tirage dans :",
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold
              ),
            ),
            const SizedBox(height: 10),
            Text(
              formatDuration(remaining),
              style: const TextStyle(color: Colors.white, fontSize: 26),
            ),
            const SizedBox(height: 10),
            Text(
              formatDate(nextSunday),
              style: const TextStyle(color: Colors.white, fontSize: 18),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                InkWell(
                  onTap: () async {
                    final uri = Uri.parse('https://www.instagram.com/finea.fr?igsh=MTh5aXVlaWx1emk4bQ==');
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                  child: Image.asset('assets/images/logo_instagram.png', width: 40),
                ),
                const SizedBox(width: 20),
                InkWell(
                  onTap: () async {
                    final uri = Uri.parse('https://www.tiktok.com/@wave_ia2?_t=ZN-8weGh12drNe&_r=1');
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                  child: Image.asset('assets/images/logo_tiktok.png', width: 40),
                ),
              ],
            ),
            const SizedBox(height: 30),
            const Text(
              "Prendre mes places !",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _placeButton("2 Places"),
                const SizedBox(width: 10),
                _placeButton("25 Places"),
                const SizedBox(width: 10),
                _placeButton("80 Places"),
              ],
            ),
            const SizedBox(height: 40),
            _whiteBox([
              const Text(
                "Tirage du : 01/01/2025",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                "Gagnant : @username",
                style: TextStyle(color: Colors.white, fontSize: 16)
              ),
              const SizedBox(height: 8),
              const Text(
                "Gains : 147€",
                style: TextStyle(color: Colors.white, fontSize: 16)
              ),
              const SizedBox(height: 8),
              const Text(
                "Adresse ETHscan :",
                style: TextStyle(color: Colors.white, fontSize: 16)
              ),
            ]),
            const SizedBox(height: 20),
            _whiteBox([
              const Text(
                "Mot de passe MT4",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                "ID :",
                style: TextStyle(color: Colors.white, fontSize: 16)
              ),
              const SizedBox(height: 8),
              const Text(
                "MDP :",
                style: TextStyle(color: Colors.white, fontSize: 16)
              ),
              const SizedBox(height: 8),
              const Text(
                "Serveur :",
                style: TextStyle(color: Colors.white, fontSize: 16)
              ),
            ]),
            const SizedBox(height: 20),
            SizedBox(
              width: 330,
              child: const Text(
                "Les mots de passe investisseur sont partagés uniquement le samedi et le dimanche, puis modifiés après le tirage au sort chaque dimanche. Cela permet d’éviter tout vol ou copie des trades en cours de semaine. Grâce à ces accès, vous pourrez suivre en toute transparence tous les trades exécutés via l’application MT4.",
                style: TextStyle(color: Colors.white, fontSize: 14),
                textAlign: TextAlign.justify,
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Drawer _buildDrawer() {  
    return Drawer(
      backgroundColor: const Color(0xFF000D64),
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(color: Color(0xFF000D64)),
            child: Center(
              child: Image.asset('assets/images/logo_finea.png', height: 60),
            ),
          ),
          _menuItem('🎯 Jeu Concours', const HomeScreen()),
          _menuItem('📚 Formations', const FormationPage()),
          _menuItem('📰 Newsletter', const NewsletterPage()),
          _menuItem('🔒 Alerte Manuel', const AlerteMaximePage()),
          _menuItem('🔒 Alerte EA', const AlerteEaPage()),
          _menuItem('🤝 Nos Partenaires', const PlaceholderPage(title: 'Nos Partenaires')),
        ],
      ),
    );
  }
}

Widget _menuItem(String title, Widget page) {
  return ListTile(
    title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 18)),
    onTap: () => navigatorKey.currentState!.push(MaterialPageRoute(builder: (_) => page)),
  );
}

Widget _placeButton(String label) {
  return InkWell(
    onTap: () async {
      const url = 'https://ifgdfg-es.myshopify.com/';
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    },
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white, width: 2),
      ),
      child: Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
    ),
  );
}

Widget _whiteBox(List<Widget> children) {
  return Container(
    width: 330,
    padding: const EdgeInsets.all(16),
    margin: const EdgeInsets.symmetric(horizontal: 10),
    decoration: BoxDecoration(
      color: const Color(0xFF000D64),
      border: Border.all(color: Colors.white, width: 2),
      borderRadius: BorderRadius.circular(16),
    ),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
  );
}

class FormationPage extends StatelessWidget {
  const FormationPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000D64),
      appBar: AppBar(
        backgroundColor: const Color(0xFF000D64),
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text('Formations Finéa', style: TextStyle(color: Colors.white)),
        centerTitle: true,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 20),
            Center(child: Image.asset('assets/images/formation_bourse.png', width: 300)),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PlaceholderPage(title: 'Formation Bourse')),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: const Color(0xFF000D64),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text("📈 Voir la formation Bourse"),
            ),
            const SizedBox(height: 20),
            Center(child: Image.asset('assets/images/formation_trading.png', width: 300)),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PlaceholderPage(title: 'Formation Trading')),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: const Color(0xFF000D64),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ), 
              child: const Text("📊 Voir la formation Trading"),
            ),
            const SizedBox(height: 20),
            Center(child: Image.asset('assets/images/formation_marketing.png', width: 300)),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PlaceholderPage(title: 'Formation Marketing')),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: const Color(0xFF000D64),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ), 
              child: const Text("💡 Voir la formation Marketing"),
            ),
            const SizedBox(height: 20),
            Center(child: Image.asset('assets/images/formation_algo.png', width: 300)),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PlaceholderPage(title: 'Formation Algorithme')),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: const Color(0xFF000D64),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ), 
              child: const Text("🤖 Voir la formation Algorithme"),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

class NewsletterPage extends StatelessWidget {
  const NewsletterPage({super.key});
  @override
  Widget build(BuildContext context) => _placeholder('Newsletter');
}

class AlerteMaximePage extends StatelessWidget {
  const AlerteMaximePage({super.key});
  @override
  Widget build(BuildContext context) => _placeholder('Alerte Manuel 🔒');
}

class AlerteEaPage extends StatelessWidget {
  const AlerteEaPage({super.key});
  @override
  Widget build(BuildContext context) => _placeholder('Alerte EA 🔒');
}

class PartnersPage extends StatelessWidget {
  const PartnersPage({super.key});

  @override
  Widget build(BuildContext context) {
    final partners = [
      {'image': 'assets/images/AGBK.jpg', 'url': 'https://live.agbk-broker.com/signup/6vbWZAML'},
      {'image': 'assets/images/TradeRepublic.jpg', 'url': 'https://refnocode.trade.re/s3t786nz'},
      {'image': 'assets/images/Finary.jpg', 'url': 'https://finary.com/referral/7WTMM4'},
      {'image': 'assets/images/Ufunded.jpg', 'url': 'https://ufunded.com/fr/prc?utm_medium=PRC'},
      {'image': 'assets/images/Bitget.jpg', 'url': 'https://bonus.bitgetapp.com/50Z95Y'},
      {'image': 'assets/images/Puprime.jpg', 'url': 'https://fr.puprime.partners/forex-trading-account/?affid=1560546'},
    ];
    
    return Scaffold(
      backgroundColor: const Color(0xFF000D64),
      appBar: AppBar(
        backgroundColor: const Color(0xFF000D64),
        title: const Text('Nos Partenaires', style: TextStyle(color: Colors.white)),
        centerTitle: true,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: partners.map((p) {
            return Center(
              child: Container(
                width: 300,
                margin: const EdgeInsets.symmetric(vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Image.asset(p['image']!, width: 300),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: () async {
                        final uri = Uri.parse(p['url']!);
                        if (await canLaunchUrl(uri)) {
                          await launchUrl(uri, mode: LaunchMode.externalApplication);
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF000D64),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Accéder'),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000D64),
      appBar: AppBar(
        backgroundColor: const Color(0xFF000D64),
        title: const Text('Mon Profil', style: TextStyle(color: Colors.white)),
        centerTitle: true,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const SizedBox(height: 20),
            
            // Avatar et logo
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 3),
                color: Colors.white.withOpacity(0.1),
              ),
              child: ClipOval(
                child: Image.asset(
                  'assets/images/logo_finea.png',
                  fit: BoxFit.cover,
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Nom utilisateur
            const Text(
              'Membre Finéa',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            
            const SizedBox(height: 8),
            
            Text(
              'Actif depuis Janvier 2025',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white.withOpacity(0.8),
              ),
            ),
            
            const SizedBox(height: 40),
            
            // Options du profil
            _profileOption(
              icon: Icons.person,
              title: 'Informations personnelles',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PersonalInfoScreen()),
                );
              },
            ),
            
            _profileOption(
              icon: Icons.notifications,
              title: 'Notifications',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                );
              },
            ),
            
            _profileOption(
              icon: Icons.security,
              title: 'Sécurité',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SecurityScreen()),
                );
              },
            ),
            
            _profileOption(
              icon: Icons.help,
              title: 'Aide & Support',
              onTap: () async {
                const url = 'https://www.finea-academie.fr';
                final uri = Uri.parse(url);
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                }
              },
            ),
            
            _profileOption(
              icon: Icons.info,
              title: 'À propos',
              onTap: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    backgroundColor: const Color(0xFF000D64),
                    title: const Text('À propos', style: TextStyle(color: Colors.white)),
                    content: const Text(
                      'Finéa Académie v1.0.0\n\nVotre plateforme d\'éducation financière et de trading.',
                      style: TextStyle(color: Colors.white),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Fermer', style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                );
              },
            ),
            
            const SizedBox(height: 40),
            
            // Bouton de déconnexion
            Container(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      backgroundColor: const Color(0xFF000D64),
                      title: const Text('Déconnexion', style: TextStyle(color: Colors.white)),
                      content: const Text(
                        'Êtes-vous sûr de vouloir vous déconnecter ?',
                        style: TextStyle(color: Colors.white),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Annuler', style: TextStyle(color: Colors.white)),
                        ),
                        TextButton(
                          onPressed: () async {
                            Navigator.of(context).pop();
                            
                            // Déconnexion via AuthService
                            final authService = Provider.of<AuthService>(context, listen: false);
                            await authService.logout();
                            
                            // Afficher message de succès
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Déconnexion effectuée')),
                              );
                            }
                          },
                          child: const Text('Déconnexion', style: TextStyle(color: Colors.red)),
                        ),
                      ],
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Se déconnecter',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _profileOption({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withOpacity(0.2)),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                color: Colors.white,
                size: 24,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                color: Colors.white.withOpacity(0.6),
                size: 16,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class PlaceholderPage extends StatelessWidget {
  final String title;
  const PlaceholderPage({super.key, required this.title});

  @override
  Widget build(BuildContext context) => _placeholder(title);
}

Widget _placeholder(String title) {
  final bool isPartnersPage = title == 'Nos Partenaires';
  final bool isTradingPage = title == 'Formation Trading';
  final bool isBoursePage = title == 'Formation Bourse';

  if (isPartnersPage) {
    final partners = [
      {'image': 'assets/images/AGBK.jpg', 'url': 'https://live.agbk-broker.com/signup/6vbWZAML'},
      {'image': 'assets/images/TradeRepublic.jpg', 'url': 'https://refnocode.trade.re/s3t786nz'},
      {'image': 'assets/images/Finary.jpg', 'url': 'https://finary.com/referral/7WTMM4'},
      {'image': 'assets/images/Ufunded.jpg', 'url': 'https://ufunded.com/fr/prc?utm_medium=PRC'},
      {'image': 'assets/images/Bitget.jpg', 'url': 'https://bonus.bitgetapp.com/50Z95Y'},
      {'image': 'assets/images/Puprime.jpg', 'url': 'https://fr.puprime.partners/forex-trading-account/?affid=1560546'},
    ];
    return Scaffold(
      backgroundColor: const Color(0xFF000D64),
      appBar: AppBar(
        backgroundColor: const Color(0xFF000D64),
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(title, style: const TextStyle(color: Colors.white)),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: partners.map((p) {
            return Center(
              child: Container(
                width: 300,
                margin: const EdgeInsets.symmetric(vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Image.asset(p['image']!, width: 300),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: () async {
                        final uri = Uri.parse(p['url']!);
                        if (await canLaunchUrl(uri)) {
                          await launchUrl(uri, mode: LaunchMode.externalApplication);
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF000D64),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Accéder'),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  } else if (isTradingPage) {
    final tradingImages = List.generate(40, (i) => 'assets/images/Trading ${i + 1}.jpg');
    return Scaffold(
      backgroundColor: const Color(0xFF000D64),
      appBar: AppBar(
        backgroundColor: const Color(0xFF000D64),
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(title, style: const TextStyle(color: Colors.white)),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: tradingImages.map((path) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: InkWell(
                  onTap: () async {
                    const url = 'https://www.finea-academie.fr';
                    final uri = Uri.parse(url);
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                  child: Image.asset(path, width: 300),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  } else if (isBoursePage) {
    final bourseImages = List.generate(46, (i) => 'assets/images/Bourse ${i + 1} .jpg');
    return Scaffold(
      backgroundColor: const Color(0xFF000D64),
      appBar: AppBar(
        backgroundColor: const Color(0xFF000D64),
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(title, style: const TextStyle(color: Colors.white)),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: bourseImages.map((path) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: InkWell(
                  onTap: () async {
                    const url = 'https://www.finea-academie.fr';
                    final uri = Uri.parse(url);
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                  child: Image.asset(path, width: 300),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  } else {
    return Scaffold(
      backgroundColor: const Color(0xFF000D64),
      appBar: AppBar(
        backgroundColor: const Color(0xFF000D64),
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(title, style: const TextStyle(color: Colors.white)),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'réserver au membres finéa',
              style: TextStyle(fontSize: 18, color: Colors.white),
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: () async {
                const url = 'https://www.finea-academie.fr';
                final uri = Uri.parse(url);
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                }
              },
              child: const Text(
                'Devenir membre',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.blueAccent,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AppInitializer extends StatelessWidget {
  const AppInitializer({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _checkOnboardingStatus(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: Color(0xFF000D64),
            body: Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
          );
        }
        
        final hasCompletedOnboarding = snapshot.data ?? false;
        
        if (!hasCompletedOnboarding) {
          return const OnboardingScreen();
        }
        
        // Si l'onboarding est terminé, donner accès libre à l'app
        return const MainNavigationScreen();
      },
    );
  }

  Future<bool> _checkOnboardingStatus() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('onboarding_completed') ?? false;
  }
}
