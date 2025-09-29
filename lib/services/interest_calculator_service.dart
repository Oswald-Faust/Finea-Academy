import 'dart:math' as math;
import '../models/interest_calculator_model.dart';

class InterestCalculatorService {
  /// Calcule la croissance du capital avec investissements récurrents et intérêts
  static InterestCalculatorResult calculateGrowth(InterestCalculatorInput input) {
    final history = <InterestCalculatorPeriodResult>[];
    
    double capital = input.initialCapital;
    double totalInvested = input.initialCapital;
    
    // Convertir le taux d'intérêt selon la fréquence (toujours en mensuel)
    final double monthlyInterestRate = _convertToMonthlyRate(
      input.interestRate,
      input.interestFrequency,
    );
    
    // Calculer le montant récurrent mensuel
    final double monthlyRecurringAmount = _convertToMonthlyAmount(
      input.recurringAmount,
      input.recurringFrequency,
    );
    
    // Le nombre de périodes est toujours en mois
    for (int month = 1; month <= input.periods; month++) {
      // Ajouter l'investissement récurrent mensuel
      capital += monthlyRecurringAmount;
      totalInvested += monthlyRecurringAmount;
      
      // Calculer les intérêts
      double interestEarned = 0;
      
      if (input.interestType == InterestType.compound) {
        // Intérêt composé : appliqué sur tout le capital actuel
        interestEarned = capital * monthlyInterestRate;
        capital += interestEarned;
      } else {
        // Intérêt simple : appliqué seulement sur le capital initial
        interestEarned = input.initialCapital * monthlyInterestRate;
        capital += interestEarned;
      }
      
      // Ajouter à l'historique
      history.add(InterestCalculatorPeriodResult(
        period: month,
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
  
  /// Convertit le taux d'intérêt en taux mensuel
  static double _convertToMonthlyRate(
    double annualRate,
    Frequency interestFrequency,
  ) {
    final periodsPerYear = InterestCalculatorInput.getPeriodsPerYear(interestFrequency);
    
    // Convertir le taux annuel en taux mensuel
    // Si le taux est annuel, on le divise par 12
    // Si le taux est trimestriel, on le divise par 3
    // Si le taux est mensuel, on le garde tel quel
    return annualRate / (12 / periodsPerYear);
  }
  
  /// Convertit le montant récurrent en montant mensuel
  static double _convertToMonthlyAmount(
    double amount,
    Frequency recurringFrequency,
  ) {
    final periodsPerYear = InterestCalculatorInput.getPeriodsPerYear(recurringFrequency);
    
    // Convertir le montant en montant mensuel
    // Si c'est annuel, on divise par 12
    // Si c'est trimestriel, on divise par 3
    // Si c'est mensuel, on garde tel quel
    return amount / (12 / periodsPerYear);
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
