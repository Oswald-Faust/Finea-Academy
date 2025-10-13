class PortfolioData {
  final String date;
  final double balance;
  final double equity;
  final double profit;
  final double growth;
  final double drawdown;

  PortfolioData({
    required this.date,
    required this.balance,
    required this.equity,
    required this.profit,
    required this.growth,
    required this.drawdown,
  });

  factory PortfolioData.fromJson(Map<String, dynamic> json) {
    return PortfolioData(
      date: json['date'] ?? '',
      balance: (json['balance'] ?? 0.0).toDouble(),
      equity: (json['equity'] ?? json['balance'] ?? 0.0).toDouble(), // Fallback sur balance si pas d'equity
      profit: (json['profit'] ?? 0.0).toDouble(),
      growth: (json['growth'] ?? json['growthEquity'] ?? 0.0).toDouble(), // Fallback sur growthEquity
      drawdown: (json['drawdown'] ?? 0.0).toDouble(),
    );
  }
  
  // Méthode spécifique pour les données MyFXBook
  factory PortfolioData.fromMyfxbookJson(Map<String, dynamic> json) {
    final balance = (json['balance'] ?? 0.0).toDouble();
    final profit = (json['profit'] ?? 0.0).toDouble();
    
    // Pour MyFXBook, le profit dans les données daily est déjà le profit cumulé
    // depuis le début du compte, pas le profit du jour
    final initialBalance = balance - profit; // Balance initiale du compte
    final growth = initialBalance > 0 ? (profit / initialBalance) * 100 : 0.0;
    
    return PortfolioData(
      date: json['date'] ?? '',
      balance: balance,
      equity: balance, // Pour MyFXBook, equity = balance généralement
      profit: profit, // Profit cumulé depuis le début
      growth: growth,
      drawdown: 0.0, // Pas disponible dans les données MyFXBook
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'balance': balance,
      'equity': equity,
      'profit': profit,
      'growth': growth,
      'drawdown': drawdown,
    };
  }
}

class PortfolioInfo {
  final String id;
  final String name;
  final double currentBalance;
  final double currentEquity;
  final double totalProfit;
  final double totalGrowth;
  final double maxDrawdown;
  final String broker;
  final String currency;
  final String status;

  PortfolioInfo({
    required this.id,
    required this.name,
    required this.currentBalance,
    required this.currentEquity,
    required this.totalProfit,
    required this.totalGrowth,
    required this.maxDrawdown,
    required this.broker,
    required this.currency,
    required this.status,
  });

  factory PortfolioInfo.fromJson(Map<String, dynamic> json) {
    return PortfolioInfo(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      currentBalance: (json['balance'] ?? 0.0).toDouble(),
      currentEquity: (json['equity'] ?? 0.0).toDouble(),
      totalProfit: (json['profit'] ?? 0.0).toDouble(),
      totalGrowth: (json['gain'] ?? 0.0).toDouble(),
      maxDrawdown: (json['drawdown'] ?? 0.0).toDouble(),
      broker: json['broker'] ?? '',
      currency: json['currency'] ?? '',
      status: json['status'] ?? '',
    );
  }
}
