import 'dart:math' as math;
import '../models/trading_data_model.dart';

class TradingApiService {
  // Pour une démo, nous utiliserons des données simulées
  // En production, vous pouvez intégrer avec OANDA, Forex.com, ou autre API
  static const Duration _cacheTimeout = Duration(seconds: 30);
  
  static final Map<String, PriceData> _priceCache = {};
  static final Map<String, DateTime> _cacheTimestamps = {};

  /// Récupère le prix actuel d'une paire de devises
  static Future<PriceData> getCurrentPrice(String symbol) async {
    // Vérifier le cache d'abord
    if (_isPriceCached(symbol)) {
      return _priceCache[symbol]!;
    }

    try {
      // Pour cette démo, nous simulons des prix réalistes
      // En production, remplacer par un vrai appel API
      final priceData = await _fetchRealTimePrice(symbol);
      
      // Mettre en cache
      _priceCache[symbol] = priceData;
      _cacheTimestamps[symbol] = DateTime.now();
      
      return priceData;
    } catch (e) {
      // Fallback avec prix simulé si API échoue
      return _generateMockPrice(symbol);
    }
  }

  /// Récupère la valeur du pip pour une paire et devise de compte
  static Future<PipValueData> getPipValue({
    required String symbol,
    required AccountCurrency accountCurrency,
    double lotSize = 1.0,
  }) async {
    try {
      final currencyPair = PopularCurrencyPairs.findBySymbol(symbol);
      if (currencyPair == null) {
        throw Exception('Paire de devises non supportée: $symbol');
      }

      double pipValue;

      // Calcul de la valeur du pip selon la paire et la devise du compte
      if (currencyPair.quoteCurrency == accountCurrency.symbol) {
        // Si la devise de quote est la même que le compte
        pipValue = lotSize * 100000 * currencyPair.pipValue;
      } else if (currencyPair.baseCurrency == accountCurrency.symbol) {
        // Si la devise de base est la même que le compte
        final currentPrice = await getCurrentPrice(symbol);
        pipValue = (lotSize * 100000 * currencyPair.pipValue) / currentPrice.midPrice;
      } else {
        // Cross currency - nécessite une conversion
        pipValue = await _calculateCrossPipValue(
          symbol,
          accountCurrency,
          lotSize,
          currencyPair,
        );
      }

      return PipValueData(
        symbol: symbol,
        accountCurrency: accountCurrency,
        pipValue: pipValue,
        lotSize: lotSize,
      );
    } catch (e) {
      // Fallback avec valeur approximative
      return _generateMockPipValue(symbol, accountCurrency, lotSize);
    }
  }

  /// Calcule la taille de lot optimale
  static Future<LotCalculationResult> calculateOptimalLotSize(
    LotCalculationInput input,
  ) async {
    try {
      // Récupérer le prix actuel
      final priceData = await getCurrentPrice(input.currencyPair);
      final entryPrice = input.customEntryPrice ?? priceData.midPrice;

      // Récupérer la valeur du pip
      final pipValueData = await getPipValue(
        symbol: input.currencyPair,
        accountCurrency: input.accountCurrency,
        lotSize: 1.0, // Standard lot
      );

      // Calculer la taille de lot optimale
      final riskAmount = input.riskAmount;
      final recommendedLotSize = riskAmount / (input.stopLossPips * pipValueData.pipValue);

      // Ajuster selon les limites de la paire
      final currencyPair = PopularCurrencyPairs.findBySymbol(input.currencyPair)!;
      final adjustedLotSize = _adjustLotSize(recommendedLotSize, currencyPair);

      // Calculer les autres métriques
      final actualRiskAmount = adjustedLotSize * input.stopLossPips * pipValueData.pipValue;
      final actualRiskPercentage = (actualRiskAmount / input.accountBalance) * 100;

      // Calculer stop loss et take profit prices
      final currencyPairData = PopularCurrencyPairs.findBySymbol(input.currencyPair)!;
      final stopLossPrice = entryPrice - (input.stopLossPips * currencyPairData.pipValue);
      final takeProfitPrice = entryPrice + (input.stopLossPips * 2 * currencyPairData.pipValue); // 1:2 RR par défaut
      
      final takeProfitPips = input.stopLossPips * 2;
      final potentialProfit = adjustedLotSize * takeProfitPips * pipValueData.pipValue;

      return LotCalculationResult(
        input: input,
        recommendedLotSize: adjustedLotSize,
        riskAmount: actualRiskAmount,
        pipValue: pipValueData.pipValue,
        entryPrice: entryPrice,
        stopLossPrice: stopLossPrice,
        takeProfitPrice: takeProfitPrice,
        potentialProfit: potentialProfit,
        actualRiskPercentage: actualRiskPercentage,
        lotSizeType: _getLotSizeType(adjustedLotSize),
        calculatedAt: DateTime.now(),
      );
    } catch (e) {
      throw Exception('Erreur lors du calcul: $e');
    }
  }

