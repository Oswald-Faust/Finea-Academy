import 'dart:convert';
import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

// Handler de notifications en arrière-plan (doit être déclaré au niveau global)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('🔥 Notification reçue en arrière-plan: ${message.messageId}');
  
  // Traiter la notification en arrière-plan si nécessaire
  await PushNotificationService._handleBackgroundMessage(message);
}

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  static const String _tokenKey = 'fcm_token';
  static const String _deviceIdKey = 'device_id';
  
  FirebaseMessaging? _firebaseMessaging;
  FlutterLocalNotificationsPlugin? _localNotifications;
  String? _currentToken;
  bool _isInitialized = false;

  // Callback pour les notifications reçues
  Function(RemoteMessage)? onMessageReceived;
  Function(RemoteMessage)? onMessageOpenedApp;
  Function(RemoteMessage)? onBackgroundMessage;

  /// Initialise le service de notifications push
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // Initialiser Firebase
      await Firebase.initializeApp();
      _firebaseMessaging = FirebaseMessaging.instance;

      // Initialiser les notifications locales
      await _initializeLocalNotifications();

      // Demander les permissions
      await _requestPermissions();

      // Configurer les handlers de messages
      await _setupMessageHandlers();

      // Obtenir et enregistrer le token FCM
      await _getAndRegisterToken();

      _isInitialized = true;
      print('✅ Service de notifications push initialisé');
    } catch (e) {
      print('❌ Erreur lors de l\'initialisation des notifications push: $e');
    }
  }

  /// Initialise les notifications locales pour Android
  Future<void> _initializeLocalNotifications() async {
    _localNotifications = FlutterLocalNotificationsPlugin();

    // Configuration Android
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // Configuration iOS
    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initializationSettings =
        InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    await _localNotifications!.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Créer le canal de notification Android
    await _createNotificationChannel();
  }

  /// Crée le canal de notification pour Android
  Future<void> _createNotificationChannel() async {
    if (Platform.isAndroid) {
      const AndroidNotificationChannel channel = AndroidNotificationChannel(
        'finea_notifications', // ID du canal
        'Finéa Académie', // Nom du canal
        description: 'Notifications de Finéa Académie',
        importance: Importance.high,
        enableVibration: true,
        playSound: true,
      );

      await _localNotifications!
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);
    }
  }

  /// Demande les permissions de notifications
  Future<void> _requestPermissions() async {
    if (Platform.isIOS) {
      await _firebaseMessaging!.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );
    }

    // Pour Android 13+, demander les permissions de notifications
    if (Platform.isAndroid) {
      // Note: requestPermission() n'est pas disponible dans cette version
      // Les permissions sont gérées automatiquement par le système
      print('📱 Permissions de notifications Android configurées');
    }
  }

  /// Configure les handlers de messages
  Future<void> _setupMessageHandlers() async {
    // Handler pour les messages en arrière-plan
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handler pour les messages reçus quand l'app est au premier plan
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('📱 Notification reçue au premier plan: ${message.notification?.title}');
      _handleForegroundMessage(message);
      onMessageReceived?.call(message);
    });

    // Handler pour quand l'utilisateur tape sur une notification
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('👆 Notification tapée: ${message.notification?.title}');
      _handleNotificationTap(message);
      onMessageOpenedApp?.call(message);
    });

    // Vérifier si l'app a été ouverte depuis une notification
    RemoteMessage? initialMessage = await _firebaseMessaging!.getInitialMessage();
    if (initialMessage != null) {
      print('🚀 App ouverte depuis une notification: ${initialMessage.notification?.title}');
      _handleNotificationTap(initialMessage);
    }
  }

  /// Obtient et enregistre le token FCM
  Future<void> _getAndRegisterToken() async {
    try {
      String? token = await _firebaseMessaging!.getToken();
      if (token != null) {
        _currentToken = token;
        await _saveTokenLocally(token);
        await _registerTokenWithServer(token);
        print('🔑 Token FCM obtenu: ${token.substring(0, 20)}...');
      }

      // Écouter les changements de token
      _firebaseMessaging!.onTokenRefresh.listen((String newToken) {
        _currentToken = newToken;
        _saveTokenLocally(newToken);
        _registerTokenWithServer(newToken);
        print('🔄 Token FCM rafraîchi');
      });
    } catch (e) {
      print('❌ Erreur lors de l\'obtention du token: $e');
    }
  }

  /// Sauvegarde le token localement
  Future<void> _saveTokenLocally(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  /// Enregistre le token sur le serveur
  Future<void> _registerTokenWithServer(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String? deviceId = prefs.getString(_deviceIdKey);
      
      // Générer un device ID unique si nécessaire
      if (deviceId == null) {
        deviceId = DateTime.now().millisecondsSinceEpoch.toString();
        await prefs.setString(_deviceIdKey, deviceId);
      }

      String platform = Platform.isAndroid ? 'android' : Platform.isIOS ? 'ios' : 'web';

      final response = await ApiService.registerFCMToken(
        token: token,
        platform: platform,
        deviceId: deviceId,
      );

      if (response['success'] == true) {
        print('✅ Token FCM enregistré sur le serveur');
      } else {
        print('❌ Erreur lors de l\'enregistrement du token: ${response['error']}');
      }
    } catch (e) {
      print('❌ Erreur lors de l\'enregistrement du token sur le serveur: $e');
    }
  }

  /// Gère les messages reçus au premier plan
  void _handleForegroundMessage(RemoteMessage message) {
    // Afficher une notification locale sur Android
    if (Platform.isAndroid && message.notification != null) {
      _showLocalNotification(message);
    }
  }

  /// Affiche une notification locale
  Future<void> _showLocalNotification(RemoteMessage message) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'finea_notifications',
      'Finéa Académie',
      channelDescription: 'Notifications de Finéa Académie',
      importance: Importance.max,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
      color: Color(0xFF000D64), // Couleur Finéa
    );

    const DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    await _localNotifications!.show(
      message.hashCode,
      message.notification?.title ?? 'Finéa Académie',
      message.notification?.body ?? '',
      platformChannelSpecifics,
      payload: jsonEncode(message.data),
    );
  }

  /// Gère le tap sur une notification locale
  void _onNotificationTapped(NotificationResponse response) {
    if (response.payload != null) {
      try {
        Map<String, dynamic> data = jsonDecode(response.payload!);
        _handleNotificationData(data);
      } catch (e) {
        print('❌ Erreur lors du parsing du payload: $e');
      }
    }
  }

  /// Gère le tap sur une notification push
  void _handleNotificationTap(RemoteMessage message) {
    _handleNotificationData(message.data);
  }

  /// Gère les données de notification pour la navigation
  void _handleNotificationData(Map<String, dynamic> data) {
    print('📲 Données de notification: $data');
    
    // Ici vous pouvez implémenter la logique de navigation
    // selon le type de notification reçue
    String? type = data['type'];
    
    switch (type) {
      case 'course':
        // Naviguer vers la page des cours
        print('Navigation vers les cours');
        break;
      case 'contest':
        // Naviguer vers les concours
        print('Navigation vers les concours');
        break;
      case 'article':
        // Naviguer vers l'article
        print('Navigation vers l\'article');
        break;
      default:
        // Navigation par défaut
        print('Navigation par défaut');
        break;
    }
  }

  /// Handler statique pour les messages en arrière-plan
  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    // Traitement des notifications en arrière-plan
    print('📱 Traitement notification arrière-plan: ${message.notification?.title}');
    
    // Ici vous pouvez ajouter de la logique spécifique pour l'arrière-plan
    // comme sauvegarder des données localement, etc.
  }

  /// Obtient le token FCM actuel
  String? get currentToken => _currentToken;

  /// Vérifie si le service est initialisé
  bool get isInitialized => _isInitialized;

  /// Supprime le token du serveur lors de la déconnexion
  Future<void> unregisterToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String? deviceId = prefs.getString(_deviceIdKey);
      
      if (deviceId != null) {
        final response = await ApiService.unregisterFCMToken(deviceId: deviceId);
        
        if (response['success'] == true) {
          print('✅ Token FCM supprimé du serveur');
        }
      }
      
      // Supprimer localement
      await prefs.remove(_tokenKey);
      _currentToken = null;
    } catch (e) {
      print('❌ Erreur lors de la suppression du token: $e');
    }
  }

  /// Méthode pour tester les notifications
  Future<void> sendTestNotification() async {
    await _showLocalNotification(
      RemoteMessage(
        notification: const RemoteNotification(
          title: '🧪 Test Notification',
          body: 'Ceci est une notification de test !',
        ),
        data: {'type': 'test', 'timestamp': DateTime.now().millisecondsSinceEpoch.toString()},
      ),
    );
  }

  /// Configure les callbacks personnalisés
  void setCallbacks({
    Function(RemoteMessage)? onMessageReceived,
    Function(RemoteMessage)? onMessageOpenedApp,
    Function(RemoteMessage)? onBackgroundMessage,
  }) {
    this.onMessageReceived = onMessageReceived;
    this.onMessageOpenedApp = onMessageOpenedApp;
    this.onBackgroundMessage = onBackgroundMessage;
  }

  /// Nettoie les ressources
  void dispose() {
    _firebaseMessaging = null;
    _localNotifications = null;
    _currentToken = null;
    _isInitialized = false;
  }
}
