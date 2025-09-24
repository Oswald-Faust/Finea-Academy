import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/trading_data_model.dart';
import '../services/trading_api_service.dart';
import '../widgets/searchable_currency_pair_dropdown.dart';

class LotCalculatorScreen extends StatefulWidget {
  const LotCalculatorScreen({super.key});

  @override
  State<LotCalculatorScreen> createState() => _LotCalculatorScreenState();
}

class _LotCalculatorScreenState extends State<LotCalculatorScreen>
    with TickerProviderStateMixin {
  // Contrôleurs pour les inputs
  final _accountBalanceController = TextEditingController(text: '10000');
  final _riskPercentageController = TextEditingController(text: '2');
  final _stopLossController = TextEditingController(text: '50');

  // État du formulaire
  String _selectedPair = 'EUR_USD';
  AccountCurrency _accountCurrency = AccountCurrency.USD;
  bool _isLoading = false;
  bool _isCalculating = false;

  // Données en temps réel
  PriceData? _currentPrice;
  LotCalculationResult? _result;

  // Animation
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
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

    // Charger le prix initial
    _loadCurrentPrice();
    
    // Démarrer la simulation des prix
    TradingApiService.startPriceSimulation();
  }

  @override
  void dispose() {
    _accountBalanceController.dispose();
    _riskPercentageController.dispose();
    _stopLossController.dispose();
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
          'Calculateur de Lot',
          style: TextStyle(
            color: Colors.white,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline, color: Colors.white),
            onPressed: _showInfo,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 24),
            _buildCurrentPriceSection(),
            const SizedBox(height: 24),
            _buildInputSection(),
            const SizedBox(height: 24),
            _buildCalculateButton(),
            const SizedBox(height: 24),
            if (_result != null) _buildResultsSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF000D64).withValues(alpha: 0.2),
            const Color(0xFF1A237E).withValues(alpha: 0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF000D64).withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.analytics,
                  color: Colors.blue,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Calculateur de Taille de Position',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Calculez la taille de lot optimale pour vos trades',
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 14,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentPriceSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF000D64).withValues(alpha: 0.1),
            const Color(0xFF1A237E).withValues(alpha: 0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.trending_up, color: Colors.green, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Prix en temps réel',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Poppins',
                ),
              ),
              const Spacer(),
              if (_isLoading)
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildPairSelector(),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildCurrencySelector(),
              ),
            ],
          ),
          if (_currentPrice != null) ...[
            const SizedBox(height: 16),
            _buildPriceDisplay(),
          ],
        ],
      ),
    );
  }

  Widget _buildInputSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Paramètres de Trading',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 20),
          
          // Balance du compte
          _buildInputField(
            controller: _accountBalanceController,
            label: 'Balance du compte (${_accountCurrency.symbol})',
            hint: '10000',
            icon: Icons.account_balance_wallet,
          ),
          
          const SizedBox(height: 16),
          
          // Pourcentage de risque
          _buildInputField(
            controller: _riskPercentageController,
            label: 'Risque par trade (%)',
            hint: '2',
            icon: Icons.percent,
          ),
          
          const SizedBox(height: 16),
          
          // Stop Loss en pips
          _buildInputField(
            controller: _stopLossController,
            label: 'Stop Loss (pips)',
            hint: '50',
            icon: Icons.stop,
          ),
        ],
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.8),
            fontSize: 14,
            fontWeight: FontWeight.w500,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
          ],
          style: const TextStyle(
            color: Colors.white,
            fontFamily: 'Poppins',
          ),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: Colors.white.withValues(alpha: 0.5),
            ),
            prefixIcon: Icon(icon, color: Colors.blue),
            filled: true,
            fillColor: Colors.white.withValues(alpha: 0.05),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF000D64)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCalculateButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isCalculating ? null : _calculate,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF000D64),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 8,
          shadowColor: const Color(0xFF000D64).withValues(alpha: 0.4),
        ),
        child: _isCalculating 
          ? const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
                SizedBox(width: 12),
                Text(
                  'Calcul en cours...',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            )
          : const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.calculate, size: 20),
                SizedBox(width: 12),
                Text(
                  'Calculer la taille de lot',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
      ),
    );
  }

  Widget _buildResultsSection() {
    if (_result == null) return const SizedBox.shrink();

    return FadeTransition(
      opacity: _fadeAnimation,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF000D64).withValues(alpha: 0.1),
            const Color(0xFF1A237E).withValues(alpha: 0.1),
          ],
        ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.analytics, color: Colors.blue, size: 24),
                const SizedBox(width: 8),
                const Text(
                  'Résultats du calcul',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                  ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: _shareResults,
                  icon: const Icon(Icons.share, color: Colors.white),
                  tooltip: 'Partager les résultats',
                ),
              ],
            ),
            const SizedBox(height: 20),
            
            // Taille de lot recommandée (principal)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF000D64).withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF000D64).withValues(alpha: 0.3)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.analytics, color: Colors.blue, size: 32),
                  const SizedBox(height: 8),
                  const Text(
                    'Taille de lot recommandée',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _result!.formattedLotSize,
                    style: const TextStyle(
                      color: Colors.blue,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Poppins',
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${_result!.recommendedLotSize.toStringAsFixed(4)} lots',
                    style: TextStyle(
                      color: Colors.blue.withValues(alpha: 0.8),
                      fontSize: 12,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Détails du calcul
            Row(
              children: [
                Expanded(
                  child: _buildResultCard(
                    title: 'Risque effectif',
                    value: '${_result!.riskAmount.toStringAsFixed(2)} ${_accountCurrency.symbol}',
                    subtitle: '${_result!.actualRiskPercentage.toStringAsFixed(2)}%',
                    icon: Icons.warning,
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildResultCard(
                    title: 'Valeur du pip',
                    value: _result!.pipValue.toStringAsFixed(2),
                    subtitle: '${_accountCurrency.symbol}/pip',
                    icon: Icons.monetization_on,
                    color: Colors.blue,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            Row(
              children: [
                Expanded(
                  child: _buildResultCard(
                    title: 'Profit potentiel',
                    value: _result!.potentialProfit.toStringAsFixed(2),
                    subtitle: '${_accountCurrency.symbol} (R:R 1:${_result!.riskRewardRatio.toStringAsFixed(1)})',
                    icon: Icons.trending_up,
                    color: Colors.green,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildResultCard(
                    title: 'Prix d\'entrée',
                    value: _result!.entryPrice.toStringAsFixed(5),
                    subtitle: _selectedPair.replaceAll('_', '/'),
                    icon: Icons.input,
                    color: Colors.indigo,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 20),
            
            // Actions
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _copyToClipboard,
                    icon: const Icon(Icons.copy, size: 18),
                    label: const Text('Copier le lot'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue.withValues(alpha: 0.2),
                      foregroundColor: Colors.blue,
                      side: BorderSide(color: Colors.blue.withValues(alpha: 0.5)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _calculate(),
                    icon: const Icon(Icons.refresh, size: 18),
                    label: const Text('Recalculer'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green.withValues(alpha: 0.2),
                      foregroundColor: Colors.green,
                      side: BorderSide(color: Colors.green.withValues(alpha: 0.5)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    String? subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(
            title,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
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
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.6),
                fontSize: 10,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _copyToClipboard() {
    if (_result == null) return;
    
    Clipboard.setData(ClipboardData(text: _result!.recommendedLotSize.toStringAsFixed(4)));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Taille de lot copiée dans le presse-papiers !'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _shareResults() {
    if (_result == null) return;
    
    final text = '''
📊 Résultats du Calculateur de Lot - Finéa

Paire: ${_selectedPair.replaceAll('_', '/')}
Compte: ${_accountCurrency.symbol}
Balance: ${_result!.input.accountBalance.toStringAsFixed(2)} ${_accountCurrency.symbol}
Risque: ${_result!.input.riskPercentage}%

🎯 RÉSULTATS:
• Taille de lot: ${_result!.formattedLotSize}
• Lot exact: ${_result!.recommendedLotSize.toStringAsFixed(4)}
• Risque effectif: ${_result!.riskAmount.toStringAsFixed(2)} ${_accountCurrency.symbol} (${_result!.actualRiskPercentage.toStringAsFixed(2)}%)
• Valeur du pip: ${_result!.pipValue.toStringAsFixed(2)} ${_accountCurrency.symbol}
• Profit potentiel: ${_result!.potentialProfit.toStringAsFixed(2)} ${_accountCurrency.symbol}
• Ratio R:R: 1:${_result!.riskRewardRatio.toStringAsFixed(1)}

Prix d'entrée: ${_result!.entryPrice.toStringAsFixed(5)}
Calculé le: ${_result!.calculatedAt.toString().split('.')[0]}

Generated by Finéa Academy
    ''';
    
    // En production, utiliser share_plus package
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Résultats copiés ! Vous pouvez les partager.'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  // Nouvelles méthodes

  Widget _buildPairSelector() {
    return SearchableCurrencyPairDropdown(
      label: 'Paire de devises',
      value: _selectedPair,
      onChanged: (value) {
        setState(() {
          _selectedPair = value!;
        });
        _loadCurrentPrice();
      },
      currencyPairs: _getFilteredCurrencyPairs(),
    );
  }

  /// Filtre les paires de devises pour éviter les paires identiques
  List<CurrencyPair> _getFilteredCurrencyPairs() {
    // Retourner toutes les paires sauf celles avec des devises identiques
    return PopularCurrencyPairs.allPairs.where((pair) {
      return pair.baseCurrency != pair.quoteCurrency;
    }).toList();
  }

  Widget _buildCurrencySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Devise du compte',
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.8),
            fontSize: 14,
            fontWeight: FontWeight.w500,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<AccountCurrency>(
          value: _accountCurrency,
          onChanged: (value) {
            setState(() {
              _accountCurrency = value!;
            });
          },
          style: const TextStyle(
            color: Colors.white,
            fontFamily: 'Poppins',
          ),
          dropdownColor: const Color(0xFF2a2a3e),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white.withValues(alpha: 0.05),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF000D64)),
            ),
          ),
          items: AccountCurrency.values.map((currency) {
            return DropdownMenuItem<AccountCurrency>(
              value: currency,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(currency.flag),
                  const SizedBox(width: 8),
                  Text(
                    currency.symbol,
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildPriceDisplay() {
    if (_currentPrice == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'BID',
                  style: TextStyle(
                    color: Colors.red.withValues(alpha: 0.8),
                    fontSize: 12,
                    fontFamily: 'Poppins',
                  ),
                ),
                Text(
                  _currentPrice!.bid.toStringAsFixed(5),
                  style: const TextStyle(
                    color: Colors.red,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  'SPREAD',
                  style: TextStyle(
                    color: Colors.grey.withValues(alpha: 0.8),
                    fontSize: 12,
                    fontFamily: 'Poppins',
                  ),
                ),
                Text(
                  _currentPrice!.spread.toStringAsFixed(5),
                  style: const TextStyle(
                    color: Colors.grey,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  'ASK',
                  style: TextStyle(
                    color: Colors.green.withValues(alpha: 0.8),
                    fontSize: 12,
                    fontFamily: 'Poppins',
                  ),
                ),
                Text(
                  _currentPrice!.ask.toStringAsFixed(5),
                  style: const TextStyle(
                    color: Colors.green,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _loadCurrentPrice() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final priceData = await TradingApiService.getCurrentPrice(_selectedPair);
      setState(() {
        _currentPrice = priceData;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showError('Erreur lors du chargement des prix: $e');
    }
  }

  Future<void> _calculate() async {
    if (_isCalculating) return;

    setState(() {
      _isCalculating = true;
    });

    try {
      final accountBalance = double.tryParse(_accountBalanceController.text) ?? 0;
      final riskPercentage = double.tryParse(_riskPercentageController.text) ?? 2;
      final stopLossPips = double.tryParse(_stopLossController.text) ?? 0;

      if (accountBalance <= 0 || riskPercentage <= 0 || stopLossPips <= 0) {
        _showError('Veuillez remplir tous les champs avec des valeurs valides');
        return;
      }

      final input = LotCalculationInput(
        accountBalance: accountBalance,
        riskPercentage: riskPercentage,
        stopLossPips: stopLossPips,
        currencyPair: _selectedPair,
        accountCurrency: _accountCurrency,
      );

      final result = await TradingApiService.calculateOptimalLotSize(input);

      setState(() {
        _result = result;
        _isCalculating = false;
      });

      _animationController.forward();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Calcul effectué avec succès !'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      setState(() {
        _isCalculating = false;
      });
      _showError('Erreur lors du calcul: $e');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _showInfo() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1a1a2e),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Text(
          'À propos du calculateur de lot',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: const Text(
          'Ce calculateur vous aide à déterminer la taille de position optimale pour vos trades en fonction de :\n\n'
          '• Votre balance de compte\n'
          '• Le pourcentage de risque souhaité\n'
          '• La distance jusqu\'au stop loss\n'
          '• La valeur du pip\n\n'
          'Il calcule automatiquement le ratio risk:reward et le profit potentiel.',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Compris'),
          ),
        ],
      ),
    );
  }
}
