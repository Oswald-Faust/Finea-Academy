import 'dart:convert';
import 'dart:io';
import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../services/api_service.dart';

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  static const String _tokenKey = 'onesignal_player_id';
  static const String _deviceIdKey = 'device_id';
  
  FlutterLocalNotificationsPlugin? _localNotifications;
  String? _currentPlayerId;
  bool _isInitialized = false;

  // Callbacks pour les notifications reçues
  Function(Map<String, dynamic>)? onMessageReceived;
  Function(Map<String, dynamic>)? onMessageOpenedApp;

  /// Initialise le service OneSignal
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // Initialiser les notifications locales
      await _initializeLocalNotifications();

      // Initialiser OneSignal (utilise les variables d'environnement ou une constante)
      // L'App ID sera configuré dans le code ou via une variable d'environnement
      // Pour l'instant, on va le récupérer depuis une configuration
      // L'App ID sera passé lors de l'appel à initializeWithAppId()
      _isInitialized = true;
      print('✅ Service OneSignal initialisé (en attente de App ID)');
    } catch (e) {
      print('❌ Erreur lors de l\'initialisation OneSignal: $e');
    }
  }

  /// Initialise OneSignal avec l'App ID
  Future<void> initializeWithAppId(String appId) async {
    try {
      print('🚀 Initialisation OneSignal avec App ID: ${appId.substring(0, 20)}...');
      
      // Vérifier si on est sur simulateur iOS (les notifications push ne fonctionnent pas sur simulateur)
      if (Platform.isIOS) {
        // Note: On ne peut pas détecter directement si c'est un simulateur,
        // mais on peut afficher un avertissement
        print('📱 iOS détecté - Les notifications push nécessitent un appareil réel');
        print('⚠️  Si vous êtes sur simulateur, les notifications ne fonctionneront PAS');
      }
      
      // Initialiser OneSignal
      OneSignal.initialize(appId);
      print('✅ OneSignal SDK initialisé');
      
      // Attendre un peu pour que OneSignal s'initialise complètement
      await Future.delayed(Duration(milliseconds: 500));
      
      // Demander les permissions
      final permissionResult = await OneSignal.Notifications.requestPermission(true);
      print('📱 Permission notifications: $permissionResult');
      
      if (permissionResult == false) {
        print('⚠️  Les notifications ont été refusées par l\'utilisateur');
      }
      
      // Configurer les handlers AVANT de demander le Player ID
      _setupMessageHandlers();
      print('✅ Handlers OneSignal configurés');
      
      // Afficher un résumé de la configuration
      print('🔍 Configuration OneSignal:');
      print('   - App ID: ${appId.substring(0, 20)}...');
      print('   - Permissions: ${permissionResult ? "✅ Autorisées" : "❌ Refusées"}');
      print('   - Handlers: ✅ Configurés');
      
      // Récupérer le Player ID (avec délai pour laisser OneSignal se synchroniser)
      await Future.delayed(Duration(milliseconds: 500));
      await _getAndRegisterPlayerId();
      
      print('✅ OneSignal complètement initialisé avec App ID: $appId');
      _isInitialized = true;
    } catch (e) {
      print('❌ Erreur lors de l\'initialisation OneSignal: $e');
      print('❌ Stack trace: ${StackTrace.current}');
    }
  }

  /// Initialise les notifications locales pour Android
  Future<void> _initializeLocalNotifications() async {
    _localNotifications = FlutterLocalNotificationsPlugin();

    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

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

    await _createNotificationChannel();
  }

  /// Crée le canal de notification pour Android
  Future<void> _createNotificationChannel() async {
    if (Platform.isAndroid) {
      const AndroidNotificationChannel channel = AndroidNotificationChannel(
        'finea_notifications',
        'Finéa Académie',
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

  /// Configure les handlers de messages OneSignal
  void _setupMessageHandlers() {
    print('🔧 Configuration des handlers OneSignal...');
    
    // Handler pour les notifications reçues (tappées)
    OneSignal.Notifications.addClickListener((event) {
      print('👆 Notification tapée !');
      print('   Titre: ${event.notification.title}');
      print('   Contenu: ${event.notification.body}');
      print('   Données: ${event.notification.additionalData}');
      
      final data = event.notification.additionalData ?? {};
      data['title'] = event.notification.title;
      data['body'] = event.notification.body;
      _handleNotificationTap(data);
      onMessageOpenedApp?.call(data);
    });
    print('✅ Handler click configuré');

    // Handler pour les notifications reçues en premier plan (app ouverte)
    OneSignal.Notifications.addForegroundWillDisplayListener((event) {
      print('📱 ========================================');
      print('📱 NOTIFICATION REÇUE AU PREMIER PLAN !');
      print('📱 Titre: ${event.notification.title}');
      print('📱 Contenu: ${event.notification.body}');
      print('📱 Données: ${event.notification.additionalData}');
      print('📱 ========================================');
      
      final data = event.notification.additionalData ?? {};
      data['title'] = event.notification.title;
      data['body'] = event.notification.body;
      
      // Appeler le callback
      onMessageReceived?.call(data);
      
      // NE PAS appeler preventDefault() - laisser OneSignal afficher
      // La notification sera affichée automatiquement par OneSignal
      
      // Pour garantir l'affichage sur iOS, on affiche aussi une notification locale
      if (Platform.isIOS && _localNotifications != null) {
        print('📲 Affichage notification locale iOS...');
        _showLocalNotification(
          title: event.notification.title ?? 'Notification',
          body: event.notification.body ?? '',
          data: data,
        );
      }
      
      // Pour Android aussi
      if (Platform.isAndroid && _localNotifications != null) {
        print('📲 Affichage notification locale Android...');
        _showLocalNotification(
          title: event.notification.title ?? 'Notification',
          body: event.notification.body ?? '',
          data: data,
        );
      }
    });
    print('✅ Handler foreground configuré');
  }

  /// Obtient et enregistre le Player ID OneSignal
  Future<void> _getAndRegisterPlayerId() async {
    try {
      print('🔍 Tentative d\'obtention du Player ID OneSignal...');
      
      // Attendre un peu pour que OneSignal soit complètement initialisé
      await Future.delayed(Duration(seconds: 1));
      
      // Obtenir le Player ID
      final subscriptionState = OneSignal.User.pushSubscription;
      final playerId = await subscriptionState.id;
      
      print('🔍 Player ID brut de OneSignal: $playerId');
      
      if (playerId != null && playerId.isNotEmpty) {
        _currentPlayerId = playerId;
        await _saveTokenLocally(playerId);
        await _registerPlayerIdWithServer(playerId);
        print('✅ Player ID OneSignal obtenu et enregistré: ${playerId.substring(0, 20)}...');
      } else {
        print('⚠️  Player ID OneSignal est null ou vide');
        // Réessayer après 2 secondes
        Future.delayed(Duration(seconds: 2), () async {
          final retryPlayerId = await subscriptionState.id;
          if (retryPlayerId != null && retryPlayerId.isNotEmpty) {
            _currentPlayerId = retryPlayerId;
            await _saveTokenLocally(retryPlayerId);
            await _registerPlayerIdWithServer(retryPlayerId);
            print('✅ Player ID OneSignal obtenu (retry): ${retryPlayerId.substring(0, 20)}...');
          }
        });
      }

      // Écouter les changements de Player ID
      OneSignal.User.pushSubscription.addObserver((state) {
        final newPlayerId = state.current.id;
        print('🔄 Événement Player ID: ${newPlayerId != null ? newPlayerId.substring(0, 20) + "..." : "null"}');
        if (newPlayerId != null && newPlayerId.isNotEmpty && newPlayerId != _currentPlayerId) {
          _currentPlayerId = newPlayerId;
          _saveTokenLocally(newPlayerId);
          _registerPlayerIdWithServer(newPlayerId);
          print('✅ Player ID OneSignal rafraîchi et enregistré: ${newPlayerId.substring(0, 20)}...');
        }
      });
    } catch (e) {
      print('❌ Erreur lors de l\'obtention du Player ID: $e');
      print('❌ Stack trace: ${StackTrace.current}');
    }
  }

  /// Sauvegarde le Player ID localement
  Future<void> _saveTokenLocally(String playerId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, playerId);
  }

  /// Enregistre le Player ID sur le serveur
  Future<void> _registerPlayerIdWithServer(String playerId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String? deviceId = prefs.getString(_deviceIdKey);
      
      // Générer un device ID unique si nécessaire
      if (deviceId == null) {
        // Générer un UUID unique pour cet appareil
        const uuid = Uuid();
        deviceId = uuid.v4();
        await prefs.setString(_deviceIdKey, deviceId);
      }

      String platform = Platform.isAndroid ? 'android' : Platform.isIOS ? 'ios' : 'web';

      print('📤 Envoi du Player ID au serveur: $playerId (platform: $platform, device: $deviceId)');
      
      final response = await ApiService.registerFCMToken(
        token: playerId,
        platform: platform,
        deviceId: deviceId,
      );

      if (response['success'] == true) {
        print('✅ Player ID OneSignal enregistré sur le serveur avec succès');
      } else {
        print('⚠️  Erreur lors de l\'enregistrement: ${response['error']}');
        // Si l'erreur est due à une non-authentification, on stocke le Player ID pour réessayer plus tard
        if (response['error']?.toString().toLowerCase().contains('auth') ?? false) {
          print('⚠️  Utilisateur non connecté - Player ID sera enregistré après connexion');
          // Le Player ID sera réenregistré quand l'utilisateur se connectera
        }
      }
    } catch (e) {
      print('❌ Erreur lors de l\'enregistrement du Player ID sur le serveur: $e');
      // En cas d'erreur réseau, on garde le Player ID pour réessayer
      print('⚠️  Player ID conservé localement, sera réenregistré après connexion');
    }
  }

  /// Réessayer d'enregistrer le Player ID (à appeler après connexion)
  Future<void> retryRegisterPlayerId() async {
    if (_currentPlayerId != null && _currentPlayerId!.isNotEmpty) {
      print('🔄 Réessai d\'enregistrement du Player ID après connexion...');
      await _registerPlayerIdWithServer(_currentPlayerId!);
    } else {
      // Si pas de Player ID, essayer d'en obtenir un
      await _getAndRegisterPlayerId();
    }
  }

  /// Affiche une notification locale
  Future<void> _showLocalNotification({
    required String title,
    required String body,
    Map<String, dynamic>? data,
  }) async {
    if (_localNotifications == null) {
      print('⚠️  Local notifications plugin non initialisé');
      return;
    }
    
    print('📲 Affichage notification locale: $title - $body');
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'finea_notifications',
      'Finéa Académie',
      channelDescription: 'Notifications de Finéa Académie',
      importance: Importance.max,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
      color: Color(0xFF000D64),
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
      DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title,
      body,
      platformChannelSpecifics,
      payload: data != null ? jsonEncode(data) : null,
    );
  }

  /// Gère le tap sur une notification locale
  void _onNotificationTapped(NotificationResponse response) {
    if (response.payload != null) {
      try {
        Map<String, dynamic> data = jsonDecode(response.payload!);
        _handleNotificationTap(data);
      } catch (e) {
        print('❌ Erreur lors du parsing du payload: $e');
      }
    }
  }

  /// Gère le tap sur une notification
  void _handleNotificationTap(Map<String, dynamic> data) {
    print('📲 Données de notification: $data');
    
    // Ici vous pouvez implémenter la logique de navigation
    // selon le type de notification reçue
    String? type = data['type'];
    
    switch (type) {
      case 'course':
        print('Navigation vers les cours');
        break;
      case 'contest':
        print('Navigation vers les concours');
        break;
      case 'article':
        print('Navigation vers l\'article');
        break;
      default:
        print('Navigation par défaut');
        break;
    }
  }

  /// Obtient le Player ID actuel
  String? get currentPlayerId => _currentPlayerId;

  /// Vérifie si le service est initialisé
  bool get isInitialized => _isInitialized;

  /// Supprime le Player ID du serveur lors de la déconnexion
  Future<void> unregisterPlayerId() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String? deviceId = prefs.getString(_deviceIdKey);
      
      if (deviceId != null) {
        final response = await ApiService.unregisterFCMToken(deviceId: deviceId);
        
        if (response['success'] == true) {
          print('✅ Player ID OneSignal supprimé du serveur');
        }
      }
      
      // Supprimer localement
      await prefs.remove(_tokenKey);
      _currentPlayerId = null;
    } catch (e) {
      print('❌ Erreur lors de la suppression du Player ID: $e');
    }
  }

  /// Configure les callbacks personnalisés
  void setCallbacks({
    Function(Map<String, dynamic>)? onMessageReceived,
    Function(Map<String, dynamic>)? onMessageOpenedApp,
  }) {
    this.onMessageReceived = onMessageReceived;
    this.onMessageOpenedApp = onMessageOpenedApp;
  }

  /// Nettoie les ressources
  void dispose() {
    _localNotifications = null;
    _currentPlayerId = null;
    _isInitialized = false;
  }
}
