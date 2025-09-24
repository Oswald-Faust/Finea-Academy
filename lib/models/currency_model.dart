import 'package:json_annotation/json_annotation.dart';

part 'currency_model.g.dart';

/// Modèle représentant une devise
@JsonSerializable()
class Currency {
  final String code;
  final String name;
  final String symbol;

  const Currency({
    required this.code,
    required this.name,
    required this.symbol,
  });

  factory Currency.fromJson(Map<String, dynamic> json) => _$CurrencyFromJson(json);
  Map<String, dynamic> toJson() => _$CurrencyToJson(this);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Currency && runtimeType == other.runtimeType && code == other.code;

  @override
  int get hashCode => code.hashCode;
}

/// Modèle pour la réponse de conversion de l'API
@JsonSerializable()
class CurrencyConversionResponse {
  final bool success;
  final Query query;
  final ConversionInfo info;
  final String date;
  final double result;

  const CurrencyConversionResponse({
    required this.success,
    required this.query,
    required this.info,
    required this.date,
    required this.result,
  });

  factory CurrencyConversionResponse.fromJson(Map<String, dynamic> json) =>
      _$CurrencyConversionResponseFromJson(json);
  Map<String, dynamic> toJson() => _$CurrencyConversionResponseToJson(this);
}

@JsonSerializable()
class Query {
  final String from;
  final String to;
  final double amount;

  const Query({
    required this.from,
    required this.to,
    required this.amount,
  });

  factory Query.fromJson(Map<String, dynamic> json) => _$QueryFromJson(json);
  Map<String, dynamic> toJson() => _$QueryToJson(this);
}

@JsonSerializable()
class ConversionInfo {
  final double rate;

  const ConversionInfo({
    required this.rate,
  });

  factory ConversionInfo.fromJson(Map<String, dynamic> json) =>
      _$ConversionInfoFromJson(json);
  Map<String, dynamic> toJson() => _$ConversionInfoToJson(this);
}

/// Note: TimeSeriesResponse supprimé car nous utilisons maintenant
/// des données de démonstration générées localement pour éviter
/// les problèmes d'API qui nécessitent des clés d'accès.

/// Modèle pour un point de données du graphique
@JsonSerializable()
class ExchangeRatePoint {
  final DateTime date;
  final double rate;

  const ExchangeRatePoint({
    required this.date,
    required this.rate,
  });

  factory ExchangeRatePoint.fromJson(Map<String, dynamic> json) =>
      _$ExchangeRatePointFromJson(json);
  Map<String, dynamic> toJson() => _$ExchangeRatePointToJson(this);
}

/// Données du graphique avec statistiques
class ChartData {
  final List<ExchangeRatePoint> points;
  final double minRate;
  final double maxRate;
  final double currentRate;
  final double changePercentage;

  const ChartData({
    required this.points,
    required this.minRate,
    required this.maxRate,
    required this.currentRate,
    required this.changePercentage,
  });

  factory ChartData.fromPoints(List<ExchangeRatePoint> points) {
    if (points.isEmpty) {
      return const ChartData(
        points: [],
        minRate: 0,
        maxRate: 0,
        currentRate: 0,
        changePercentage: 0,
      );
    }

    final rates = points.map((p) => p.rate).toList();
    final minRate = rates.reduce((a, b) => a < b ? a : b);
    final maxRate = rates.reduce((a, b) => a > b ? a : b);
    final currentRate = points.last.rate;
    final firstRate = points.first.rate;
    
    final changePercentage = firstRate != 0 
        ? ((currentRate - firstRate) / firstRate) * 100.0
        : 0.0;

    return ChartData(
      points: points,
      minRate: minRate,
      maxRate: maxRate,
      currentRate: currentRate,
      changePercentage: changePercentage,
    );
  }
}

/// Énumération pour les périodes du graphique
enum ChartPeriod {
  sevenDays('7J', 7),
  thirtyDays('30J', 30);

  const ChartPeriod(this.label, this.days);
  
  final String label;
  final int days;
}

