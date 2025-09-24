import 'dart:math' as math;
import '../models/interest_calculator_model.dart';

class InterestCalculatorService {
  /// Calcule la croissance du capital avec investissements récurrents et intérêts
  static InterestCalculatorResult calculateGrowth(InterestCalculatorInput input) {
    final history = <InterestCalculatorPeriodResult>[];
    
    double capital = input.initialCapital;
    double totalInvested = input.initialCapital;
    
    // Convertir le taux d'intérêt selon la fréquence
    final double periodInterestRate = _convertInterestRate(
      input.interestRate,
      input.interestFrequency,
      input.recurringFrequency,
    );
    
    // Calculer le montant récurrent selon la fréquence
    final double periodRecurringAmount = _convertRecurringAmount(
      input.recurringAmount,
      input.recurringFrequency,
      input.interestFrequency,
    );
    
    for (int i = 1; i <= input.periods; i++) {
      // Ajouter l'investissement récurrent
      capital += periodRecurringAmount;
      totalInvested += periodRecurringAmount;
      
      // Calculer les intérêts
      double interestEarned = 0;
      
      if (input.interestType == InterestType.compound) {
        // Intérêt composé : appliqué sur tout le capital actuel
        interestEarned = capital * periodInterestRate;
        capital += interestEarned;
      } else {
        // Intérêt simple : appliqué seulement sur le capital initial
        interestEarned = input.initialCapital * periodInterestRate;
        capital += interestEarned;
      }
      
      // Ajouter à l'historique
      history.add(InterestCalculatorPeriodResult(
        period: i,
        capital: capital,
        totalInvested: totalInvested,
        interestEarned: capital - totalInvested,
      ));
    }
    
    final totalInterest = capital - totalInvested;
    
    return InterestCalculatorResult(
      input: input,
      finalCapital: capital,
      totalInvested: totalInvested,
      totalInterest: totalInterest,
      history: history,
      calculatedAt: DateTime.now(),
    );
  }
  
  /// Convertit le taux d'intérêt selon les fréquences
  static double _convertInterestRate(
    double annualRate,
    Frequency interestFrequency,
    Frequency calculationFrequency,
  ) {
    final interestPeriodsPerYear = InterestCalculatorInput.getPeriodsPerYear(interestFrequency);
    final calculationPeriodsPerYear = InterestCalculatorInput.getPeriodsPerYear(calculationFrequency);
    
    // Convertir le taux annuel en taux par période d'intérêt
    final ratePerInterestPeriod = annualRate / interestPeriodsPerYear;
    
    // Ajuster selon la fréquence de calcul
    final periodsRatio = interestPeriodsPerYear / calculationPeriodsPerYear;
    
    return ratePerInterestPeriod * periodsRatio;
  }
  
  /// Convertit le montant récurrent selon les fréquences
  static double _convertRecurringAmount(
    double amount,
    Frequency recurringFrequency,
    Frequency calculationFrequency,
  ) {
    final recurringPeriodsPerYear = InterestCalculatorInput.getPeriodsPerYear(recurringFrequency);
    final calculationPeriodsPerYear = InterestCalculatorInput.getPeriodsPerYear(calculationFrequency);
    
    // Convertir le montant annuel
    final annualAmount = amount * recurringPeriodsPerYear;
    
    // Ajuster selon la fréquence de calcul
    return annualAmount / calculationPeriodsPerYear;
  }
  
  /// Compare plusieurs scénarios
  static List<InterestCalculatorResult> compareScenarios(List<InterestCalculatorInput> inputs) {
    return inputs.map((input) => calculateGrowth(input)).toList();
  }
  
  /// Génère un résumé comparatif
  static Map<String, dynamic> generateComparison(List<InterestCalculatorResult> results) {
    if (results.isEmpty) return {};
    
    final bestReturn = results.reduce(
      (a, b) => a.totalReturnPercentage > b.totalReturnPercentage ? a : b,
    );
    
    final highestFinalCapital = results.reduce(
      (a, b) => a.finalCapital > b.finalCapital ? a : b,
    );
    
    final bestAverageReturn = results.reduce(
      (a, b) => a.averageAnnualReturn > b.averageAnnualReturn ? a : b,
    );
    
    return {
      'bestReturn': bestReturn,
      'highestFinalCapital': highestFinalCapital,
      'bestAverageReturn': bestAverageReturn,
      'totalScenarios': results.length,
    };
  }
  
  /// Calcule la valeur future avec intérêt composé (formule standard)
  static double calculateFutureValue({
    required double presentValue,
    required double rate,
    required int periods,
    required double payment,
    required bool isCompound,
  }) {
    if (isCompound) {
      // Formule des annuités avec intérêt composé
      if (rate == 0) {
        return presentValue + (payment * periods);
      }
      
      final futureValuePV = presentValue * math.pow(1 + rate, periods);
      final futureValuePMT = payment * ((math.pow(1 + rate, periods) - 1) / rate);
      
      return futureValuePV + futureValuePMT;
    } else {
      // Intérêt simple
      final totalPayments = payment * periods;
      final simpleInterest = presentValue * rate * periods;
      
      return presentValue + totalPayments + simpleInterest;
    }
  }
}