  /// Récupère les prix de plusieurs paires simultanément
  static Future<Map<String, PriceData>> getMultiplePrices(List<String> symbols) async {
    final futures = symbols.map((symbol) => getCurrentPrice(symbol));
    final results = await Future.wait(futures);
    
    return Map.fromIterables(symbols, results);
  }

  // Méthodes privées

  static bool _isPriceCached(String symbol) {
    if (!_priceCache.containsKey(symbol) || !_cacheTimestamps.containsKey(symbol)) {
      return false;
    }
    
    final cacheAge = DateTime.now().difference(_cacheTimestamps[symbol]!);
    return cacheAge < _cacheTimeout;
  }

  static Future<PriceData> _fetchRealTimePrice(String symbol) async {
    // Simulation d'appel API réel
    await Future.delayed(const Duration(milliseconds: 200));
    
    // En production, remplacer par:
    // final response = await http.get(Uri.parse('$_baseUrl/pricing?instruments=$symbol'));
    // final data = json.decode(response.body);
    // return PriceData.fromJson(data);
    
    return _generateMockPrice(symbol);
  }

  static PriceData _generateMockPrice(String symbol) {
    final random = math.Random();
    final currencyPair = PopularCurrencyPairs.findBySymbol(symbol);
    
    double basePrice;
    
    // Paires de devises majeures
    switch (symbol) {
      case 'EUR_USD':
        basePrice = 1.0850 + (random.nextDouble() - 0.5) * 0.02;
        break;
      case 'GBP_USD':
        basePrice = 1.2650 + (random.nextDouble() - 0.5) * 0.02;
        break;
      case 'USD_JPY':
        basePrice = 149.50 + (random.nextDouble() - 0.5) * 2.0;
        break;
      case 'USD_CHF':
        basePrice = 0.8950 + (random.nextDouble() - 0.5) * 0.02;
        break;
      case 'AUD_USD':
        basePrice = 0.6550 + (random.nextDouble() - 0.5) * 0.02;
        break;
      case 'USD_CAD':
        basePrice = 1.3650 + (random.nextDouble() - 0.5) * 0.02;
        break;
      case 'NZD_USD':
        basePrice = 0.5950 + (random.nextDouble() - 0.5) * 0.02;
        break;
      // Paires croisées
      case 'EUR_GBP':
        basePrice = 0.8534 + (random.nextDouble() - 0.5) * 0.01;
        break;
      case 'EUR_JPY':
        basePrice = 164.25 + (random.nextDouble() - 0.5) * 2.0;
        break;
      case 'GBP_JPY':
        basePrice = 192.50 + (random.nextDouble() - 0.5) * 3.0;
        break;
      case 'EUR_AUD':
        basePrice = 1.6200 + (random.nextDouble() - 0.5) * 0.03;
        break;
      case 'EUR_CAD':
        basePrice = 1.4650 + (random.nextDouble() - 0.5) * 0.02;
        break;
      case 'GBP_AUD':
        basePrice = 1.8900 + (random.nextDouble() - 0.5) * 0.03;
        break;
      case 'AUD_JPY':
        basePrice = 98.50 + (random.nextDouble() - 0.5) * 1.5;
        break;
      case 'CAD_JPY':
        basePrice = 109.50 + (random.nextDouble() - 0.5) * 1.5;
        break;
      case 'NZD_JPY':
        basePrice = 90.50 + (random.nextDouble() - 0.5) * 1.5;
        break;
      case 'EUR_CHF':
        basePrice = 0.9456 + (random.nextDouble() - 0.5) * 0.01;
        break;
      case 'GBP_CHF':
        basePrice = 1.1100 + (random.nextDouble() - 0.5) * 0.02;
        break;
      case 'AUD_CHF':
        basePrice = 0.5800 + (random.nextDouble() - 0.5) * 0.02;
        break;
      case 'NZD_CHF':
        basePrice = 0.5400 + (random.nextDouble() - 0.5) * 0.02;
        break;
      case 'AUD_CAD':
        basePrice = 0.8900 + (random.nextDouble() - 0.5) * 0.02;
        break;
      case 'NZD_CAD':
        basePrice = 0.8200 + (random.nextDouble() - 0.5) * 0.02;
        break;
      case 'AUD_NZD':
        basePrice = 1.0800 + (random.nextDouble() - 0.5) * 0.02;
        break;
      // Indices boursiers
      case 'US30':
        basePrice = 35000 + (random.nextDouble() - 0.5) * 500;
        break;
      case 'SPX500':
        basePrice = 4500 + (random.nextDouble() - 0.5) * 50;
        break;
      case 'NAS100':
        basePrice = 15000 + (random.nextDouble() - 0.5) * 200;
        break;
      case 'UK100':
        basePrice = 7500 + (random.nextDouble() - 0.5) * 100;
        break;
      case 'GER30':
        basePrice = 16000 + (random.nextDouble() - 0.5) * 200;
        break;
      case 'FRA40':
        basePrice = 7200 + (random.nextDouble() - 0.5) * 100;
        break;
      case 'JPN225':
        basePrice = 32000 + (random.nextDouble() - 0.5) * 500;
        break;
      case 'AUS200':
        basePrice = 7200 + (random.nextDouble() - 0.5) * 100;
        break;
      case 'CAN60':
        basePrice = 20000 + (random.nextDouble() - 0.5) * 200;
        break;
      case 'SWI20':
        basePrice = 11000 + (random.nextDouble() - 0.5) * 100;
        break;
      // Matières premières
      case 'XAUUSD':
        basePrice = 2000 + (random.nextDouble() - 0.5) * 50;
        break;
      case 'XAGUSD':
        basePrice = 25 + (random.nextDouble() - 0.5) * 2;
        break;
      case 'XAU_EUR':
        basePrice = 1850 + (random.nextDouble() - 0.5) * 40;
        break;
      case 'XAG_EUR':
        basePrice = 23 + (random.nextDouble() - 0.5) * 2;
        break;
      case 'WTIUSD':
        basePrice = 75 + (random.nextDouble() - 0.5) * 5;
        break;
      case 'BRENTUSD':
        basePrice = 80 + (random.nextDouble() - 0.5) * 5;
        break;
      case 'NATGAS':
        basePrice = 3.5 + (random.nextDouble() - 0.5) * 0.5;
        break;
      case 'COPPER':
        basePrice = 3.8 + (random.nextDouble() - 0.5) * 0.2;
        break;
      case 'PLATINUM':
        basePrice = 950 + (random.nextDouble() - 0.5) * 30;
        break;
      case 'PALLADIUM':
        basePrice = 1200 + (random.nextDouble() - 0.5) * 50;
        break;
      // Cryptomonnaies
      case 'BTCUSD':
        basePrice = 43000 + (random.nextDouble() - 0.5) * 2000;
        break;
      case 'ETHUSD':
        basePrice = 2700 + (random.nextDouble() - 0.5) * 200;
        break;
      case 'LTCUSD':
        basePrice = 70 + (random.nextDouble() - 0.5) * 10;
        break;
      case 'XRPUSD':
        basePrice = 0.62 + (random.nextDouble() - 0.5) * 0.1;
        break;
      case 'ADAUSD':
        basePrice = 0.45 + (random.nextDouble() - 0.5) * 0.05;
        break;
      case 'DOTUSD':
        basePrice = 6.5 + (random.nextDouble() - 0.5) * 1.0;
        break;
      case 'LINKUSD':
        basePrice = 14 + (random.nextDouble() - 0.5) * 2;
        break;
      case 'UNIUSD':
        basePrice = 6.5 + (random.nextDouble() - 0.5) * 1.0;
        break;
      case 'AVAXUSD':
        basePrice = 25 + (random.nextDouble() - 0.5) * 3;
        break;
      case 'SOLUSD':
        basePrice = 100 + (random.nextDouble() - 0.5) * 10;
        break;
      default:
        basePrice = 1.0000 + (random.nextDouble() - 0.5) * 0.1;
    }

    // Calculer le spread basé sur le type d'instrument
    double spread;
    if (currencyPair?.isJpyPair == true) {
      spread = 0.02;
    } else if (symbol.startsWith('XAU') || symbol.startsWith('XAG') || symbol.startsWith('XPT') || symbol.startsWith('XPD')) {
      // Métaux précieux
      spread = basePrice * 0.0005; // 0.05% du prix
    } else if (symbol.startsWith('WTI') || symbol.startsWith('BRENT') || symbol.startsWith('NATGAS') || symbol.startsWith('COPPER')) {
      // Matières premières
      spread = basePrice * 0.001; // 0.1% du prix
    } else if (symbol.startsWith('BTC') || symbol.startsWith('ETH') || symbol.startsWith('LTC') || 
               symbol.startsWith('XRP') || symbol.startsWith('ADA') || symbol.startsWith('DOT') ||
               symbol.startsWith('LINK') || symbol.startsWith('UNI') || symbol.startsWith('AVAX') || symbol.startsWith('SOL')) {
      // Cryptomonnaies
      spread = basePrice * 0.002; // 0.2% du prix
    } else if (symbol.startsWith('US30') || symbol.startsWith('SPX') || symbol.startsWith('NAS') ||
               symbol.startsWith('UK') || symbol.startsWith('GER') || symbol.startsWith('FRA') ||
               symbol.startsWith('JPN') || symbol.startsWith('AUS') || symbol.startsWith('CAN') || symbol.startsWith('SWI')) {
      // Indices
      spread = basePrice * 0.0001; // 0.01% du prix
    } else {
      spread = 0.00015; // Spread par défaut pour les devises
    }

    final bid = basePrice - spread / 2;
    final ask = basePrice + spread / 2;

    return PriceData(
      symbol: symbol,
      bid: bid,
      ask: ask,
      spread: spread,
      timestamp: DateTime.now(),
    );
  }

