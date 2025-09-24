class PositioningAlert {
  final String id;
  final DateTime timestamp;
  final String side; // SELL, CLOSED, INFO
  final String symbol;
  final double price;
  final double? quantity;
  final double? pnl;
  final String note;
  final String? stopLoss;
  final String? takeProfit;
  final String? previousStopLoss;

  PositioningAlert({
    required this.id,
    required this.timestamp,
    required this.side,
    required this.symbol,
    required this.price,
    this.quantity,
    this.pnl,
    required this.note,
    this.stopLoss,
    this.takeProfit,
    this.previousStopLoss,
  });

  factory PositioningAlert.fromGoogleSheetsRow(List<dynamic> row) {
    // Extraire l'ID depuis la note
    String id = '';
    String? stopLoss;
    String? takeProfit;
    String? previousStopLoss;

    if (row.length > 6 && row[6] != null) {
      final note = row[6].toString();
      id = _extractId(note);
      
      if (row[1] == 'SELL') {
        stopLoss = _extractStopLoss(note);
        takeProfit = _extractTakeProfit(note);
      } else if (row[1] == 'INFO') {
        previousStopLoss = _extractPreviousStopLoss(note);
        stopLoss = _extractNewStopLoss(note);
      }
    }

    return PositioningAlert(
      id: id,
      timestamp: _parseTimestamp(row[0]),
      side: row[1]?.toString() ?? '',
      symbol: row[2]?.toString() ?? '',
      price: _parseDouble(row[3]),
      quantity: row[4] != null && row[4].toString().isNotEmpty ? _parseDouble(row[4]) : null,
      pnl: row[5] != null && row[5].toString().isNotEmpty ? _parseDouble(row[5]) : null,
      note: row[6]?.toString() ?? '',
      stopLoss: stopLoss,
      takeProfit: takeProfit,
      previousStopLoss: previousStopLoss,
    );
  }

  static String _extractId(String note) {
    final idMatch = RegExp(r'id:(\d+)').firstMatch(note);
    return idMatch?.group(1) ?? '';
  }

  static String? _extractStopLoss(String note) {
    final slMatch = RegExp(r'SL:([0-9.]+)').firstMatch(note);
    return slMatch?.group(1);
  }

  static String? _extractTakeProfit(String note) {
    final tpMatch = RegExp(r'TP:([0-9.]+)').firstMatch(note);
    return tpMatch?.group(1);
  }

  static String? _extractPreviousStopLoss(String note) {
    final prevMatch = RegExp(r'SL ([0-9.]+) →').firstMatch(note);
    return prevMatch?.group(1);
  }

  static String? _extractNewStopLoss(String note) {
    final newMatch = RegExp(r'→ ([0-9.]+)').firstMatch(note);
    return newMatch?.group(1);
  }

  static DateTime _parseTimestamp(dynamic timestamp) {
    if (timestamp == null) return DateTime.now();
    
    try {
      // Format: 2025-09-14 17:01:25
      return DateTime.parse(timestamp.toString());
    } catch (e) {
      return DateTime.now();
    }
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    
    try {
      // Remplacer les virgules par des points pour la conversion
      final stringValue = value.toString().replaceAll(',', '.');
      return double.parse(stringValue);
    } catch (e) {
      return 0.0;
    }
  }

  bool get isOpenPosition => side == 'SELL';
  bool get isClosedPosition => side == 'CLOSED';
  bool get isInfoUpdate => side == 'INFO';

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'timestamp': timestamp.toIso8601String(),
      'side': side,
      'symbol': symbol,
      'price': price,
      'quantity': quantity,
      'pnl': pnl,
      'note': note,
      'stopLoss': stopLoss,
      'takeProfit': takeProfit,
      'previousStopLoss': previousStopLoss,
    };
  }

  @override
  String toString() {
    return 'PositioningAlert(id: $id, side: $side, symbol: $symbol, price: $price)';
  }
}