/// Liste des devises supportées
class SupportedCurrencies {
  static const List<Currency> currencies = [
    // Devises fiat principales
    Currency(code: 'EUR', name: 'Euro', symbol: '€'),
    Currency(code: 'USD', name: 'Dollar américain', symbol: '\$'),
    Currency(code: 'GBP', name: 'Livre sterling', symbol: '£'),
    Currency(code: 'JPY', name: 'Yen japonais', symbol: '¥'),
    Currency(code: 'CHF', name: 'Franc suisse', symbol: 'CHF'),
    Currency(code: 'CAD', name: 'Dollar canadien', symbol: 'C\$'),
    Currency(code: 'AUD', name: 'Dollar australien', symbol: 'A\$'),
    Currency(code: 'CNY', name: 'Yuan chinois', symbol: '¥'),
    Currency(code: 'SEK', name: 'Couronne suédoise', symbol: 'kr'),
    Currency(code: 'NOK', name: 'Couronne norvégienne', symbol: 'kr'),
    Currency(code: 'DKK', name: 'Couronne danoise', symbol: 'kr'),
    Currency(code: 'PLN', name: 'Złoty polonais', symbol: 'zł'),
    Currency(code: 'CZK', name: 'Couronne tchèque', symbol: 'Kč'),
    Currency(code: 'HUF', name: 'Forint hongrois', symbol: 'Ft'),
    Currency(code: 'RUB', name: 'Rouble russe', symbol: '₽'),
    Currency(code: 'INR', name: 'Roupie indienne', symbol: '₹'),
    Currency(code: 'BRL', name: 'Réal brésilien', symbol: 'R\$'),
    Currency(code: 'KRW', name: 'Won sud-coréen', symbol: '₩'),
    Currency(code: 'SGD', name: 'Dollar de Singapour', symbol: 'S\$'),
    Currency(code: 'NZD', name: 'Dollar néo-zélandais', symbol: 'NZ\$'),
    
    // Devises fiat exotiques
    Currency(code: 'AED', name: 'Dirham émirati', symbol: 'د.إ'),
    Currency(code: 'ZAR', name: 'Rand sud-africain', symbol: 'R'),
    Currency(code: 'MXN', name: 'Peso mexicain', symbol: '\$'),
    Currency(code: 'THB', name: 'Baht thaïlandais', symbol: '฿'),
    Currency(code: 'TRY', name: 'Livre turque', symbol: '₺'),
    Currency(code: 'ILS', name: 'Shekel israélien', symbol: '₪'),
    Currency(code: 'EGP', name: 'Livre égyptienne', symbol: '£'),
    Currency(code: 'PHP', name: 'Peso philippin', symbol: '₱'),
    Currency(code: 'MYR', name: 'Ringgit malaisien', symbol: 'RM'),
    Currency(code: 'IDR', name: 'Roupie indonésienne', symbol: 'Rp'),
    Currency(code: 'VND', name: 'Dong vietnamien', symbol: '₫'),
    Currency(code: 'UAH', name: 'Hryvnia ukrainienne', symbol: '₴'),
    Currency(code: 'RON', name: 'Leu roumain', symbol: 'lei'),
    Currency(code: 'BGN', name: 'Lev bulgare', symbol: 'лв'),
    Currency(code: 'HRK', name: 'Kuna croate', symbol: 'kn'),
    Currency(code: 'RSD', name: 'Dinar serbe', symbol: 'дин'),
    
    // Cryptomonnaies populaires
    Currency(code: 'BTC', name: 'Bitcoin', symbol: '₿'),
    Currency(code: 'ETH', name: 'Ethereum', symbol: 'Ξ'),
    Currency(code: 'USDT', name: 'Tether USD', symbol: '₮'),
    Currency(code: 'USDC', name: 'USD Coin', symbol: '₮'),
    Currency(code: 'BNB', name: 'Binance Coin', symbol: 'BNB'),
    Currency(code: 'ADA', name: 'Cardano', symbol: '₳'),
    Currency(code: 'SOL', name: 'Solana', symbol: '◎'),
    Currency(code: 'XRP', name: 'Ripple', symbol: 'XRP'),
    Currency(code: 'DOT', name: 'Polkadot', symbol: '●'),
    Currency(code: 'DOGE', name: 'Dogecoin', symbol: 'Ð'),
    Currency(code: 'AVAX', name: 'Avalanche', symbol: 'AVAX'),
    Currency(code: 'MATIC', name: 'Polygon', symbol: 'MATIC'),
    Currency(code: 'LINK', name: 'Chainlink', symbol: 'LINK'),
    Currency(code: 'UNI', name: 'Uniswap', symbol: 'UNI'),
    Currency(code: 'LTC', name: 'Litecoin', symbol: 'Ł'),
    Currency(code: 'BCH', name: 'Bitcoin Cash', symbol: 'BCH'),
    Currency(code: 'ATOM', name: 'Cosmos', symbol: 'ATOM'),
    Currency(code: 'FTM', name: 'Fantom', symbol: 'FTM'),
    Currency(code: 'NEAR', name: 'NEAR Protocol', symbol: 'NEAR'),
    Currency(code: 'ALGO', name: 'Algorand', symbol: 'ALGO'),
  ];

  static Currency? getCurrencyByCode(String code) {
    try {
      return currencies.firstWhere((currency) => currency.code == code);
    } catch (e) {
      return null;
    }
  }

  static List<String> get currencyCodes => currencies.map((c) => c.code).toList();
}
