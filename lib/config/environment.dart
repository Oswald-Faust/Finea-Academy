import 'package:flutter/foundation.dart';

class Environment {
  // Variables d'environnement
  static const bool isProduction = bool.fromEnvironment('PRODUCTION', defaultValue: false);
  static const bool isStaging = bool.fromEnvironment('STAGING', defaultValue: false);
  static const String environment = String.fromEnvironment('ENV', defaultValue: 'development');
  
  // URLs des APIs selon l'environnement
  static const Map<String, String> apiUrls = {
    'production': 'https://finea-academy-1.onrender.com/api',
    'staging': 'https://finea-academy-staging.onrender.com/api',
    'development': 'http://192.168.1.230:5001/api', // IP locale
    'development_web': 'http://localhost:5001/api', // Pour Flutter Web
  };
  
  // Configuration de base selon l'environnement
  static String get baseUrl {
    if (isProduction) {
      return apiUrls['production']!;
    } else if (isStaging) {
      return apiUrls['staging']!;
    } else {
      // Développement
      if (kIsWeb) {
        return apiUrls['development_web']!;
      } else {
        return apiUrls['development']!;
      }
    }
  }
  
  // Configuration pour les différents services
  static String get newsApiUrl => '$baseUrl/news';
  static String get contestsApiUrl => '$baseUrl/contests';
  static String get usersApiUrl => '$baseUrl/users';
  static String get notificationsApiUrl => '$baseUrl/notifications';
  
  // Debug info
  static void printEnvironmentInfo() {
    if (kDebugMode) {
      print('🔧 Environment Configuration:');
      print('   - Environment: $environment');
      print('   - Is Production: $isProduction');
      print('   - Is Staging: $isStaging');
      print('   - Is Web: $kIsWeb');
      print('   - Base URL: $baseUrl');
    }
  }
  
  // Validation de l'environnement
  static bool get isValidEnvironment {
    return isProduction || isStaging || environment == 'development';
  }
}