  static PipValueData _generateMockPipValue(
    String symbol,
    AccountCurrency accountCurrency,
    double lotSize,
  ) {
    final currencyPair = PopularCurrencyPairs.findBySymbol(symbol)!;
    
    // Valeurs approximatives pour différentes devises de compte
    double basePipValue;
    if (currencyPair.isJpyPair) {
      basePipValue = accountCurrency == AccountCurrency.USD ? 9.33 : 8.50;
    } else {
      basePipValue = accountCurrency == AccountCurrency.USD ? 10.0 : 9.20;
    }

    final adjustedPipValue = basePipValue * lotSize;

    return PipValueData(
      symbol: symbol,
      accountCurrency: accountCurrency,
      pipValue: adjustedPipValue,
      lotSize: lotSize,
    );
  }

  static Future<double> _calculateCrossPipValue(
    String symbol,
    AccountCurrency accountCurrency,
    double lotSize,
    CurrencyPair currencyPair,
  ) async {
    // Logique simplifiée pour les cross currencies
    // En production, vous devrez récupérer les taux de change appropriés
    
    // Par exemple, pour EUR/GBP avec compte USD:
    // 1. Convertir EUR vers USD
    // 2. Appliquer la valeur du pip
    
    return 10.0 * lotSize; // Valeur approximative
  }

