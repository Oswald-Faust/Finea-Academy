import 'package:json_annotation/json_annotation.dart';

part 'lot_calculator_model.g.dart';

enum InterestType { simple, compound }

enum Frequency { monthly, quarterly, annually }

@JsonSerializable()
class LotCalculatorInput {
  final double initialCapital;
  final double recurringAmount;
  final Frequency recurringFrequency;
  final double interestRate;
  final Frequency interestFrequency;
  final int periods;
  final InterestType interestType;

  const LotCalculatorInput({
    required this.initialCapital,
    required this.recurringAmount,
    required this.recurringFrequency,
    required this.interestRate,
    required this.interestFrequency,
    required this.periods,
    required this.interestType,
  });

  factory LotCalculatorInput.fromJson(Map<String, dynamic> json) =>
      _$LotCalculatorInputFromJson(json);

  Map<String, dynamic> toJson() => _$LotCalculatorInputToJson(this);

  // Méthode pour convertir la fréquence en nombre de périodes par an
  static int getPeriodsPerYear(Frequency frequency) {
    switch (frequency) {
      case Frequency.monthly:
        return 12;
      case Frequency.quarterly:
        return 4;
      case Frequency.annually:
        return 1;
    }
  }

  // Obtenir le label de fréquence
  static String getFrequencyLabel(Frequency frequency) {
    switch (frequency) {
      case Frequency.monthly:
        return 'Mensuel';
      case Frequency.quarterly:
        return 'Trimestriel';
      case Frequency.annually:
        return 'Annuel';
    }
  }

  // Obtenir le label du type d'intérêt
  static String getInterestTypeLabel(InterestType type) {
    switch (type) {
      case InterestType.simple:
        return 'Intérêt simple (sans effet cumulé)';
      case InterestType.compound:
        return 'Intérêt composé (effet cumulé)';
    }
  }
}

@JsonSerializable()
class LotCalculatorPeriodResult {
  final int period;
  final double capital;
  final double totalInvested;
  final double interestEarned;

  const LotCalculatorPeriodResult({
    required this.period,
    required this.capital,
    required this.totalInvested,
    required this.interestEarned,
  });

  factory LotCalculatorPeriodResult.fromJson(Map<String, dynamic> json) =>
      _$LotCalculatorPeriodResultFromJson(json);

  Map<String, dynamic> toJson() => _$LotCalculatorPeriodResultToJson(this);
}

@JsonSerializable()
class LotCalculatorResult {
  final LotCalculatorInput input;
  final double finalCapital;
  final double totalInvested;
  final double totalInterest;
  final List<LotCalculatorPeriodResult> history;
  final DateTime calculatedAt;

  const LotCalculatorResult({
    required this.input,
    required this.finalCapital,
    required this.totalInvested,
    required this.totalInterest,
    required this.history,
    required this.calculatedAt,
  });

  factory LotCalculatorResult.fromJson(Map<String, dynamic> json) =>
      _$LotCalculatorResultFromJson(json);

  Map<String, dynamic> toJson() => _$LotCalculatorResultToJson(this);

  // Calculer le rendement total en pourcentage
  double get totalReturnPercentage {
    if (totalInvested == 0) return 0;
    return ((finalCapital - totalInvested) / totalInvested) * 100;
  }

  // Calculer le rendement annuel moyen
  double get averageAnnualReturn {
    if (input.periods == 0) return 0;
    final years = input.periods / LotCalculatorInput.getPeriodsPerYear(input.interestFrequency);
    if (years == 0) return 0;
    return totalReturnPercentage / years;
  }
}

// Classe pour stocker un scénario de comparaison
@JsonSerializable()
class LotCalculatorScenario {
  final String name;
  final LotCalculatorInput input;
  final LotCalculatorResult? result;

  const LotCalculatorScenario({
    required this.name,
    required this.input,
    this.result,
  });

  factory LotCalculatorScenario.fromJson(Map<String, dynamic> json) =>
      _$LotCalculatorScenarioFromJson(json);

  Map<String, dynamic> toJson() => _$LotCalculatorScenarioToJson(this);

  LotCalculatorScenario copyWith({
    String? name,
    LotCalculatorInput? input,
    LotCalculatorResult? result,
  }) {
    return LotCalculatorScenario(
      name: name ?? this.name,
      input: input ?? this.input,
      result: result ?? this.result,
    );
  }
}
