import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/economic_event.dart';
import '../models/news_article.dart';

class EconomicCalendarService {
  final String baseUrl = ApiConfig.apiUrl;

  /// Récupère tous les événements du calendrier économique
  /// [date] - Date au format YYYY-MM-DD (optionnel)
  Future<List<EconomicEvent>> getCalendarEvents({String? date}) async {
    try {
      String url = '$baseUrl/forex-factory/calendar';
      if (date != null && date.isNotEmpty) {
        url += '?date=$date';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: ApiConfig.defaultHeaders,
      ).timeout(ApiConfig.connectTimeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List<dynamic> eventsJson = data['data'] ?? [];
          return eventsJson.map((e) => EconomicEvent.fromJson(e)).toList();
        } else {
          throw Exception(data['message'] ?? 'Erreur lors de la récupération des événements');
        }
      } else {
        throw Exception('Erreur serveur: ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur dans getCalendarEvents: $e');
      throw Exception('Impossible de récupérer les événements: $e');
    }
  }

  /// Récupère le calendrier de la semaine groupé par jour
  Future<Map<String, List<EconomicEvent>>> getWeeklyCalendar() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/forex-factory/weekly'),
        headers: ApiConfig.defaultHeaders,
      ).timeout(ApiConfig.connectTimeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final Map<String, dynamic> groupedData = data['data'] ?? {};
          final Map<String, List<EconomicEvent>> result = {};

          groupedData.forEach((date, events) {
            result[date] = (events as List)
                .map((e) => EconomicEvent.fromJson(e))
                .toList();
          });

          return result;
        } else {
          throw Exception(data['message'] ?? 'Erreur lors de la récupération du calendrier');
        }
      } else {
        throw Exception('Erreur serveur: ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur dans getWeeklyCalendar: $e');
      throw Exception('Impossible de récupérer le calendrier hebdomadaire: $e');
    }
  }

  /// Récupère uniquement les événements à fort impact
  Future<List<EconomicEvent>> getHighImpactEvents() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/forex-factory/high-impact'),
        headers: ApiConfig.defaultHeaders,
      ).timeout(ApiConfig.connectTimeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List<dynamic> eventsJson = data['data'] ?? [];
          return eventsJson.map((e) => EconomicEvent.fromJson(e)).toList();
        } else {
          throw Exception(data['message'] ?? 'Erreur lors de la récupération des événements');
        }
      } else {
        throw Exception('Erreur serveur: ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur dans getHighImpactEvents: $e');
      throw Exception('Impossible de récupérer les événements à fort impact: $e');
    }
  }

  /// Récupère les événements filtrés par devise
  /// [currency] - Code de la devise (USD, EUR, GBP, etc.)
  Future<List<EconomicEvent>> getEventsByCurrency(String currency) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/forex-factory/currency/$currency'),
        headers: ApiConfig.defaultHeaders,
      ).timeout(ApiConfig.connectTimeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List<dynamic> eventsJson = data['data'] ?? [];
          return eventsJson.map((e) => EconomicEvent.fromJson(e)).toList();
        } else {
          throw Exception(data['message'] ?? 'Erreur lors de la récupération des événements');
        }
      } else {
        throw Exception('Erreur serveur: ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur dans getEventsByCurrency: $e');
      throw Exception('Impossible de récupérer les événements pour $currency: $e');
    }
  }

  /// Récupère un résumé des événements du jour
  Future<EconomicCalendarSummary> getTodaySummary() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/forex-factory/summary'),
        headers: ApiConfig.defaultHeaders,
      ).timeout(ApiConfig.connectTimeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return EconomicCalendarSummary.fromJson(data['data']);
        } else {
          throw Exception(data['message'] ?? 'Erreur lors de la récupération du résumé');
        }
      } else {
        throw Exception('Erreur serveur: ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur dans getTodaySummary: $e');
      throw Exception('Impossible de récupérer le résumé: $e');
    }
  }

  /// Récupère les news avec leurs détails depuis ForexFactory
  Future<List<NewsArticle>> getNews() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/forex-factory/news'),
        headers: ApiConfig.defaultHeaders,
      ).timeout(ApiConfig.connectTimeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List<dynamic> newsJson = data['data'] ?? [];
          return newsJson.map((e) => NewsArticle.fromJson(e)).toList();
        } else {
          throw Exception(data['message'] ?? 'Erreur lors de la récupération des news');
        }
      } else {
        throw Exception('Erreur serveur: ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur dans getNews: $e');
      throw Exception('Impossible de récupérer les news: $e');
    }
  }
}

