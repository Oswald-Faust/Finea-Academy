import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import '../models/contest_model.dart';
import 'auth_service.dart';
import '../config/api_config.dart';

class ContestService {
  // Utilise la configuration centralisée
  static String get baseUrl => ApiConfig.apiUrl;
  
  // Obtenir le concours hebdomadaire actuel
  static Future<Contest?> getCurrentWeeklyContest() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/contests/weekly/current'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] && data['data'] != null) {
          return Contest.fromJson(data['data']);
        }
      }
      return null;
    } catch (e) {
      print('Erreur lors de la récupération du concours: $e');
      return null;
    }
  }

  // Participer au concours hebdomadaire
  static Future<bool> participateInWeeklyContest() async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        throw Exception('Utilisateur non connecté');
      }

      final response = await http.post(
        Uri.parse('$baseUrl/contests/weekly/participate'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['success'] ?? false;
      }
      return false;
    } catch (e) {
      print('Erreur lors de la participation: $e');
      return false;
    }
  }

  // Vérifier si l'utilisateur participe au concours hebdomadaire
  static Future<bool> isUserParticipating(String contestId) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return false;
      }

      final response = await http.get(
        Uri.parse('$baseUrl/contests/weekly/participation'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] && data['data'] != null) {
          return data['data']['isParticipating'] ?? false;
        }
      }
      return false;
    } catch (e) {
      print('Erreur lors de la vérification de participation: $e');
      return false;
    }
  }

  // Obtenir les statistiques du concours
  static Future<Map<String, dynamic>?> getContestStats() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/contests/weekly/stats'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] && data['data'] != null) {
          return data['data'];
        }
      }
      return null;
    } catch (e) {
      print('Erreur lors de la récupération des statistiques: $e');
      return null;
    }
  }

  // Récupérer les gagnants du concours actuel (toujours affiché)
  static Future<Map<String, dynamic>?> getCurrentContestWinners() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/contests/weekly/current'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] && data['data'] != null) {
          final contest = Contest.fromJson(data['data']);
          
          if (contest.winners.isNotEmpty) {
            // Retourner tous les gagnants avec leurs accès MT5
            return {
              'hasWinners': true,
              'contestTitle': contest.title,
              'winners': contest.winners.map((winner) => {
                'position': winner.position,
                'prize': winner.prize,
                'selectedAt': winner.selectedAt,
                'mt5Access': {
                  'login': 'MT5_${winner.position}_${contest.weekNumber}',
                  'password': 'Pass_${winner.position}_${contest.weekNumber}',
                  'server': 'Finéa_Académie_${contest.weekNumber}',
                },
              }).toList(),
              'drawDate': contest.drawDate.toIso8601String(),
              'weekNumber': contest.weekNumber,
            };
          } else {
            // Pas encore de gagnants - afficher la carte quand même
            return {
              'hasWinners': false,
              'contestTitle': contest.title,
              'drawDate': contest.drawDate.toIso8601String(),
              'nextDrawDate': contest.drawDate.toIso8601String(),
              'weekNumber': contest.weekNumber,
            };
          }
        }
      }
      return null;
    } catch (e) {
      print('Erreur lors de la récupération des gagnants: $e');
      return null;
    }
  }

  // Vérifier si l'utilisateur connecté a gagné
  static Future<bool> checkIfUserWon() async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return false;
      }

      final response = await http.get(
        Uri.parse('$baseUrl/contests/weekly/current'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] && data['data'] != null) {
          final contest = Contest.fromJson(data['data']);
          
          // Ici, vous devrez implémenter la logique pour vérifier si l'utilisateur actuel
          // est dans la liste des gagnants en comparant les IDs
          // Pour l'instant, on retourne false
          return false;
        }
      }
      return false;
    } catch (e) {
      print('Erreur lors de la vérification des gains: $e');
      return false;
    }
  }
}
