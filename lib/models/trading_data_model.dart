import 'package:json_annotation/json_annotation.dart';

part 'trading_data_model.g.dart';

enum AccountCurrency { EUR, USD, GBP, JPY, CHF, CAD, AUD, NZD }

@JsonSerializable()
class CurrencyPair {
  final String symbol;
  final String name;
  final String baseCurrency;
  final String quoteCurrency;
  final double minLotSize;
  final double maxLotSize;
  final double lotStep;
  final int pipPosition;
  final bool isActive;

  const CurrencyPair({
    required this.symbol,
    required this.name,
    required this.baseCurrency,
    required this.quoteCurrency,
    required this.minLotSize,
    required this.maxLotSize,
    required this.lotStep,
    required this.pipPosition,
    this.isActive = true,
  });

  factory CurrencyPair.fromJson(Map<String, dynamic> json) =>
      _$CurrencyPairFromJson(json);

  Map<String, dynamic> toJson() => _$CurrencyPairToJson(this);

  // Getters helper
  String get displayName => '$baseCurrency/$quoteCurrency';
  bool get isJpyPair => quoteCurrency == 'JPY';
  double get pipValue => isJpyPair ? 0.01 : 0.0001;
}

@JsonSerializable()
class PriceData {
  final String symbol;
  final double bid;
  final double ask;
  final double spread;
  final DateTime timestamp;

  const PriceData({
    required this.symbol,
    required this.bid,
    required this.ask,
    required this.spread,
    required this.timestamp,
  });

  factory PriceData.fromJson(Map<String, dynamic> json) =>
      _$PriceDataFromJson(json);

  Map<String, dynamic> toJson() => _$PriceDataToJson(this);

  double get midPrice => (bid + ask) / 2;
}

@JsonSerializable()
class PipValueData {
  final String symbol;
  final AccountCurrency accountCurrency;
  final double pipValue;
  final double lotSize;

  const PipValueData({
    required this.symbol,
    required this.accountCurrency,
    required this.pipValue,
    required this.lotSize,
  });

  factory PipValueData.fromJson(Map<String, dynamic> json) =>
      _$PipValueDataFromJson(json);

  Map<String, dynamic> toJson() => _$PipValueDataToJson(this);
}

@JsonSerializable()
class LotCalculationInput {
  final double accountBalance;
  final double riskPercentage;
  final double stopLossPips;
  final String currencyPair;
  final AccountCurrency accountCurrency;
  final double? customEntryPrice;

  const LotCalculationInput({
    required this.accountBalance,
    required this.riskPercentage,
    required this.stopLossPips,
    required this.currencyPair,
    required this.accountCurrency,
    this.customEntryPrice,
  });

  factory LotCalculationInput.fromJson(Map<String, dynamic> json) =>
      _$LotCalculationInputFromJson(json);

  Map<String, dynamic> toJson() => _$LotCalculationInputToJson(this);

  double get riskAmount => accountBalance * (riskPercentage / 100);
}

@JsonSerializable()
class LotCalculationResult {
  final LotCalculationInput input;
  final double recommendedLotSize;
  final double riskAmount;
  final double pipValue;
  final double entryPrice;
  final double stopLossPrice;
  final double takeProfitPrice;
  final double potentialProfit;
  final double actualRiskPercentage;
  final String lotSizeType;
  final DateTime calculatedAt;

  const LotCalculationResult({
    required this.input,
    required this.recommendedLotSize,
    required this.riskAmount,
    required this.pipValue,
    required this.entryPrice,
    required this.stopLossPrice,
    required this.takeProfitPrice,
    required this.potentialProfit,
    required this.actualRiskPercentage,
    required this.lotSizeType,
    required this.calculatedAt,
  });

  factory LotCalculationResult.fromJson(Map<String, dynamic> json) =>
      _$LotCalculationResultFromJson(json);

  Map<String, dynamic> toJson() => _$LotCalculationResultToJson(this);

