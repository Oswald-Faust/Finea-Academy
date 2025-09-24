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
    // Paires exotiques
    CurrencyPair(
      symbol: 'EUR_AUD',
      name: 'Euro / Australian Dollar',
      baseCurrency: 'EUR',
      quoteCurrency: 'AUD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'EUR_CAD',
      name: 'Euro / Canadian Dollar',
      baseCurrency: 'EUR',
      quoteCurrency: 'CAD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'GBP_AUD',
      name: 'British Pound / Australian Dollar',
      baseCurrency: 'GBP',
      quoteCurrency: 'AUD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'AUD_JPY',
      name: 'Australian Dollar / Japanese Yen',
      baseCurrency: 'AUD',
      quoteCurrency: 'JPY',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'CAD_JPY',
      name: 'Canadian Dollar / Japanese Yen',
      baseCurrency: 'CAD',
      quoteCurrency: 'JPY',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'NZD_JPY',
      name: 'New Zealand Dollar / Japanese Yen',
      baseCurrency: 'NZD',
      quoteCurrency: 'JPY',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'EUR_CHF',
      name: 'Euro / Swiss Franc',
      baseCurrency: 'EUR',
      quoteCurrency: 'CHF',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'GBP_CHF',
      name: 'British Pound / Swiss Franc',
      baseCurrency: 'GBP',
      quoteCurrency: 'CHF',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'AUD_CHF',
      name: 'Australian Dollar / Swiss Franc',
      baseCurrency: 'AUD',
      quoteCurrency: 'CHF',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'NZD_CHF',
      name: 'New Zealand Dollar / Swiss Franc',
      baseCurrency: 'NZD',
      quoteCurrency: 'CHF',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'AUD_CAD',
      name: 'Australian Dollar / Canadian Dollar',
      baseCurrency: 'AUD',
      quoteCurrency: 'CAD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'NZD_CAD',
      name: 'New Zealand Dollar / Canadian Dollar',
      baseCurrency: 'NZD',
      quoteCurrency: 'CAD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'AUD_NZD',
      name: 'Australian Dollar / New Zealand Dollar',
      baseCurrency: 'AUD',
      quoteCurrency: 'NZD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
  ];

  // Indices boursiers
  static const List<CurrencyPair> indices = [
    CurrencyPair(
      symbol: 'US30',
      name: 'Dow Jones Industrial Average',
      baseCurrency: 'USD',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'SPX500',
      name: 'S&P 500',
      baseCurrency: 'USD',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'NAS100',
      name: 'NASDAQ 100',
      baseCurrency: 'USD',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'UK100',
      name: 'FTSE 100',
      baseCurrency: 'GBP',
      quoteCurrency: 'GBP',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'GER30',
      name: 'DAX 30',
      baseCurrency: 'EUR',
      quoteCurrency: 'EUR',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'FRA40',
      name: 'CAC 40',
      baseCurrency: 'EUR',
      quoteCurrency: 'EUR',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'JPN225',
      name: 'Nikkei 225',
      baseCurrency: 'JPY',
      quoteCurrency: 'JPY',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'AUS200',
      name: 'ASX 200',
      baseCurrency: 'AUD',
      quoteCurrency: 'AUD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'CAN60',
      name: 'S&P/TSX 60',
      baseCurrency: 'CAD',
      quoteCurrency: 'CAD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'SWI20',
      name: 'SMI 20',
      baseCurrency: 'CHF',
      quoteCurrency: 'CHF',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    // Nouveaux indices
    CurrencyPair(
      symbol: 'VIX',
      name: 'Volatility Index',
      baseCurrency: 'USD',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'HK50',
      name: 'Hang Seng 50',
      baseCurrency: 'HKD',
      quoteCurrency: 'HKD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'SPA35',
      name: 'IBEX 35',
      baseCurrency: 'EUR',
      quoteCurrency: 'EUR',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'NLD25',
      name: 'AEX 25',
      baseCurrency: 'EUR',
      quoteCurrency: 'EUR',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
  ];

  // Actions populaires (Stocks)
  static const List<CurrencyPair> stocks = [
    CurrencyPair(
      symbol: 'AAPL_USD',
      name: 'Apple Inc.',
      baseCurrency: 'AAPL',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'MSFT_USD',
      name: 'Microsoft Corp.',
      baseCurrency: 'MSFT',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'GOOGL_USD',
      name: 'Alphabet Inc.',
      baseCurrency: 'GOOGL',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'AMZN_USD',
      name: 'Amazon.com Inc.',
      baseCurrency: 'AMZN',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'TSLA_USD',
      name: 'Tesla Inc.',
      baseCurrency: 'TSLA',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'META_USD',
      name: 'Meta Platforms Inc.',
      baseCurrency: 'META',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'NVDA_USD',
      name: 'NVIDIA Corp.',
      baseCurrency: 'NVDA',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'JPM_USD',
      name: 'JPMorgan Chase',
      baseCurrency: 'JPM',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'JNJ_USD',
      name: 'Johnson & Johnson',
      baseCurrency: 'JNJ',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'V_USD',
      name: 'Visa Inc.',
      baseCurrency: 'V',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'PG_USD',
      name: 'Procter & Gamble',
      baseCurrency: 'PG',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'UNH_USD',
      name: 'UnitedHealth Group',
      baseCurrency: 'UNH',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'HD_USD',
      name: 'Home Depot Inc.',
      baseCurrency: 'HD',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'MA_USD',
      name: 'Mastercard Inc.',
      baseCurrency: 'MA',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'BAC_USD',
      name: 'Bank of America',
      baseCurrency: 'BAC',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'DIS_USD',
      name: 'Walt Disney Co.',
      baseCurrency: 'DIS',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'ADBE_USD',
      name: 'Adobe Inc.',
      baseCurrency: 'ADBE',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'CRM_USD',
      name: 'Salesforce Inc.',
      baseCurrency: 'CRM',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'NFLX_USD',
      name: 'Netflix Inc.',
      baseCurrency: 'NFLX',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'BRK_A_USD',
      name: 'Berkshire Hathaway',
      baseCurrency: 'BRK.A',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
  ];

  // Matières premières
  static const List<CurrencyPair> commodities = [
    CurrencyPair(
      symbol: 'XAUUSD',
      name: 'Gold / US Dollar',
      baseCurrency: 'XAU',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'XAGUSD',
      name: 'Silver / US Dollar',
      baseCurrency: 'XAG',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 3,
    ),
    CurrencyPair(
      symbol: 'XAU_EUR',
      name: 'Gold / Euro',
      baseCurrency: 'XAU',
      quoteCurrency: 'EUR',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'XAG_EUR',
      name: 'Silver / Euro',
      baseCurrency: 'XAG',
      quoteCurrency: 'EUR',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 3,
    ),
    CurrencyPair(
      symbol: 'WTIUSD',
      name: 'Crude Oil WTI / US Dollar',
      baseCurrency: 'WTI',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'BRENTUSD',
      name: 'Brent Crude Oil / US Dollar',
      baseCurrency: 'BRENT',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'NATGAS',
      name: 'Natural Gas / US Dollar',
      baseCurrency: 'NG',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 3,
    ),
    CurrencyPair(
      symbol: 'COPPER',
      name: 'Copper / US Dollar',
      baseCurrency: 'HG',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'PLATINUM',
      name: 'Platinum / US Dollar',
      baseCurrency: 'XPT',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'PALLADIUM',
      name: 'Palladium / US Dollar',
      baseCurrency: 'XPD',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
  ];

  // Cryptomonnaies
  static const List<CurrencyPair> cryptocurrencies = [
    CurrencyPair(
      symbol: 'BTCUSD',
      name: 'Bitcoin / US Dollar',
      baseCurrency: 'BTC',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'ETHUSD',
      name: 'Ethereum / US Dollar',
      baseCurrency: 'ETH',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'LTCUSD',
      name: 'Litecoin / US Dollar',
      baseCurrency: 'LTC',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 2,
    ),
    CurrencyPair(
      symbol: 'XRPUSD',
      name: 'Ripple / US Dollar',
      baseCurrency: 'XRP',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'ADAUSD',
      name: 'Cardano / US Dollar',
      baseCurrency: 'ADA',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'DOTUSD',
      name: 'Polkadot / US Dollar',
      baseCurrency: 'DOT',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'LINKUSD',
      name: 'Chainlink / US Dollar',
      baseCurrency: 'LINK',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'UNIUSD',
      name: 'Uniswap / US Dollar',
      baseCurrency: 'UNI',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'AVAXUSD',
      name: 'Avalanche / US Dollar',
      baseCurrency: 'AVAX',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
    CurrencyPair(
      symbol: 'SOLUSD',
      name: 'Solana / US Dollar',
      baseCurrency: 'SOL',
      quoteCurrency: 'USD',
      minLotSize: 0.01,
      maxLotSize: 100.0,
      lotStep: 0.01,
      pipPosition: 4,
    ),
  ];

  static List<CurrencyPair> get allPairs => [...majors, ...crosses, ...indices, ...stocks, ...commodities, ...cryptocurrencies];

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
