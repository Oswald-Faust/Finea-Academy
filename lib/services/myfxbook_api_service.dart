import 'dart:convert';
import 'package:http/http.dart' as http;

class MyfxbookApiService {
  static const String _baseUrl = 'https://www.myfxbook.com/api';
  static String? _sessionId;
  
  // Identifiants Myfxbook
  static const String _email = 'finea.academie@gmail.com';
  static const String _password = 'FINEA2025!';
  
  /// Authentification avec Myfxbook
  static Future<bool> authenticate() async {
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
          return true;
        } else {
          print('Erreur d\'authentification: ${data['message']}');
          return false;
        }
      }
      return false;
    } catch (e) {
      print('Erreur lors de l\'authentification Myfxbook: $e');
      return false;
    }
  }
  
  /// Récupérer les données du portfolio
  static Future<Map<String, dynamic>?> getPortfolioData(String portfolioId) async {
    if (_sessionId == null) {
      final authSuccess = await authenticate();
      if (!authSuccess) return null;
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
      if (!authSuccess) return null;
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
