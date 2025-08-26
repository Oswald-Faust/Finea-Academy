// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trading_data_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CurrencyPair _$CurrencyPairFromJson(Map<String, dynamic> json) => CurrencyPair(
      symbol: json['symbol'] as String,
      name: json['name'] as String,
      baseCurrency: json['baseCurrency'] as String,
      quoteCurrency: json['quoteCurrency'] as String,
      minLotSize: (json['minLotSize'] as num).toDouble(),
      maxLotSize: (json['maxLotSize'] as num).toDouble(),
      lotStep: (json['lotStep'] as num).toDouble(),
      pipPosition: json['pipPosition'] as int,
      isActive: json['isActive'] as bool? ?? true,
    );

Map<String, dynamic> _$CurrencyPairToJson(CurrencyPair instance) =>
    <String, dynamic>{
      'symbol': instance.symbol,
      'name': instance.name,
      'baseCurrency': instance.baseCurrency,
      'quoteCurrency': instance.quoteCurrency,
      'minLotSize': instance.minLotSize,
      'maxLotSize': instance.maxLotSize,
      'lotStep': instance.lotStep,
      'pipPosition': instance.pipPosition,
      'isActive': instance.isActive,
    };

PriceData _$PriceDataFromJson(Map<String, dynamic> json) => PriceData(
      symbol: json['symbol'] as String,
      bid: (json['bid'] as num).toDouble(),
      ask: (json['ask'] as num).toDouble(),
      spread: (json['spread'] as num).toDouble(),
      timestamp: DateTime.parse(json['timestamp'] as String),
    );

Map<String, dynamic> _$PriceDataToJson(PriceData instance) => <String, dynamic>{
      'symbol': instance.symbol,
      'bid': instance.bid,
      'ask': instance.ask,
      'spread': instance.spread,
      'timestamp': instance.timestamp.toIso8601String(),
    };

PipValueData _$PipValueDataFromJson(Map<String, dynamic> json) => PipValueData(
      symbol: json['symbol'] as String,
      accountCurrency: $enumDecode(_$AccountCurrencyEnumMap, json['accountCurrency']),
      pipValue: (json['pipValue'] as num).toDouble(),
      lotSize: (json['lotSize'] as num).toDouble(),
    );

Map<String, dynamic> _$PipValueDataToJson(PipValueData instance) =>
    <String, dynamic>{
      'symbol': instance.symbol,
      'accountCurrency': _$AccountCurrencyEnumMap[instance.accountCurrency]!,
      'pipValue': instance.pipValue,
      'lotSize': instance.lotSize,
    };

const _$AccountCurrencyEnumMap = {
  AccountCurrency.EUR: 'EUR',
  AccountCurrency.USD: 'USD',
  AccountCurrency.GBP: 'GBP',
  AccountCurrency.JPY: 'JPY',
  AccountCurrency.CHF: 'CHF',
  AccountCurrency.CAD: 'CAD',
  AccountCurrency.AUD: 'AUD',
  AccountCurrency.NZD: 'NZD',
};

LotCalculationInput _$LotCalculationInputFromJson(Map<String, dynamic> json) =>
    LotCalculationInput(
      accountBalance: (json['accountBalance'] as num).toDouble(),
      riskPercentage: (json['riskPercentage'] as num).toDouble(),
      stopLossPips: (json['stopLossPips'] as num).toDouble(),
      currencyPair: json['currencyPair'] as String,
      accountCurrency: $enumDecode(_$AccountCurrencyEnumMap, json['accountCurrency']),
      customEntryPrice: (json['customEntryPrice'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$LotCalculationInputToJson(LotCalculationInput instance) =>
    <String, dynamic>{
      'accountBalance': instance.accountBalance,
      'riskPercentage': instance.riskPercentage,
      'stopLossPips': instance.stopLossPips,
      'currencyPair': instance.currencyPair,
      'accountCurrency': _$AccountCurrencyEnumMap[instance.accountCurrency]!,
      'customEntryPrice': instance.customEntryPrice,
    };

LotCalculationResult _$LotCalculationResultFromJson(Map<String, dynamic> json) =>
    LotCalculationResult(
      input: LotCalculationInput.fromJson(json['input'] as Map<String, dynamic>),
      recommendedLotSize: (json['recommendedLotSize'] as num).toDouble(),
      riskAmount: (json['riskAmount'] as num).toDouble(),
      pipValue: (json['pipValue'] as num).toDouble(),
      entryPrice: (json['entryPrice'] as num).toDouble(),
      stopLossPrice: (json['stopLossPrice'] as num).toDouble(),
      takeProfitPrice: (json['takeProfitPrice'] as num).toDouble(),
      potentialProfit: (json['potentialProfit'] as num).toDouble(),
      actualRiskPercentage: (json['actualRiskPercentage'] as num).toDouble(),
      lotSizeType: json['lotSizeType'] as String,
      calculatedAt: DateTime.parse(json['calculatedAt'] as String),
    );

Map<String, dynamic> _$LotCalculationResultToJson(LotCalculationResult instance) =>
    <String, dynamic>{
      'input': instance.input,
      'recommendedLotSize': instance.recommendedLotSize,
      'riskAmount': instance.riskAmount,
      'pipValue': instance.pipValue,
      'entryPrice': instance.entryPrice,
      'stopLossPrice': instance.stopLossPrice,
      'takeProfitPrice': instance.takeProfitPrice,
      'potentialProfit': instance.potentialProfit,
      'actualRiskPercentage': instance.actualRiskPercentage,
      'lotSizeType': instance.lotSizeType,
      'calculatedAt': instance.calculatedAt.toIso8601String(),
    };

T $enumDecode<T>(
  Map<T, Object> enumValues,
  Object? source, {
  T? unknownValue,
}) {
  if (source == null) {
    throw ArgumentError(
      'A value must be provided. Supported values: '
      '${enumValues.values.join(', ')}',
    );
  }

  return enumValues.entries.singleWhere(
    (e) => e.value == source,
    orElse: () {
      if (unknownValue == null) {
        throw ArgumentError(
          '`$source` is not one of the supported values: '
          '${enumValues.values.join(', ')}',
        );
      }
      return MapEntry(unknownValue, enumValues.values.first);
    },
  ).key;
}
