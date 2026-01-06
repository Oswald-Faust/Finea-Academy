import 'dart:io';
import 'package:flutter/foundation.dart';

/// Configuration centralisée des URLs API
class ApiConfig {
  // ⚠️ CONFIGURATION POUR LE DÉVELOPPEMENT
  // Pour tester sur un appareil physique, remplacez cette IP par celle de votre Mac
  // Trouvez votre IP avec : ifconfig | grep "inet " | grep -v 127.0.0.1
  static const String _localDevMachineIP = '10.226.168.47'; // IP de votre Mac
// IP de votre Mac
  
  // Configuration intelligente de l'URL selon la plateforme
  static String get baseUrl {
    // 🚀 URL DE PRODUCTION (VPS HOSTINGER)
    const String productionUrl = 'https://finea-api.cloud';

    // ⚠️ Si vous voulez tester la connexion au VPS même en mode debug,
    // décommentez la ligne suivante :
    return productionUrl;

    /*
    if (kDebugMode) {
      // En mode développement, on détecte si on est sur un émulateur Android
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:5001';
      } else if (Platform.isIOS) {
        return 'http://$_localDevMachineIP:5001';
      } else {
        return 'http://localhost:5001';
      }
    } else {
      return productionUrl;
    }
    */
  }

  /// URL complète de l'API
  static String get apiUrl => '$baseUrl/api';

  /// URL pour les uploads d'images
  static String get uploadsUrl => '$baseUrl/uploads';

  /// URL pour les assets statiques
  static String get assetsUrl => '$baseUrl/assets';

  /// Configuration des timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  /// Headers par défaut
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  /// Configuration CORS
  static const bool allowCredentials = true;
}