  // Getters helper
  String get formattedLotSize {
    if (recommendedLotSize >= 1.0) {
      return '${recommendedLotSize.toStringAsFixed(2)} lots standards';
    } else if (recommendedLotSize >= 0.1) {
      return '${(recommendedLotSize * 10).toStringAsFixed(1)} mini lots';
    } else {
      return '${(recommendedLotSize * 1000).toStringAsFixed(0)} micro lots';
    }
  }

  double get riskRewardRatio => potentialProfit / riskAmount;
}

// Classe utilitaire pour les paires de devises populaires
class PopularCurrencyPairs {
  static const List<CurrencyPair> majors = [
    CurrencyPair(
      symbol: 'EUR_USD',
      name: 'Euro / US Dollar',
      baseCurrency: 'EUR',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'GBP_USD',
      name: 'British Pound / US Dollar',
      baseCurrency: 'GBP',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'USD_JPY',
      name: 'US Dollar / Japanese Yen',
      baseCurrency: 'USD',
      quoteCurrency: 'JPY',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'USD_CHF',
      name: 'US Dollar / Swiss Franc',
      baseCurrency: 'USD',
      quoteCurrency: 'CHF',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'AUD_USD',
      name: 'Australian Dollar / US Dollar',
      baseCurrency: 'AUD',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'USD_CAD',
      name: 'US Dollar / Canadian Dollar',
      baseCurrency: 'USD',
      quoteCurrency: 'CAD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'NZD_USD',
      name: 'New Zealand Dollar / US Dollar',
      baseCurrency: 'NZD',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
  ];

  static const List<CurrencyPair> crosses = [
    CurrencyPair(
      symbol: 'EUR_GBP',
      name: 'Euro / British Pound',
      baseCurrency: 'EUR',
      quoteCurrency: 'GBP',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'EUR_JPY',
      name: 'Euro / Japanese Yen',
      baseCurrency: 'EUR',
      quoteCurrency: 'JPY',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'GBP_JPY',
      name: 'British Pound / Japanese Yen',
      baseCurrency: 'GBP',
      quoteCurrency: 'JPY',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
  ];

  static List<CurrencyPair> get allPairs => [...majors, ...crosses];

  static CurrencyPair? findBySymbol(String symbol) {
    try {
      return allPairs.firstWhere((pair) => pair.symbol == symbol);
    } catch (e) {
      return null;
    }
  }
}

// Extensions utiles
extension AccountCurrencyExtension on AccountCurrency {
  String get symbol {
    switch (this) {
      case AccountCurrency.EUR:
        return 'EUR';
      case AccountCurrency.USD:
        return 'USD';
      case AccountCurrency.GBP:
        return 'GBP';
      case AccountCurrency.JPY:
        return 'JPY';
      case AccountCurrency.CHF:
        return 'CHF';
      case AccountCurrency.CAD:
        return 'CAD';
      case AccountCurrency.AUD:
        return 'AUD';
      case AccountCurrency.NZD:
        return 'NZD';
    }
  }

  String get name {
    switch (this) {
      case AccountCurrency.EUR:
        return 'Euro';
      case AccountCurrency.USD:
        return 'US Dollar';
      case AccountCurrency.GBP:
        return 'British Pound';
      case AccountCurrency.JPY:
        return 'Japanese Yen';
      case AccountCurrency.CHF:
        return 'Swiss Franc';
      case AccountCurrency.CAD:
        return 'Canadian Dollar';
      case AccountCurrency.AUD:
        return 'Australian Dollar';
      case AccountCurrency.NZD:
        return 'New Zealand Dollar';
    }
  }

  String get flag {
    switch (this) {
      case AccountCurrency.EUR:
        return '🇪🇺';
      case AccountCurrency.USD:
        return '🇺🇸';
      case AccountCurrency.GBP:
        return '🇬🇧';
      case AccountCurrency.JPY:
        return '🇯🇵';
      case AccountCurrency.CHF:
        return '🇨🇭';
      case AccountCurrency.CAD:
        return '🇨🇦';
      case AccountCurrency.AUD:
        return '🇦🇺';
      case AccountCurrency.NZD:
        return '🇳🇿';
    }
  }
}
