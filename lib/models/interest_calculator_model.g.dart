// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'interest_calculator_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InterestCalculatorInput _$InterestCalculatorInputFromJson(
  Map<String, dynamic> json,
) => InterestCalculatorInput(
  initialCapital: (json['initialCapital'] as num).toDouble(),
  recurringAmount: (json['recurringAmount'] as num).toDouble(),
  recurringFrequency: $enumDecode(
    _$FrequencyEnumMap,
    json['recurringFrequency'],
  ),
  interestRate: (json['interestRate'] as num).toDouble(),
  interestFrequency: $enumDecode(_$FrequencyEnumMap, json['interestFrequency']),
  periods: (json['periods'] as num).toInt(),
  interestType: $enumDecode(_$InterestTypeEnumMap, json['interestType']),
);

Map<String, dynamic> _$InterestCalculatorInputToJson(
  InterestCalculatorInput instance,
) => <String, dynamic>{
  'initialCapital': instance.initialCapital,
  'recurringAmount': instance.recurringAmount,
  'recurringFrequency': _$FrequencyEnumMap[instance.recurringFrequency]!,
  'interestRate': instance.interestRate,
  'interestFrequency': _$FrequencyEnumMap[instance.interestFrequency]!,
  'periods': instance.periods,
  'interestType': _$InterestTypeEnumMap[instance.interestType]!,
};

const _$FrequencyEnumMap = {
  Frequency.monthly: 'monthly',
  Frequency.quarterly: 'quarterly',
  Frequency.annually: 'annually',
};

const _$InterestTypeEnumMap = {
  InterestType.simple: 'simple',
  InterestType.compound: 'compound',
};

InterestCalculatorPeriodResult _$InterestCalculatorPeriodResultFromJson(
  Map<String, dynamic> json,
) => InterestCalculatorPeriodResult(
  period: (json['period'] as num).toInt(),
  capital: (json['capital'] as num).toDouble(),
  totalInvested: (json['totalInvested'] as num).toDouble(),
  interestEarned: (json['interestEarned'] as num).toDouble(),
);

Map<String, dynamic> _$InterestCalculatorPeriodResultToJson(
  InterestCalculatorPeriodResult instance,
) => <String, dynamic>{
  'period': instance.period,
  'capital': instance.capital,
  'totalInvested': instance.totalInvested,
  'interestEarned': instance.interestEarned,
};

InterestCalculatorResult _$InterestCalculatorResultFromJson(
  Map<String, dynamic> json,
) => InterestCalculatorResult(
  input: InterestCalculatorInput.fromJson(
    json['input'] as Map<String, dynamic>,
  ),
  finalCapital: (json['finalCapital'] as num).toDouble(),
  totalInvested: (json['totalInvested'] as num).toDouble(),
  totalInterest: (json['totalInterest'] as num).toDouble(),
  history: (json['history'] as List<dynamic>)
      .map(
        (e) =>
            InterestCalculatorPeriodResult.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  calculatedAt: DateTime.parse(json['calculatedAt'] as String),
);

Map<String, dynamic> _$InterestCalculatorResultToJson(
  InterestCalculatorResult instance,
) => <String, dynamic>{
  'input': instance.input,
  'finalCapital': instance.finalCapital,
  'totalInvested': instance.totalInvested,
  'totalInterest': instance.totalInterest,
  'history': instance.history,
  'calculatedAt': instance.calculatedAt.toIso8601String(),
};

InterestCalculatorScenario _$InterestCalculatorScenarioFromJson(
  Map<String, dynamic> json,
) => InterestCalculatorScenario(
  name: json['name'] as String,
  input: InterestCalculatorInput.fromJson(
    json['input'] as Map<String, dynamic>,
  ),
  result: json['result'] == null
      ? null
      : InterestCalculatorResult.fromJson(
          json['result'] as Map<String, dynamic>,
        ),
);

Map<String, dynamic> _$InterestCalculatorScenarioToJson(
  InterestCalculatorScenario instance,
) => <String, dynamic>{
  'name': instance.name,
  'input': instance.input,
  'result': instance.result,
};
