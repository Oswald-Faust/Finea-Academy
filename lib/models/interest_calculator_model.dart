import 'package:json_annotation/json_annotation.dart';

part 'interest_calculator_model.g.dart';

enum InterestType { simple, compound }

enum Frequency { monthly, quarterly, annually }

@JsonSerializable()
class InterestCalculatorInput {
  final double initialCapital;
  final double recurringAmount;
  final Frequency recurringFrequency;
  final double interestRate;
  final Frequency interestFrequency;
  final int periods;
  final InterestType interestType;

  const InterestCalculatorInput({
    required this.initialCapital,
    required this.recurringAmount,
    required this.recurringFrequency,
    required this.interestRate,
    required this.interestFrequency,
    required this.periods,
    required this.interestType,
  });

  factory InterestCalculatorInput.fromJson(Map<String, dynamic> json) =>
      _$InterestCalculatorInputFromJson(json);

  Map<String, dynamic> toJson() => _$InterestCalculatorInputToJson(this);

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
class InterestCalculatorPeriodResult {
  final int period;
  final double capital;
  final double totalInvested;
  final double interestEarned;

  const InterestCalculatorPeriodResult({
    required this.period,
    required this.capital,
    required this.totalInvested,
    required this.interestEarned,
  });

  factory InterestCalculatorPeriodResult.fromJson(Map<String, dynamic> json) =>
      _$InterestCalculatorPeriodResultFromJson(json);

  Map<String, dynamic> toJson() => _$InterestCalculatorPeriodResultToJson(this);
}

@JsonSerializable()
class InterestCalculatorResult {
  final InterestCalculatorInput input;
  final double finalCapital;
  final double totalInvested;
  final double totalInterest;
  final List<InterestCalculatorPeriodResult> history;
  final DateTime calculatedAt;

  const InterestCalculatorResult({
    required this.input,
    required this.finalCapital,
    required this.totalInvested,
    required this.totalInterest,
    required this.history,
    required this.calculatedAt,
  });

  factory InterestCalculatorResult.fromJson(Map<String, dynamic> json) =>
      _$InterestCalculatorResultFromJson(json);

  Map<String, dynamic> toJson() => _$InterestCalculatorResultToJson(this);

  // Calculer le rendement total en pourcentage
  double get totalReturnPercentage {
    if (totalInvested == 0) return 0;
    return ((finalCapital - totalInvested) / totalInvested) * 100;
  }

  // Calculer le rendement annuel moyen
  double get averageAnnualReturn {
    if (input.periods == 0) return 0;
    final years = input.periods / InterestCalculatorInput.getPeriodsPerYear(input.interestFrequency);
    if (years == 0) return 0;
    return totalReturnPercentage / years;
  }
}

// Classe pour stocker un scénario de comparaison
@JsonSerializable()
class InterestCalculatorScenario {
  final String name;
  final InterestCalculatorInput input;
  final InterestCalculatorResult? result;

  const InterestCalculatorScenario({
    required this.name,
    required this.input,
    this.result,
  });

  factory InterestCalculatorScenario.fromJson(Map<String, dynamic> json) =>
      _$InterestCalculatorScenarioFromJson(json);

  Map<String, dynamic> toJson() => _$InterestCalculatorScenarioToJson(this);

  InterestCalculatorScenario copyWith({
    String? name,
    InterestCalculatorInput? input,
    InterestCalculatorResult? result,
  }) {
    return InterestCalculatorScenario(
      name: name ?? this.name,
      input: input ?? this.input,
      result: result ?? this.result,
    );
  }
}
