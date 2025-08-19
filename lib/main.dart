import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/onboarding_screen.dart';
import 'screens/main_navigation_screen.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'services/push_notification_service.dart';
import 'screens/login_screen.dart';
import 'firebase_options.dart';

Future<void> _firebaseBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  // You can handle background notifications here
}

final FlutterLocalNotificationsPlugin notificationsPlugin = FlutterLocalNotificationsPlugin();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
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
  late final PushNotificationService pushNotificationService;
  late final Future<void> _initializationFuture;

  @override
  void initState() {
    super.initState();
    // Créer les services
    apiService = ApiService();
    authService = AuthService(apiService);
    pushNotificationService = PushNotificationService();
    
    // Configurer la liaison entre les services
    ApiService.setTokenProvider(authService);
    
    // Initialiser les services
    _initializationFuture = _initializeServices();
  }

  Future<void> _initializeServices() async {
    try {
      // Initialiser l'authentification
      await authService.initialize();
      
      // Initialiser les notifications push
      await pushNotificationService.initialize();
      
      // Configurer les callbacks des notifications
      pushNotificationService.setCallbacks(
        onMessageReceived: (RemoteMessage message) {
          print('📱 Notification reçue: ${message.notification?.title}');
          // Ici vous pouvez ajouter une logique personnalisée
          _showInAppNotification(message);
        },
        onMessageOpenedApp: (RemoteMessage message) {
          print('👆 App ouverte depuis notification: ${message.notification?.title}');
          // Naviguer selon le type de notification
          _handleNotificationNavigation(message);
        },
      );

      print('✅ Tous les services initialisés');
    } catch (e) {
      print('❌ Erreur lors de l\'initialisation des services: $e');
      // Continuer même en cas d'erreur pour que l'app reste fonctionnelle
    }
  }

  void _showInAppNotification(RemoteMessage message) {
    // Afficher une notification in-app si nécessaire
    if (mounted && message.notification != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message.notification!.body ?? 'Nouvelle notification'),
          action: SnackBarAction(
            label: 'Voir',
            onPressed: () => _handleNotificationNavigation(message),
          ),
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  void _handleNotificationNavigation(RemoteMessage message) {
    // Logique de navigation selon le type de notification
    final String? type = message.data['type'];
    
    switch (type) {
      case 'course':
        // Naviguer vers la section cours
        navigatorKey.currentState?.pushNamed('/courses');
        break;
      case 'contest':
        // Naviguer vers les concours
        navigatorKey.currentState?.pushNamed('/contests');
        break;
      case 'article':
        // Naviguer vers l'article spécifique
        final String? articleId = message.data['articleId'];
        if (articleId != null) {
          navigatorKey.currentState?.pushNamed('/article/$articleId');
        }
        break;
      default:
        // Navigation par défaut vers la page d'accueil
        navigatorKey.currentState?.pushNamedAndRemoveUntil('/', (route) => false);
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiService>.value(value: apiService),
        ChangeNotifierProvider<AuthService>.value(value: authService),
        Provider<PushNotificationService>.value(value: pushNotificationService),
      ],
      child: MaterialApp(
        title: 'Finéa App',
        debugShowCheckedModeBanner: false,
        navigatorKey: navigatorKey,
        theme: ThemeData(
          scaffoldBackgroundColor: const Color(0xFF000D64),
          fontFamily: 'Poppins',
          textTheme: const TextTheme(
            displayLarge: TextStyle(fontFamily: 'Poppins'),
            displayMedium: TextStyle(fontFamily: 'Poppins'),
            displaySmall: TextStyle(fontFamily: 'Poppins'),
            headlineLarge: TextStyle(fontFamily: 'Poppins'),
            headlineMedium: TextStyle(fontFamily: 'Poppins'),
            headlineSmall: TextStyle(fontFamily: 'Poppins'),
            titleLarge: TextStyle(fontFamily: 'Poppins'),
            titleMedium: TextStyle(fontFamily: 'Poppins'),
            titleSmall: TextStyle(fontFamily: 'Poppins'),
            bodyLarge: TextStyle(fontFamily: 'Poppins'),
            bodyMedium: TextStyle(fontFamily: 'Poppins'),
            bodySmall: TextStyle(fontFamily: 'Poppins'),
            labelLarge: TextStyle(fontFamily: 'Poppins'),
            labelMedium: TextStyle(fontFamily: 'Poppins'),
            labelSmall: TextStyle(fontFamily: 'Poppins'),
          ),
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

class AppInitializer extends StatelessWidget {
  const AppInitializer({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthService>(
      builder: (context, authService, child) {
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
        
            // Si l'utilisateur est connecté, aller directement à l'app principale
            if (authService.isLoggedIn) {
              return const MainNavigationScreen();
            }
            
            // Si l'onboarding n'est pas terminé, afficher l'onboarding
        if (!hasCompletedOnboarding) {
          return const OnboardingScreen();
        }
        
            // Si l'onboarding est terminé mais l'utilisateur n'est pas connecté,
            // afficher l'écran de connexion
            return const LoginScreen();
          },
        );
      },
    );
  }

  Future<bool> _checkOnboardingStatus() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('onboarding_completed') ?? false;
  }
}
