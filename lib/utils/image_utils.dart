import 'dart:io';
import 'package:flutter/foundation.dart';
import '../config/api_config.dart';

class ImageUtils {
  // Utilise la configuration centralisée
  static String get _apiBaseUrl => ApiConfig.baseUrl;

  /// Convertit une URL d'image en URL complète
  static String getImageUrl(String? imageUrl) {
    if (imageUrl == null || imageUrl.isEmpty) {
      return 'assets/images/Bourse 1 .jpg'; // Image par défaut
    }
    
    if (imageUrl.startsWith('http')) {
      return imageUrl; // URL complète déjà
    } else if (imageUrl.startsWith('/uploads/')) {
      return '$_apiBaseUrl$imageUrl'; // URL relative vers l'API
    } else {
      return imageUrl; // Asset local
    }
  }

  /// Vérifie si l'URL est une image réseau
  static bool isNetworkImage(String imageUrl) {
    return imageUrl.startsWith('http') || imageUrl.startsWith('/uploads/');
  }

  /// Vérifie si l'URL est un asset local
  static bool isAssetImage(String imageUrl) {
    return !isNetworkImage(imageUrl);
  }

  /// Retourne l'image par défaut
  static String getDefaultImage() {
    return 'assets/images/Bourse 1 .jpg';
  }

  /// Retourne le logo par défaut
  static String getDefaultLogo() {
    return 'assets/images/logo_finea.png';
  }
} 