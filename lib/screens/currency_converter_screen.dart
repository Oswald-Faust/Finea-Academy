import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/currency_model.dart';
import '../services/currency_service.dart';

class CurrencyConverterScreen extends StatefulWidget {
  const CurrencyConverterScreen({super.key});

  @override
  State<CurrencyConverterScreen> createState() => _CurrencyConverterScreenState();
}

class _CurrencyConverterScreenState extends State<CurrencyConverterScreen> 
    with SingleTickerProviderStateMixin {
  
  // Controllers et variables d'état
  final TextEditingController _amountController = TextEditingController(text: '100');
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  
  // État du convertisseur
  CurrencyConverterState _state = CurrencyConverterState(
    fromCurrency: SupportedCurrencies.currencies[0], // EUR
    toCurrency: SupportedCurrencies.currencies[1],   // USD
    amount: 100.0,
  );

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _loadInitialData();
  }

  void _initializeAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    
    _animationController.forward();
  }

  void _loadInitialData() {
    _convertCurrency();
    _loadChartData();
  }

  Future<void> _convertCurrency() async {
    if (_state.amount <= 0) return;
    
    setState(() {
      _state = _state.copyWith(loadingState: LoadingState.loading);
    });

    try {
      final result = await CurrencyService.convertCurrency(
        from: _state.fromCurrency.code,
        to: _state.toCurrency.code,
        amount: _state.amount,
      );

      setState(() {
        _state = _state.copyWith(
          loadingState: LoadingState.success,
          conversionResult: result,
          errorMessage: null,
        );
      });
    } catch (e) {
      setState(() {
        _state = _state.copyWith(
          loadingState: LoadingState.error,
          errorMessage: e.toString(),
        );
      });
    }
  }

  Future<void> _loadChartData() async {
    try {
      final chartData = await CurrencyService.getChartData(
        baseCurrency: _state.fromCurrency.code,
        targetCurrency: _state.toCurrency.code,
        period: _state.chartPeriod,
      );

      setState(() {
        _state = _state.copyWith(chartData: chartData);
      });
    } catch (e) {
      print('Erreur lors du chargement du graphique: $e');
    }
  }

  void _swapCurrencies() async {
    final temp = _state.fromCurrency;
    setState(() {
      _state = _state.copyWith(
        fromCurrency: _state.toCurrency,
        toCurrency: temp,
      );
    });
    
    HapticFeedback.mediumImpact();
    await _convertCurrency();
    await _loadChartData();
  }

  void _onAmountChanged(String value) {
    final amount = double.tryParse(value);
    if (amount != null && amount > 0) {
      setState(() {
        _state = _state.copyWith(amount: amount);
      });
    }
  }

  void _onFromCurrencyChanged(Currency? currency) async {
    if (currency != null && currency != _state.fromCurrency) {
      setState(() {
        _state = _state.copyWith(fromCurrency: currency);
      });
      await _convertCurrency();
      await _loadChartData();
    }
  }

  void _onToCurrencyChanged(Currency? currency) async {
    if (currency != null && currency != _state.toCurrency) {
      setState(() {
        _state = _state.copyWith(toCurrency: currency);
      });
      await _convertCurrency();
      await _loadChartData();
    }
  }

  void _onChartPeriodChanged(ChartPeriod period) async {
    if (period != _state.chartPeriod) {
      setState(() {
        _state = _state.copyWith(chartPeriod: period);
      });
      await _loadChartData();
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f23),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Convertisseur de devise',
          style: TextStyle(
            color: Colors.white,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Bloc principal de conversion
              _buildConversionCard(),
              
              const SizedBox(height: 20),
              
              // Bloc du graphique
              _buildChartCard(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildConversionCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.purple.withOpacity(0.1),
            Colors.blue.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Titre
          const Text(
            'Convertisseur de devise',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Montant à convertir
          _buildAmountInput(),
          
          const SizedBox(height: 16),
          
          // Ligne des devises avec bouton d'inversion
          _buildCurrencyRow(),
          
          const SizedBox(height: 20),
          
          // Bouton Convertir
          _buildConvertButton(),
          
          const SizedBox(height: 20),
          
          // Résultat de la conversion
          _buildConversionResult(),
        ],
      ),
    );
  }

  Widget _buildAmountInput() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Montant à convertir',
          style: TextStyle(
            color: Colors.white70,
            fontSize: 14,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Colors.white.withOpacity(0.2),
              width: 1,
            ),
          ),
          child: TextFormField(
            controller: _amountController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w600,
              fontFamily: 'Poppins',
            ),
            decoration: const InputDecoration(
              hintText: '100',
              hintStyle: TextStyle(
                color: Colors.white38,
                fontFamily: 'Poppins',
              ),
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
            onChanged: _onAmountChanged,
            onFieldSubmitted: (_) => _convertCurrency(),
          ),
        ),
      ],
    );
  }

  Widget _buildCurrencyRow() {
    return Row(
      children: [
        // Devise source
        Expanded(child: _buildCurrencyDropdown(
          label: 'Devise source',
          value: _state.fromCurrency,
          onChanged: _onFromCurrencyChanged,
        )),
        
        const SizedBox(width: 12),
        
        // Bouton d'inversion
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: Colors.purple.withOpacity(0.2),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Colors.purple.withOpacity(0.3),
              width: 1,
            ),
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: _swapCurrencies,
              borderRadius: BorderRadius.circular(12),
              child: const Icon(
                Icons.swap_horiz,
                color: Colors.white,
                size: 24,
              ),
            ),
          ),
        ),
        
        const SizedBox(width: 12),
        
        // Devise cible
        Expanded(child: _buildCurrencyDropdown(
          label: 'Devise cible',
          value: _state.toCurrency,
          onChanged: _onToCurrencyChanged,
        )),
      ],
    );
  }

  Widget _buildCurrencyDropdown({
    required String label,
    required Currency value,
    required void Function(Currency?) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Colors.white.withOpacity(0.2),
              width: 1,
            ),
          ),
          child: DropdownButtonFormField<Currency>(
            value: value,
            decoration: const InputDecoration(
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            dropdownColor: const Color(0xFF1a1a3a),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w500,
              fontFamily: 'Poppins',
            ),
            icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white70),
            items: SupportedCurrencies.currencies.map((currency) {
              return DropdownMenuItem<Currency>(
                value: currency,
                child: Row(
                  children: [
                    Text(
                      currency.code,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      currency.symbol,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }

  Widget _buildConvertButton() {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        onPressed: _state.loadingState == LoadingState.loading ? null : _convertCurrency,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.purple,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
        child: _state.loadingState == LoadingState.loading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : const Text(
                'Convertir',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  fontFamily: 'Poppins',
                ),
              ),
      ),
    );
  }

  Widget _buildConversionResult() {
    if (_state.loadingState == LoadingState.error) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.red.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.red.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.red, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _state.errorMessage ?? 'Erreur lors de la conversion',
                style: const TextStyle(
                  color: Colors.red,
                  fontSize: 14,
                  fontFamily: 'Poppins',
                ),
              ),
            ),
          ],
        ),
      );
    }

    if (!_state.hasValidConversion) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.green.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.green.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          // Résultat principal
          Text(
            _state.formattedConversionResult,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 8),
          
          // Taux de change
          Text(
            _state.formattedCurrentRate,
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 14,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 8),
          
          // Note sur la mise à jour
          Text(
            'Taux mis à jour en temps réel.',
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 12,
              fontStyle: FontStyle.italic,
              fontFamily: 'Poppins',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChartCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.blue.withOpacity(0.1),
            Colors.purple.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // En-tête avec titre et toggle période
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Évolution du taux de change',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Poppins',
                ),
              ),
              _buildPeriodToggle(),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Graphique
          SizedBox(
            height: 200,
            child: _buildChart(),
          ),
          
          const SizedBox(height: 16),
          
          // Statistiques
          if (_state.hasChartData) _buildChartStats(),
        ],
      ),
    );
  }

  Widget _buildPeriodToggle() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: ChartPeriod.values.map((period) {
          final isSelected = period == _state.chartPeriod;
          return GestureDetector(
            onTap: () => _onChartPeriodChanged(period),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: isSelected ? Colors.purple : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                period.label,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  fontFamily: 'Poppins',
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildChart() {
    if (!_state.hasChartData) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Colors.purple),
        ),
      );
    }

    final spots = _state.chartData!.points.asMap().entries.map((entry) {
      return FlSpot(entry.key.toDouble(), entry.value.rate);
    }).toList();

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: (_state.chartData!.maxRate - _state.chartData!.minRate) / 4,
          getDrawingHorizontalLine: (value) {
            return FlLine(
              color: Colors.white.withOpacity(0.1),
              strokeWidth: 1,
            );
          },
        ),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 60,
              interval: (_state.chartData!.maxRate - _state.chartData!.minRate) / 4,
              getTitlesWidget: (value, meta) {
                return Text(
                  value.toStringAsFixed(4),
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 10,
                    fontFamily: 'Poppins',
                  ),
                );
              },
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              interval: spots.length > 10 ? spots.length / 5 : 1,
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index >= 0 && index < _state.chartData!.points.length) {
                  final date = _state.chartData!.points[index].date;
                  return Text(
                    '${date.day}/${date.month}',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 10,
                      fontFamily: 'Poppins',
                    ),
                  );
                }
                return const Text('');
              },
            ),
          ),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        minX: 0,
        maxX: spots.length - 1.toDouble(),
        minY: _state.chartData!.minRate * 0.999,
        maxY: _state.chartData!.maxRate * 1.001,
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            gradient: LinearGradient(
              colors: [
                Colors.purple,
                Colors.blue,
              ],
            ),
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: FlDotData(
              show: false,
            ),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.purple.withOpacity(0.3),
                  Colors.blue.withOpacity(0.1),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChartStats() {
    final data = _state.chartData!;
    final isPositive = data.changePercentage >= 0;
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _buildStatItem(
          'Min',
          data.minRate.toStringAsFixed(4),
          Colors.red,
        ),
        _buildStatItem(
          'Max',
          data.maxRate.toStringAsFixed(4),
          Colors.green,
        ),
        _buildStatItem(
          'Variation',
          '${isPositive ? '+' : ''}${data.changePercentage.toStringAsFixed(2)}%',
          isPositive ? Colors.green : Colors.red,
        ),
      ],
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.6),
            fontSize: 12,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 14,
            fontWeight: FontWeight.w600,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }
}
