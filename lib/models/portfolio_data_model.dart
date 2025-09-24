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
      equity: (json['equity'] ?? 0.0).toDouble(),
      profit: (json['profit'] ?? 0.0).toDouble(),
      growth: (json['growth'] ?? 0.0).toDouble(),
      drawdown: (json['drawdown'] ?? 0.0).toDouble(),
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
