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
import 'screens/login_screen.dart';

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
