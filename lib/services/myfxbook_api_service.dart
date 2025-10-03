import 'dart:convert';
import 'package:http/http.dart' as http;

class MyfxbookApiService {
  static const String _baseUrl = 'https://www.myfxbook.com/api';
  static String? _sessionId;
  static DateTime? _lastAuthAttempt;
  static bool _isAuthenticating = false;
  
  // Identifiants Myfxbook
  static const String _email = 'finea.academie@gmail.com';
  static const String _password = 'FINEA2025!';
  
  /// Authentification avec Myfxbook
  static Future<bool> authenticate() async {
    // Éviter les tentatives multiples simultanées
    if (_isAuthenticating) {
      print('Authentification déjà en cours...');
      return false;
    }
    
    // Éviter les tentatives trop fréquentes (attendre 5 minutes entre les tentatives)
    if (_lastAuthAttempt != null) {
      final timeSinceLastAttempt = DateTime.now().difference(_lastAuthAttempt!);
      if (timeSinceLastAttempt.inMinutes < 5) {
        print('Tentative d\'authentification trop récente, attendez ${5 - timeSinceLastAttempt.inMinutes} minutes');
        return false;
      }
    }
    
    _isAuthenticating = true;
    _lastAuthAttempt = DateTime.now();
    
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/login.json'),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: {
          'email': _email,
          'password': _password,
        },
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['error'] == false) {
          _sessionId = data['session'];
          print('Authentification Myfxbook réussie');
          _isAuthenticating = false;
          return true;
        } else {
          print('Erreur d\'authentification: ${data['message']}');
          _isAuthenticating = false;
          return false;
        }
      }
      _isAuthenticating = false;
      return false;
    } catch (e) {
      print('Erreur lors de l\'authentification Myfxbook: $e');
      _isAuthenticating = false;
      return false;
    }
  }
  
  /// Récupérer les données du portfolio
  static Future<Map<String, dynamic>?> getPortfolioData(String portfolioId) async {
    if (_sessionId == null) {
      final authSuccess = await authenticate();
      if (!authSuccess) {
        print('Impossible de s\'authentifier, utilisation des données de test');
        return null;
      }
    }
    
    try {
      // Essayer d'abord avec get-data-daily
      var response = await http.get(
        Uri.parse('$_baseUrl/get-data-daily.json?session=$_sessionId&id=$portfolioId&start=2024-01-01&end=2025-12-31'),
      );
      
      print('Réponse get-data-daily: ${response.statusCode}');
      print('Body: ${response.body}');
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['error'] == false) {
          return data;
        } else {
          print('Erreur get-data-daily: ${data['message']}');
          
          // Essayer avec get-data
          response = await http.get(
            Uri.parse('$_baseUrl/get-data.json?session=$_sessionId&id=$portfolioId'),
          );
          
          print('Réponse get-data: ${response.statusCode}');
          print('Body: ${response.body}');
          
          if (response.statusCode == 200) {
            final data2 = json.decode(response.body);
            if (data2['error'] == false) {
              return data2;
            }
          }
        }
      }
      return null;
    } catch (e) {
      print('Erreur lors de la récupération des données du portfolio: $e');
      return null;
    }
  }
  
  /// Récupérer les informations générales du portfolio
  static Future<Map<String, dynamic>?> getPortfolioInfo(String portfolioId) async {
    if (_sessionId == null) {
      final authSuccess = await authenticate();
      if (!authSuccess) {
        print('Impossible de s\'authentifier, utilisation des données de test');
        return null;
      }
    }
    
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/get-my-accounts.json?session=$_sessionId'),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['error'] == false) {
          // Chercher le portfolio spécifique
          final accounts = data['accounts'] as List;
          for (var account in accounts) {
            if (account['id'].toString() == portfolioId) {
              return account;
            }
          }
        }
      }
      return null;
    } catch (e) {
      print('Erreur lors de la récupération des informations du portfolio: $e');
      return null;
    }
  }
  
  /// Réinitialiser la session (en cas d'erreur)
  static void resetSession() {
    _sessionId = null;
    _isAuthenticating = false;
    print('Session Myfxbook réinitialisée');
  }
  
  /// Déconnexion
  static Future<void> logout() async {
    if (_sessionId != null) {
      try {
        await http.get(
          Uri.parse('$_baseUrl/logout.json?session=$_sessionId'),
        );
        _sessionId = null;
        print('Déconnexion Myfxbook réussie');
      } catch (e) {
        print('Erreur lors de la déconnexion: $e');
      }
    }
  }
}
