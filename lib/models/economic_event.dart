class EconomicEvent {
  final String date;
  final String time;
  final String currency;
  final String impact;
  final String event;
  final String actual;
  final String forecast;
  final String previous;

  EconomicEvent({
    required this.date,
    required this.time,
    required this.currency,
    required this.impact,
    required this.event,
    required this.actual,
    required this.forecast,
    required this.previous,
  });

  factory EconomicEvent.fromJson(Map<String, dynamic> json) {
    return EconomicEvent(
      date: json['date'] ?? '',
      time: json['time'] ?? '',
      currency: json['currency'] ?? '',
      impact: json['impact'] ?? 'low',
      event: json['event'] ?? '',
      actual: json['actual'] ?? '-',
      forecast: json['forecast'] ?? '-',
      previous: json['previous'] ?? '-',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'time': time,
      'currency': currency,
      'impact': impact,
      'event': event,
      'actual': actual,
      'forecast': forecast,
      'previous': previous,
    };
  }

  // Getter pour déterminer la couleur de l'impact
  String get impactColor {
    switch (impact.toLowerCase()) {
      case 'high':
        return '#FF5252'; // Rouge
      case 'medium':
        return '#FFA726'; // Orange
      case 'low':
        return '#FFD54F'; // Jaune
      default:
        return '#9E9E9E'; // Gris
    }
  }

  // Getter pour le libellé de l'impact
  String get impactLabel {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'Fort';
      case 'medium':
        return 'Moyen';
      case 'low':
        return 'Faible';
      default:
        return 'Inconnu';
    }
  }

  // Vérifier si l'événement a des données réelles
  bool get hasActualData {
    return actual != '-' && actual.isNotEmpty;
  }

  // Vérifier si l'événement a des prévisions
  bool get hasForecast {
    return forecast != '-' && forecast.isNotEmpty;
  }
}

class EconomicCalendarSummary {
  final int total;
  final int highImpact;
  final int mediumImpact;
  final int lowImpact;
  final List<String> currencies;
  final List<EconomicEvent> upcomingHighImpact;

  EconomicCalendarSummary({
    required this.total,
    required this.highImpact,
    required this.mediumImpact,
    required this.lowImpact,
    required this.currencies,
    required this.upcomingHighImpact,
  });

  factory EconomicCalendarSummary.fromJson(Map<String, dynamic> json) {
    return EconomicCalendarSummary(
      total: json['total'] ?? 0,
      highImpact: json['highImpact'] ?? 0,
      mediumImpact: json['mediumImpact'] ?? 0,
      lowImpact: json['lowImpact'] ?? 0,
      currencies: List<String>.from(json['currencies'] ?? []),
      upcomingHighImpact: (json['upcomingHighImpact'] as List?)
              ?.map((e) => EconomicEvent.fromJson(e))
              .toList() ??
          [],
    );
  }
}

