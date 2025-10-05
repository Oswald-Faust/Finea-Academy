import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/environment.dart';

class NewsApiService {
  // Configuration automatique selon l'environnement
  static String get baseUrl => Environment.baseUrl;
  
  // Récupérer la dernière actualité publiée
  static Future<Map<String, dynamic>?> getLatestNews() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/news/latest'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['data'];
        }
      } else if (response.statusCode == 404) {
        // Aucune actualité trouvée
        return null;
      }
      
      print('Erreur lors de la récupération de l\'actualité: ${response.statusCode}');
      return null;
    } catch (e) {
      print('Erreur API actualités: $e');
      return null;
    }
  }

  // Récupérer l'actualité de la semaine actuelle
  static Future<Map<String, dynamic>?> getCurrentWeekNews() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/news/current-week'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['data'];
        }
      } else if (response.statusCode == 404) {
        // Aucune actualité trouvée
        return null;
      }
      
      print('Erreur lors de la récupération de l\'actualité de la semaine: ${response.statusCode}');
      return null;
    } catch (e) {
      print('Erreur API actualités: $e');
      return null;
    }
  }

  // Récupérer toutes les actualités
  static Future<List<Map<String, dynamic>>> getAllNews({
    int page = 1,
    int limit = 10,
    String? status,
  }) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };
      
      if (status != null) {
        queryParams['status'] = status;
      }

      final uri = Uri.parse('$baseUrl/news').replace(
        queryParameters: queryParams,
      );

      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return List<Map<String, dynamic>>.from(data['data']['news']);
        }
      }
      
      print('Erreur lors de la récupération des actualités: ${response.statusCode}');
      return [];
    } catch (e) {
      print('Erreur API actualités: $e');
      return [];
    }
  }

  // Récupérer une actualité par ID
  static Future<Map<String, dynamic>?> getNewsById(String id) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/news/$id'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['data'];
        }
      } else if (response.statusCode == 404) {
        return null;
      }
      
      print('Erreur lors de la récupération de l\'actualité: ${response.statusCode}');
      return null;
    } catch (e) {
      print('Erreur API actualités: $e');
      return null;
    }
  }
}
