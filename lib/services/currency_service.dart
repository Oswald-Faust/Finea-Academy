import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/currency_model.dart';

class CurrencyService {
  // API alternative gratuite qui ne nécessite pas de clé
  static const String _baseUrl = 'https://api.fxratesapi.com';
  static const String _fallbackUrl = 'https://api.exchangerate-api.com/v4';
  static const Duration _timeout = Duration(seconds: 5);
  static const Duration _cacheTimeout = Duration(minutes: 5);
  
  // Cache pour éviter les appels répétés
  static final Map<String, CurrencyConversionResponse> _conversionCache = {};
  static final Map<String, DateTime> _cacheTimestamps = {};

  /// Convertit un montant d'une devise vers une autre
  static Future<CurrencyConversionResponse> convertCurrency({
    required String from,
    required String to,
    required double amount,
  }) async {
    // Vérifier le cache d'abord
    final cacheKey = '${from.toUpperCase()}_${to.toUpperCase()}_$amount';
    if (_isConversionCached(cacheKey)) {
      print('💾 Utilisation du cache pour la conversion');
      return _conversionCache[cacheKey]!;
    }

    try {
      // Première tentative avec fxratesapi.com
      final uri = Uri.parse('$_baseUrl/latest')
          .replace(queryParameters: {
        'base': from.toUpperCase(),
        'symbols': to.toUpperCase(),
      });

      print('🌐 Appel API conversion: $uri');

      final response = await http.get(uri).timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ Réponse API conversion reçue');
        
        // Adapter la réponse au format attendu
        if (data['success'] == true && data['rates'] != null) {
          final rate = data['rates'][to.toUpperCase()];
          if (rate != null) {
            final result = amount * rate;
            
            final conversion = CurrencyConversionResponse(
              success: true,
              query: Query(from: from, to: to, amount: amount),
              info: ConversionInfo(rate: rate.toDouble()),
              date: data['date'] ?? DateTime.now().toIso8601String().split('T')[0],
              result: result,
            );
            
            // Mettre en cache
            _conversionCache[cacheKey] = conversion;
            _cacheTimestamps[cacheKey] = DateTime.now();
            
            return conversion;
          }
        }
      }
      
      // Fallback vers exchangerate-api.com
      return await _convertWithFallbackAPI(from, to, amount, cacheKey);
      
    } catch (e) {
      print('❌ Erreur lors de la conversion: $e');
      // Essayer avec l'API de fallback
      try {
        return await _convertWithFallbackAPI(from, to, amount, cacheKey);
      } catch (fallbackError) {
        print('⚠️ Toutes les APIs ont échoué, utilisation des taux par défaut');
        return _convertWithDefaultRate(from, to, amount, cacheKey);
      }
    }
  }

  /// API de fallback pour la conversion
  static Future<CurrencyConversionResponse> _convertWithFallbackAPI(
    String from, String to, double amount, String cacheKey) async {
    
    final uri = Uri.parse('$_fallbackUrl/latest/$from');
    print('🔄 Tentative avec API de fallback: $uri');
    
    final response = await http.get(uri).timeout(_timeout);
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      print('✅ Réponse API fallback reçue');
      
      final rate = data['rates'][to.toUpperCase()];
      if (rate != null) {
        final result = amount * rate;
        
        final conversion = CurrencyConversionResponse(
          success: true,
          query: Query(from: from, to: to, amount: amount),
          info: ConversionInfo(rate: rate.toDouble()),
          date: data['date'] ?? DateTime.now().toIso8601String().split('T')[0],
          result: result,
        );
        
        // Mettre en cache
        _conversionCache[cacheKey] = conversion;
        _cacheTimestamps[cacheKey] = DateTime.now();
        
        return conversion;
      }
    }
    
    throw CurrencyServiceException('API de fallback a échoué');
  }

  /// Conversion avec taux par défaut en cas d'échec des APIs
  static CurrencyConversionResponse _convertWithDefaultRate(
    String from, String to, double amount, String cacheKey) {
    
    final rate = _getDefaultRate(from, to);
    final result = amount * rate;
    
    print('📊 Utilisation du taux par défaut: $rate pour ${from.toUpperCase()}/${to.toUpperCase()}');
    
    final conversion = CurrencyConversionResponse(
      success: true,
      query: Query(from: from, to: to, amount: amount),
      info: ConversionInfo(rate: rate),
      date: DateTime.now().toIso8601String().split('T')[0],
      result: result,
    );
    
    // Mettre en cache même les taux par défaut
    _conversionCache[cacheKey] = conversion;
    _cacheTimestamps[cacheKey] = DateTime.now();
    
    return conversion;
  }

  /// Vérifie si une conversion est en cache et valide
  static bool _isConversionCached(String cacheKey) {
    if (!_conversionCache.containsKey(cacheKey) || !_cacheTimestamps.containsKey(cacheKey)) {
      return false;
    }
    
    final cacheAge = DateTime.now().difference(_cacheTimestamps[cacheKey]!);
    return cacheAge < _cacheTimeout;
  }

  /// Récupère l'historique des taux de change pour le graphique
  static Future<List<ExchangeRatePoint>> getHistoricalRates({
    required String baseCurrency,
    required String targetCurrency,
    required ChartPeriod period,
  }) async {
    try {
      // D'abord essayer de récupérer le taux actuel pour générer des données réalistes
      final currentRate = await getCurrentRate(from: baseCurrency, to: targetCurrency);
      
      print('🔄 Génération de données historiques de démonstration...');
      return _generateMockHistoricalData(
        baseCurrency: baseCurrency,
        targetCurrency: targetCurrency,
        period: period,
        currentRate: currentRate,
      );
      
    } catch (e) {
      print('❌ Erreur lors de la récupération de l\'historique: $e');
      
      // En cas d'échec, utiliser des données par défaut
      return _generateMockHistoricalData(
        baseCurrency: baseCurrency,
        targetCurrency: targetCurrency,
        period: period,
        currentRate: _getDefaultRate(baseCurrency, targetCurrency),
      );
    }
  }

  /// Génère des données historiques de démonstration réalistes
  static List<ExchangeRatePoint> _generateMockHistoricalData({
    required String baseCurrency,
    required String targetCurrency,
    required ChartPeriod period,
    required double currentRate,
  }) {
    final points = <ExchangeRatePoint>[];
    final endDate = DateTime.now();
    
    // Générer des variations réalistes autour du taux actuel
    final random = DateTime.now().millisecondsSinceEpoch % 1000; // Pseudo-aléatoire
    double rate = currentRate;
    
    for (int i = period.days; i >= 0; i--) {
      final date = endDate.subtract(Duration(days: i));
      
      // Variation aléatoire entre -2% et +2%
      final variation = (((random + i * 17) % 400) - 200) / 10000; // -0.02 à +0.02
      rate = currentRate * (1 + variation);
      
      // S'assurer que le taux reste positif et réaliste
      if (rate < 0.01) rate = 0.01;
      if (rate > currentRate * 2) rate = currentRate * 1.1;
      
      points.add(ExchangeRatePoint(date: date, rate: rate));
    }
    
    // Le dernier point doit être le taux actuel
    if (points.isNotEmpty) {
      points.last = ExchangeRatePoint(date: endDate, rate: currentRate);
    }
    
    print('✅ ${points.length} points de données de démonstration générés');
    return points;
  }

  /// Retourne un taux par défaut basé sur les paires de devises communes
  static double _getDefaultRate(String from, String to) {
    final pair = '${from.toUpperCase()}/${to.toUpperCase()}';
    
    // Taux approximatifs pour les paires courantes (devises fiat)
    switch (pair) {
      case 'EUR/USD': return 1.0852;
      case 'USD/EUR': return 0.9215;
      case 'EUR/GBP': return 0.8534;
      case 'GBP/EUR': return 1.1717;
      case 'USD/GBP': return 0.7866;
      case 'GBP/USD': return 1.2713;
      case 'EUR/JPY': return 164.25;
      case 'USD/JPY': return 151.34;
      case 'EUR/CHF': return 0.9456;
      case 'USD/CHF': return 0.8712;
      case 'EUR/CAD': return 1.4650;
      case 'USD/CAD': return 1.3500;
      case 'EUR/AUD': return 1.6200;
      case 'USD/AUD': return 1.4900;
      case 'EUR/CNY': return 7.8500;
      case 'USD/CNY': return 7.2300;
      
      // Devises exotiques
      case 'USD/AED': return 3.6725;
      case 'EUR/AED': return 3.9850;
      case 'USD/ZAR': return 18.5000;
      case 'EUR/ZAR': return 20.1000;
      case 'USD/MXN': return 17.2000;
      case 'EUR/MXN': return 18.6500;
      case 'USD/THB': return 35.8000;
      case 'EUR/THB': return 38.8500;
      case 'USD/TRY': return 30.5000;
      case 'EUR/TRY': return 33.1000;
      case 'USD/ILS': return 3.7500;
      case 'EUR/ILS': return 4.0700;
      case 'USD/EGP': return 30.9000;
      case 'EUR/EGP': return 33.5500;
      case 'USD/PHP': return 55.8000;
      case 'EUR/PHP': return 60.5000;
      case 'USD/MYR': return 4.6500;
      case 'EUR/MYR': return 5.0500;
      case 'USD/IDR': return 15500.0;
      case 'EUR/IDR': return 16800.0;
      case 'USD/VND': return 24500.0;
      case 'EUR/VND': return 26600.0;
      case 'USD/UAH': return 36.5000;
      case 'EUR/UAH': return 39.6000;
      
      // Cryptomonnaies (taux approximatifs en USD)
      case 'USD/BTC': return 0.000023;
      case 'BTC/USD': return 43000.0;
      case 'EUR/BTC': return 0.000021;
      case 'BTC/EUR': return 47000.0;
      case 'USD/ETH': return 0.00037;
      case 'ETH/USD': return 2700.0;
      case 'EUR/ETH': return 0.00034;
      case 'ETH/EUR': return 2900.0;
      case 'USD/USDT': return 1.0;
      case 'USDT/USD': return 1.0;
      case 'EUR/USDT': return 0.92;
      case 'USDT/EUR': return 1.08;
      case 'USD/USDC': return 1.0;
      case 'USDC/USD': return 1.0;
      case 'USD/BNB': return 0.0018;
      case 'BNB/USD': return 550.0;
      case 'USD/ADA': return 0.45;
      case 'ADA/USD': return 2.22;
      case 'USD/SOL': return 0.0037;
      case 'SOL/USD': return 270.0;
      case 'USD/XRP': return 0.62;
      case 'XRP/USD': return 1.61;
      case 'USD/DOT': return 0.12;
      case 'DOT/USD': return 8.33;
      case 'USD/DOGE': return 0.08;
      case 'DOGE/USD': return 12.5;
      case 'USD/AVAX': return 0.037;
      case 'AVAX/USD': return 27.0;
      case 'USD/MATIC': return 0.83;
      case 'MATIC/USD': return 1.20;
      case 'USD/LINK': return 0.045;
      case 'LINK/USD': return 22.0;
      case 'USD/UNI': return 0.12;
      case 'UNI/USD': return 8.33;
      case 'USD/LTC': return 0.0037;
      case 'LTC/USD': return 270.0;
      case 'USD/BCH': return 0.0045;
      case 'BCH/USD': return 220.0;
      case 'USD/ATOM': return 0.12;
      case 'ATOM/USD': return 8.33;
      case 'USD/FTM': return 0.45;
      case 'FTM/USD': return 2.22;
      case 'USD/NEAR': return 0.12;
      case 'NEAR/USD': return 8.33;
      case 'USD/ALGO': return 0.18;
      case 'ALGO/USD': return 5.56;
      
      // Paires inverses pour les cryptomonnaies
      case 'BTC/ETH': return 15.9;
      case 'ETH/BTC': return 0.063;
      case 'BTC/USDT': return 43000.0;
      case 'USDT/BTC': return 0.000023;
      case 'ETH/USDT': return 2700.0;
      case 'USDT/ETH': return 0.00037;
      
      default: return 1.0; // Taux par défaut
    }
  }

  /// Récupère le taux de change actuel entre deux devises
  static Future<double> getCurrentRate({
    required String from,
    required String to,
  }) async {
    try {
      final conversion = await convertCurrency(
        from: from,
        to: to,
        amount: 1.0,
      );
      
      return conversion.info.rate;
    } catch (e) {
      print('❌ Erreur lors de la récupération du taux actuel: $e');
      throw CurrencyServiceException(
        'Impossible de récupérer le taux actuel: ${e.toString()}',
      );
    }
  }

  /// Récupère les données complètes pour le graphique
  static Future<ChartData> getChartData({
    required String baseCurrency,
    required String targetCurrency,
    required ChartPeriod period,
  }) async {
    try {
      final points = await getHistoricalRates(
        baseCurrency: baseCurrency,
        targetCurrency: targetCurrency,
        period: period,
      );

      return ChartData.fromPoints(points);
    } catch (e) {
      print('❌ Erreur lors de la récupération des données du graphique: $e');
      rethrow;
    }
  }

  /// Valide si une devise est supportée par l'API
  static bool isCurrencySupported(String currencyCode) {
    return SupportedCurrencies.currencyCodes
        .contains(currencyCode.toUpperCase());
  }

}

