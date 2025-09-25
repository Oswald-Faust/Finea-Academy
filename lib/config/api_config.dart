import 'dart:io';
import 'package:flutter/foundation.dart';

/// Configuration centralisée des URLs API
class ApiConfig {
  // Configuration intelligente de l'URL selon la plateforme
  static String get baseUrl {
    if (kDebugMode) {
      // En mode développement, on détecte si on est sur un émulateur Android
      if (Platform.isAndroid) {
        // 10.0.2.2 est l'adresse IP spéciale de l'émulateur Android pour accéder au PC hôte
        return 'http://10.0.2.2:5001';
      } else if (Platform.isIOS) {
        // Pour l'émulateur iOS, localhost fonctionne
        return 'http://localhost:5001';
      } else {
        // Pour desktop (Windows, macOS, Linux)
        return 'http://localhost:5001';
      }
    } else {
      // En production, utiliser l'URL de production
      return 'https://finea-academy-1.onrender.com';
    }
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
