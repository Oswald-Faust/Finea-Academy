import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/interest_calculator_model.dart';

class InterestCalculatorChart extends StatefulWidget {
  final InterestCalculatorResult result;
  final bool showInvestedAmount;
  final bool showTotalCapital;

  const InterestCalculatorChart({
    super.key,
    required this.result,
    this.showInvestedAmount = true,
    this.showTotalCapital = true,
  });

  @override
  State<InterestCalculatorChart> createState() => _InterestCalculatorChartState();
}

class _InterestCalculatorChartState extends State<InterestCalculatorChart> {
  List<Color> get availableColors => const [
        Colors.blue,
        Colors.green,
        Colors.orange,
        Colors.purple,
        Colors.red,
        Colors.teal,
        Colors.pink,
        Colors.indigo,
      ];

  @override
  Widget build(BuildContext context) {
    if (widget.result.history.isEmpty) {
      return const Center(
        child: Text(
          'Aucune donnée à afficher',
          style: TextStyle(color: Colors.grey),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Titre et légende
          _buildHeader(),
          const SizedBox(height: 16),
          
          // Graphique
          SizedBox(
            height: 300,
            child: LineChart(
              _buildChartData(),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Légende interactive
          _buildLegend(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        const Icon(
          Icons.trending_up,
          color: Colors.white,
          size: 24,
        ),
        const SizedBox(width: 8),
        const Text(
          'Évolution du capital',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
        const Spacer(),
        IconButton(
          onPressed: () => _showChartOptions(),
          icon: const Icon(Icons.settings, color: Colors.white),
        ),
      ],
    );
  }

  Widget _buildLegend() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        if (widget.showInvestedAmount)
          _buildLegendItem(
            color: Colors.blue,
            label: 'Argent investi',
            value: '${widget.result.totalInvested.toStringAsFixed(2)} €',
          ),
        if (widget.showTotalCapital)
          _buildLegendItem(
            color: Colors.green,
            label: 'Capital total',
            value: '${widget.result.finalCapital.toStringAsFixed(2)} €',
          ),
      ],
    );
  }

  Widget _buildLegendItem({
    required Color color,
    required String label,
    required String value,
  }) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.8),
                fontSize: 12,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }

  LineChartData _buildChartData() {
    final List<LineChartBarData> lineBarsData = [];

    // Ligne des montants investis
    if (widget.showInvestedAmount) {
      lineBarsData.add(
        LineChartBarData(
          spots: widget.result.history
              .map((period) => FlSpot(
                    period.period.toDouble(),
                    period.totalInvested,
                  ))
              .toList(),
          isCurved: true,
          gradient: LinearGradient(colors: [Colors.blue, Colors.blue]),
          barWidth: 2,
          dotData: const FlDotData(show: false),
          belowBarData: BarAreaData(
            show: true,
            gradient: LinearGradient(
              colors: [Colors.blue.withValues(alpha: 0.1), Colors.blue.withValues(alpha: 0.1)],
            ),
          ),
        ),
      );
    }

    // Ligne du capital total
    if (widget.showTotalCapital) {
      lineBarsData.add(
        LineChartBarData(
          spots: widget.result.history
              .map((period) => FlSpot(
                    period.period.toDouble(),
                    period.capital,
                  ))
              .toList(),
          isCurved: true,
          gradient: LinearGradient(colors: [Colors.green, Colors.green]),
          barWidth: 3,
          dotData: const FlDotData(
            show: true,
          ),
          belowBarData: BarAreaData(
            show: true,
            gradient: LinearGradient(
              colors: [Colors.green.withValues(alpha: 0.1), Colors.green.withValues(alpha: 0.1)],
            ),
          ),
        ),
      );
    }

    return LineChartData(
      lineBarsData: lineBarsData,
      titlesData: FlTitlesData(
        bottomTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            reservedSize: 30,
            interval: _calculateInterval(widget.result.history.length),
            getTitlesWidget: (value, meta) {
              return Text(
                value.toInt().toString(),
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 12,
                ),
              );
            },
          ),
        ),
        leftTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            reservedSize: 60,
            getTitlesWidget: (value, meta) {
              return Text(
                _formatCurrency(value),
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 10,
                ),
              );
            },
          ),
        ),
        topTitles: const AxisTitles(
          sideTitles: SideTitles(showTitles: false),
        ),
        rightTitles: const AxisTitles(
          sideTitles: SideTitles(showTitles: false),
        ),
      ),
      gridData: FlGridData(
        show: true,
        drawVerticalLine: true,
        drawHorizontalLine: true,
        horizontalInterval: null,
        verticalInterval: null,
        getDrawingHorizontalLine: (value) {
          return FlLine(
            color: Colors.white.withValues(alpha: 0.1),
            strokeWidth: 1,
          );
        },
        getDrawingVerticalLine: (value) {
          return FlLine(
            color: Colors.white.withValues(alpha: 0.1),
            strokeWidth: 1,
          );
        },
      ),
      borderData: FlBorderData(
        show: true,
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      lineTouchData: LineTouchData(
        enabled: true,
        touchTooltipData: LineTouchTooltipData(
          getTooltipColor: (touchedSpot) => const Color(0xFF2a2a3e),
          tooltipRoundedRadius: 8,
          getTooltipItems: (List<LineBarSpot> touchedBarSpots) {
            return touchedBarSpots.map((barSpot) {
              final flSpot = barSpot;
              final period = flSpot.x.toInt();
              final value = flSpot.y;
              
              String label;
              Color color;
              
              if (barSpot.barIndex == 0 && widget.showInvestedAmount) {
                label = 'Investi';
                color = Colors.blue;
              } else {
                label = 'Capital';
                color = Colors.green;
              }
              
              return LineTooltipItem(
                '$label\nPériode $period\n${_formatCurrency(value)}',
                TextStyle(
                  color: color,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              );
            }).toList();
          },
        ),
      ),
    );
  }

  String _formatCurrency(double value) {
    if (value >= 1000000) {
      return '${(value / 1000000).toStringAsFixed(1)}M€';
    } else if (value >= 1000) {
      return '${(value / 1000).toStringAsFixed(1)}k€';
    } else {
      return '${value.toStringAsFixed(0)}€';
    }
  }

  double _calculateInterval(int dataPoints) {
    if (dataPoints <= 10) return 1;
    if (dataPoints <= 50) return 5;
    if (dataPoints <= 100) return 10;
    return (dataPoints / 10).roundToDouble();
  }

  void _showChartOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1a1a2e),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Options du graphique',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            ListTile(
              leading: const Icon(Icons.share, color: Colors.white),
              title: const Text(
                'Partager le graphique',
                style: TextStyle(color: Colors.white),
              ),
              onTap: () {
                Navigator.pop(context);
                _shareChart();
              },
            ),
            ListTile(
              leading: const Icon(Icons.download, color: Colors.white),
              title: const Text(
                'Exporter en image',
                style: TextStyle(color: Colors.white),
              ),
              onTap: () {
                Navigator.pop(context);
                _exportChart();
              },
            ),
            ListTile(
              leading: const Icon(Icons.table_chart, color: Colors.white),
              title: const Text(
                'Voir le tableau détaillé',
                style: TextStyle(color: Colors.white),
              ),
              onTap: () {
                Navigator.pop(context);
                _showDetailedTable();
              },
            ),
          ],
        ),
      ),
    );
  }

  void _shareChart() {
    // TODO: Implémenter le partage du graphique
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Fonctionnalité de partage en cours de développement'),
        backgroundColor: Colors.orange,
      ),
    );
  }

  void _exportChart() {
    // TODO: Implémenter l'export du graphique en image
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Export en cours de développement'),
        backgroundColor: Colors.orange,
      ),
    );
  }

  void _showDetailedTable() {
    // TODO: Afficher le tableau détaillé dans un modal
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1a1a2e),
        title: const Text(
          'Tableau détaillé',
          style: TextStyle(color: Colors.white),
        ),
        content: SizedBox(
          width: double.maxFinite,
          height: 400,
          child: SingleChildScrollView(
            child: DataTable(
              columns: const [
                DataColumn(label: Text('Période', style: TextStyle(color: Colors.white))),
                DataColumn(label: Text('Investi', style: TextStyle(color: Colors.white))),
                DataColumn(label: Text('Capital', style: TextStyle(color: Colors.white))),
                DataColumn(label: Text('Intérêts', style: TextStyle(color: Colors.white))),
              ],
              rows: widget.result.history.map((period) {
                return DataRow(
                  cells: [
                    DataCell(Text(period.period.toString(), style: const TextStyle(color: Colors.white))),
                    DataCell(Text('${period.totalInvested.toStringAsFixed(2)}€', style: const TextStyle(color: Colors.white))),
                    DataCell(Text('${period.capital.toStringAsFixed(2)}€', style: const TextStyle(color: Colors.white))),
                    DataCell(Text('${period.interestEarned.toStringAsFixed(2)}€', style: const TextStyle(color: Colors.white))),
                  ],
                );
              }).toList(),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fermer'),
          ),
        ],
      ),
    );
  }
}