/// Exception personnalisée pour les erreurs du service de devises
class CurrencyServiceException implements Exception {
  final String message;
  
  const CurrencyServiceException(this.message);
  
  @override
  String toString() => 'CurrencyServiceException: $message';
}

/// État de chargement pour l'UI
enum LoadingState {
  idle,
  loading,
  success,
  error,
}

/// Classe pour gérer l'état de l'application du convertisseur
class CurrencyConverterState {
  final LoadingState loadingState;
  final String? errorMessage;
  final CurrencyConversionResponse? conversionResult;
  final ChartData? chartData;
  final Currency fromCurrency;
  final Currency toCurrency;
  final double amount;
  final ChartPeriod chartPeriod;

  const CurrencyConverterState({
    this.loadingState = LoadingState.idle,
    this.errorMessage,
    this.conversionResult,
    this.chartData,
    required this.fromCurrency,
    required this.toCurrency,
    required this.amount,
    this.chartPeriod = ChartPeriod.sevenDays,
  });

  CurrencyConverterState copyWith({
    LoadingState? loadingState,
    String? errorMessage,
    CurrencyConversionResponse? conversionResult,
    ChartData? chartData,
    Currency? fromCurrency,
    Currency? toCurrency,
    double? amount,
    ChartPeriod? chartPeriod,
  }) {
    return CurrencyConverterState(
      loadingState: loadingState ?? this.loadingState,
      errorMessage: errorMessage,
      conversionResult: conversionResult ?? this.conversionResult,
      chartData: chartData ?? this.chartData,
      fromCurrency: fromCurrency ?? this.fromCurrency,
      toCurrency: toCurrency ?? this.toCurrency,
      amount: amount ?? this.amount,
      chartPeriod: chartPeriod ?? this.chartPeriod,
    );
  }

  /// Indique si une conversion est valide et peut être affichée
  bool get hasValidConversion =>
      conversionResult != null && 
      conversionResult!.success &&
      conversionResult!.result > 0;

  /// Indique si des données de graphique sont disponibles
  bool get hasChartData =>
      chartData != null && chartData!.points.isNotEmpty;

  /// Retourne le taux de change actuel formaté
  String get formattedCurrentRate {
    if (!hasValidConversion) return '';
    
    final rate = conversionResult!.info.rate;
    return '1 ${fromCurrency.code} = ${rate.toStringAsFixed(4)} ${toCurrency.code}';
  }

  /// Retourne le résultat de conversion formaté
  String get formattedConversionResult {
    if (!hasValidConversion) return '';
    
    final result = conversionResult!.result;
    return '${amount.toStringAsFixed(2)} ${fromCurrency.code} = ${result.toStringAsFixed(2)} ${toCurrency.code}';
  }
}

