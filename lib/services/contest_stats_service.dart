import 'api_service.dart';
import 'package:flutter/foundation.dart';

class ContestStatsService {
  static final ContestStatsService _instance = ContestStatsService._internal();
  factory ContestStatsService() => _instance;
  ContestStatsService._internal();

  final ApiService _apiService = ApiService();

  // Modèle pour les statistiques des gagnants
  static Map<String, dynamic>? _cachedStats;
  static DateTime? _lastFetch;
  static const Duration _cacheExpiration = Duration(minutes: 5);

  /// Récupérer les statistiques des gagnants
  Future<ContestStats?> getContestStats({bool forceRefresh = false}) async {
    try {
      // Vérifier le cache
      if (!forceRefresh && 
          _cachedStats != null && 
          _lastFetch != null &&
          DateTime.now().difference(_lastFetch!) < _cacheExpiration) {
        return ContestStats.fromJson(_cachedStats!);
      }

      final response = await _apiService.getContestDisplayStats();
      
      if (response.success && response.data != null) {
        _cachedStats = response.data;
        _lastFetch = DateTime.now();
        
        return ContestStats.fromJson(response.data!);
      } else {
        if (kDebugMode) {
          print('Erreur lors de la récupération des statistiques: ${response.error}');
        }
        return null;
      }
    } catch (e) {
      if (kDebugMode) {
        print('Erreur ContestStatsService: $e');
      }
      return null;
    }
  }

  /// Vider le cache
  static void clearCache() {
    _cachedStats = null;
    _lastFetch = null;
  }
}

/// Modèle pour les statistiques des concours
class ContestStats {
  final int totalGains;
  final int totalPlacesSold;
  final int totalWinners;
  final List<ContestWinner> recentWinners;

  ContestStats({
    required this.totalGains,
    required this.totalPlacesSold,
    required this.totalWinners,
    required this.recentWinners,
  });

  factory ContestStats.fromJson(Map<String, dynamic> json) {
    return ContestStats(
      totalGains: json['totalGains'] ?? 0,
      totalPlacesSold: json['totalPlacesSold'] ?? 0,
      totalWinners: json['totalWinners'] ?? 0,
      recentWinners: (json['recentWinners'] as List<dynamic>?)
          ?.map((winner) => ContestWinner.fromJson(winner))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalGains': totalGains,
      'totalPlacesSold': totalPlacesSold,
      'totalWinners': totalWinners,
      'recentWinners': recentWinners.map((winner) => winner.toJson()).toList(),
    };
  }
}

/// Modèle pour un gagnant de concours
class ContestWinner {
  final String contestTitle;
  final DateTime drawDate;
  final String firstName;
  final String lastName;
  final String prize;
  final double amount;

  ContestWinner({
    required this.contestTitle,
    required this.drawDate,
    required this.firstName,
    required this.lastName,
    required this.prize,
    required this.amount,
  });

  factory ContestWinner.fromJson(Map<String, dynamic> json) {
    return ContestWinner(
      contestTitle: json['contestTitle'] ?? '',
      drawDate: DateTime.parse(json['drawDate']),
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      prize: json['prize'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'contestTitle': contestTitle,
      'drawDate': drawDate.toIso8601String(),
      'firstName': firstName,
      'lastName': lastName,
      'prize': prize,
      'amount': amount,
    };
  }

  /// Nom complet du gagnant
  String get fullName => '$firstName $lastName'.trim();

  /// Montant formaté
  String get formattedAmount => '${amount.toStringAsFixed(0)}€';

  /// Date formatée
  String get formattedDate {
    final now = DateTime.now();
    final difference = now.difference(drawDate);
    
    if (difference.inDays == 0) {
      return 'Aujourd\'hui';
    } else if (difference.inDays == 1) {
      return 'Hier';
    } else if (difference.inDays < 7) {
      return 'Il y a ${difference.inDays} jours';
    } else {
      return '${drawDate.day}/${drawDate.month}/${drawDate.year}';
    }
  }
}
