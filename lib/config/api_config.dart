import 'dart:io';
import 'package:flutter/foundation.dart';

/// Configuration centralisée des URLs API
class ApiConfig {
  // ⚠️ CONFIGURATION POUR LE DÉVELOPPEMENT
  // Pour tester sur un appareil physique, remplacez cette IP par celle de votre Mac
  // Trouvez votre IP avec : ifconfig | grep "inet " | grep -v 127.0.0.1
  static const String _localDevMachineIP = '192.168.100.21'; // IP de votre Mac
  
  // Configuration intelligente de l'URL selon la plateforme
  static String get baseUrl {
    if (kDebugMode) {
      // En mode développement, on détecte si on est sur un émulateur Android
      if (Platform.isAndroid) {
        // 10.0.2.2 est l'adresse IP spéciale de l'émulateur Android pour accéder au PC hôte
        return 'http://10.0.2.2:5001';
      } else if (Platform.isIOS) {
        // Pour iOS, on doit différencier simulateur et appareil physique
        // Sur simulateur : localhost fonctionne
        // Sur appareil physique : utiliser l'IP locale du Mac
        // Note: Platform.isIOS est true pour les deux, donc on utilise l'IP locale
        // qui fonctionne dans les deux cas (simulateur et appareil physique)
        return 'http://$_localDevMachineIP:5001';
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
