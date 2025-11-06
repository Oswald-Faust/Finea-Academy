import 'dart:async';
import 'package:http/http.dart' as http;
import '../models/positioning_alert_model.dart';

class GoogleSheetsService {
  // URL du Google Sheet (format CSV pour récupération publique)
  static const String _sheetUrl = 'https://docs.google.com/spreadsheets/d/1tzoZCaVbpRLE5N12VdB_inyfH0fWzRY6DMEm8oL7KOs/export?format=csv&gid=0';
  
  // Cache pour éviter les requêtes trop fréquentes
  static List<PositioningAlert> _cachedAlerts = [];
  static DateTime? _lastFetch;
  static const Duration _cacheValidity = Duration(minutes: 1); // Cache valide 1 minute

  /// Récupère les alertes de positionnement depuis le Google Sheet
  static Future<List<PositioningAlert>> getPositioningAlerts({bool forceRefresh = false}) async {
    try {
      // Vérifier le cache si pas de refresh forcé
      if (!forceRefresh && 
          _cachedAlerts.isNotEmpty && 
          _lastFetch != null && 
          DateTime.now().difference(_lastFetch!) < _cacheValidity) {
        print('📦 Utilisation du cache (${_cachedAlerts.length} alertes)');
        return _cachedAlerts;
      }

      print('🌐 Récupération des alertes depuis Google Sheets...');
      
      // Récupérer les données du Google Sheet avec timeout
      final response = await http.get(
        Uri.parse(_sheetUrl),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      ).timeout(const Duration(seconds: 10)); // Timeout de 10 secondes

      if (response.statusCode == 200) {
        final csvData = response.body;
        
        if (csvData.isEmpty) {
          print('⚠️ Réponse CSV vide');
          // Retourner le cache si disponible, sinon liste vide
          return _cachedAlerts.isNotEmpty ? _cachedAlerts : [];
        }
        
        final alerts = _parseCsvData(csvData);
        
        // Mettre à jour le cache
        _cachedAlerts = alerts;
        _lastFetch = DateTime.now();
        
        print('✅ ${alerts.length} alertes récupérées et mises en cache');
        return alerts;
      } else {
        print('❌ Erreur HTTP: ${response.statusCode}');
        // Retourner le cache en cas d'erreur HTTP
        if (_cachedAlerts.isNotEmpty) {
          print('📦 Utilisation du cache en cas d\'erreur HTTP');
          return _cachedAlerts;
        }
        throw Exception('Erreur HTTP ${response.statusCode}');
      }
    } on TimeoutException catch (e) {
      print('⏱️ Timeout lors de la récupération des alertes: $e');
      // Retourner le cache en cas de timeout
      if (_cachedAlerts.isNotEmpty) {
        print('📦 Utilisation du cache en cas de timeout');
        return _cachedAlerts;
      }
      throw Exception('Le chargement a pris trop de temps');
    } catch (e) {
      print('❌ Erreur GoogleSheetsService: $e');
      // Retourner le cache en cas d'erreur, ou liste vide si pas de cache
      if (_cachedAlerts.isNotEmpty) {
        print('📦 Utilisation du cache en cas d\'erreur');
        return _cachedAlerts;
      }
      rethrow; // Relancer l'erreur pour que l'écran puisse l'afficher
    }
  }

  /// Parse les données CSV du Google Sheet
  static List<PositioningAlert> _parseCsvData(String csvData) {
    final lines = csvData.split('\n');
    final alerts = <PositioningAlert>[];

    // Ignorer la première ligne (en-têtes) et les lignes vides
    for (int i = 1; i < lines.length; i++) {
      final line = lines[i].trim();
      if (line.isEmpty) continue;

      try {
        final row = _parseCsvLine(line);
        if (row.length >= 7) { // Vérifier qu'on a au moins 7 colonnes
          final alert = PositioningAlert.fromGoogleSheetsRow(row);
          if (alert.id.isNotEmpty) { // Seulement les alertes avec un ID valide
            alerts.add(alert);
          }
        }
      } catch (e) {
        print('Erreur parsing ligne $i: $e');
        continue;
      }
    }

    // Trier par timestamp décroissant (plus récent en premier)
    alerts.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    
    return alerts;
  }

  /// Parse une ligne CSV en tenant compte des guillemets et virgules
  static List<String> _parseCsvLine(String line) {
    final result = <String>[];
    final chars = line.split('');
    String current = '';
    bool inQuotes = false;

    for (int i = 0; i < chars.length; i++) {
      final char = chars[i];
      
      if (char == '"') {
        inQuotes = !inQuotes;
      } else if (char == ',' && !inQuotes) {
        result.add(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.add(current.trim());
    return result;
  }

  /// Récupère uniquement les positions ouvertes (SELL)
  static Future<List<PositioningAlert>> getOpenPositions() async {
    final allAlerts = await getPositioningAlerts();
    return allAlerts.where((alert) => alert.isOpenPosition).toList();
  }

  /// Récupère les mises à jour récentes (INFO)
  static Future<List<PositioningAlert>> getRecentUpdates({int hours = 24}) async {
    final allAlerts = await getPositioningAlerts();
    final cutoffTime = DateTime.now().subtract(Duration(hours: hours));
    
    return allAlerts.where((alert) => 
      alert.isInfoUpdate && 
      alert.timestamp.isAfter(cutoffTime)
    ).toList();
  }

  /// Récupère les positions fermées récemment
  static Future<List<PositioningAlert>> getRecentClosedPositions({int hours = 24}) async {
    final allAlerts = await getPositioningAlerts();
    final cutoffTime = DateTime.now().subtract(Duration(hours: hours));
    
    return allAlerts.where((alert) => 
      alert.isClosedPosition && 
      alert.timestamp.isAfter(cutoffTime)
    ).toList();
  }

  /// Force la mise à jour du cache
  static Future<void> refreshCache() async {
    await getPositioningAlerts(forceRefresh: true);
  }

  /// Vérifie si le cache est valide
  static bool get isCacheValid {
    return _lastFetch != null && 
           DateTime.now().difference(_lastFetch!) < _cacheValidity;
  }

  /// Vide le cache
  static void clearCache() {
    _cachedAlerts.clear();
    _lastFetch = null;
  }
}
