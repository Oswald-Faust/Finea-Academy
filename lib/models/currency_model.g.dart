// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'currency_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Currency _$CurrencyFromJson(Map<String, dynamic> json) => Currency(
  code: json['code'] as String,
  name: json['name'] as String,
  symbol: json['symbol'] as String,
);

Map<String, dynamic> _$CurrencyToJson(Currency instance) => <String, dynamic>{
  'code': instance.code,
  'name': instance.name,
  'symbol': instance.symbol,
};

CurrencyConversionResponse _$CurrencyConversionResponseFromJson(
  Map<String, dynamic> json,
) => CurrencyConversionResponse(
  success: json['success'] as bool,
  query: Query.fromJson(json['query'] as Map<String, dynamic>),
  info: ConversionInfo.fromJson(json['info'] as Map<String, dynamic>),
  date: json['date'] as String,
  result: (json['result'] as num).toDouble(),
);

Map<String, dynamic> _$CurrencyConversionResponseToJson(
  CurrencyConversionResponse instance,
) => <String, dynamic>{
  'success': instance.success,
  'query': instance.query,
  'info': instance.info,
  'date': instance.date,
  'result': instance.result,
};

Query _$QueryFromJson(Map<String, dynamic> json) => Query(
  from: json['from'] as String,
  to: json['to'] as String,
  amount: (json['amount'] as num).toDouble(),
);

Map<String, dynamic> _$QueryToJson(Query instance) => <String, dynamic>{
  'from': instance.from,
  'to': instance.to,
  'amount': instance.amount,
};

ConversionInfo _$ConversionInfoFromJson(Map<String, dynamic> json) =>
    ConversionInfo(rate: (json['rate'] as num).toDouble());

Map<String, dynamic> _$ConversionInfoToJson(ConversionInfo instance) =>
    <String, dynamic>{'rate': instance.rate};

ExchangeRatePoint _$ExchangeRatePointFromJson(Map<String, dynamic> json) =>
    ExchangeRatePoint(
      date: DateTime.parse(json['date'] as String),
      rate: (json['rate'] as num).toDouble(),
    );

Map<String, dynamic> _$ExchangeRatePointToJson(ExchangeRatePoint instance) =>
    <String, dynamic>{
      'date': instance.date.toIso8601String(),
      'rate': instance.rate,
    };