  static double _adjustLotSize(double recommendedLotSize, CurrencyPair currencyPair) {
    // Ajuster selon les limites min/max et step
    double adjusted = recommendedLotSize;
    
    // Minimum
    if (adjusted < currencyPair.minLotSize) {
      adjusted = currencyPair.minLotSize;
    }
    
    // Maximum
    if (adjusted > currencyPair.maxLotSize) {
      adjusted = currencyPair.maxLotSize;
    }
    
    // Arrondir selon le step
    adjusted = (adjusted / currencyPair.lotStep).round() * currencyPair.lotStep;
    
    return adjusted;
  }

  static String _getLotSizeType(double lotSize) {
    if (lotSize >= 1.0) {
      return 'Standard';
    } else if (lotSize >= 0.1) {
      return 'Mini';
    } else {
      return 'Micro';
    }
  }

  /// Méthodes utilitaires pour la simulation
  static Future<void> startPriceSimulation() async {
    // Simuler des mises à jour de prix en temps réel
    const symbols = ['EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'AUD_USD'];
    
    // Mettre à jour les prix toutes les 5 secondes
    Stream.periodic(const Duration(seconds: 5)).listen((_) {
      for (final symbol in symbols) {
        _priceCache.remove(symbol);
        _cacheTimestamps.remove(symbol);
      }
    });
  }

  /// Nettoyage du cache
  static void clearCache() {
    _priceCache.clear();
    _cacheTimestamps.clear();
  }
}
