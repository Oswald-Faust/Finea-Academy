import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/interest_calculator_model.dart';
import '../services/interest_calculator_service.dart';
import '../widgets/interest_calculator_chart.dart';

class InterestCalculatorScreen extends StatefulWidget {
  const InterestCalculatorScreen({super.key});

  @override
  State<InterestCalculatorScreen> createState() => _InterestCalculatorScreenState();
}

class _InterestCalculatorScreenState extends State<InterestCalculatorScreen>
    with TickerProviderStateMixin {
  // Contrôleurs de formulaire
  final _formKey = GlobalKey<FormState>();
  final _initialCapitalController = TextEditingController(text: '1000');
  final _recurringAmountController = TextEditingController(text: '100');
  final _interestRateController = TextEditingController(text: '5.0');
  final _periodsController = TextEditingController(text: '12');

  // État du formulaire
  Frequency _recurringFrequency = Frequency.monthly;
  Frequency _interestFrequency = Frequency.annually;
  InterestType _interestType = InterestType.compound;

  // Résultats
  InterestCalculatorResult? _result;
  bool _isCalculating = false;

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
  }

  @override
  void dispose() {
    _initialCapitalController.dispose();
    _recurringAmountController.dispose();
    _interestRateController.dispose();
    _periodsController.dispose();
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
          'Calculateur d\'Intérêt',
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
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 24),
              _buildInputSection(),
              const SizedBox(height: 24),
              _buildCalculateButton(),
              const SizedBox(height: 24),
              if (_result != null) _buildResultsSection(),
            ],
          ),
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
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF000D64).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.calculate,
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
                      'Simulateur d\'investissement',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Calculez la croissance de votre capital avec intérêts simples ou composés',
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
            'Paramètres de simulation',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 20),
          
          // Capital initial
          _buildInputField(
            controller: _initialCapitalController,
            label: 'Capital initial (€)',
            hint: '1000',
            icon: Icons.euro,
          ),
          
          const SizedBox(height: 16),
          
          // Investissement récurrent
          Row(
            children: [
              Expanded(
                flex: 2,
                child: _buildInputField(
                  controller: _recurringAmountController,
                  label: 'Investissement récurrent (€)',
                  hint: '100',
                  icon: Icons.repeat,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildFrequencyDropdown(
                  value: _recurringFrequency,
                  label: 'Fréquence',
                  onChanged: (value) {
                    setState(() {
                      _recurringFrequency = value!;
                    });
                  },
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Taux d'intérêt
          Row(
            children: [
              Expanded(
                flex: 2,
                child: _buildInputField(
                  controller: _interestRateController,
                  label: 'Taux d\'intérêt (%)',
                  hint: '5.0',
                  icon: Icons.percent,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildFrequencyDropdown(
                  value: _interestFrequency,
                  label: 'Périodicité du taux',
                  onChanged: (value) {
                    setState(() {
                      _interestFrequency = value!;
                    });
                  },
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Durée
          _buildInputField(
            controller: _periodsController,
            label: 'Nombre de mois',
            hint: '12',
            icon: Icons.schedule,
          ),
          
          const SizedBox(height: 20),
          
          // Type d'intérêt
          _buildInterestTypeSelector(),
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
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Ce champ est requis';
            }
            if (double.tryParse(value) == null) {
              return 'Veuillez entrer un nombre valide';
            }
            if (double.parse(value) < 0) {
              return 'La valeur doit être positive';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildFrequencyDropdown({
    required Frequency value,
    required String label,
    required void Function(Frequency?) onChanged,
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
        DropdownButtonFormField<Frequency>(
          initialValue: value,
          onChanged: onChanged,
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
          items: Frequency.values.map((frequency) {
            return DropdownMenuItem<Frequency>(
              value: frequency,
              child: Text(
                InterestCalculatorInput.getFrequencyLabel(frequency),
                style: const TextStyle(fontSize: 12),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildInterestTypeSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Type d\'intérêt',
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.8),
            fontSize: 14,
            fontWeight: FontWeight.w500,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () {
                  setState(() {
                    _interestType = InterestType.compound;
                  });
                },
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _interestType == InterestType.compound
                        ? Colors.blue.withValues(alpha: 0.2)
                        : Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _interestType == InterestType.compound
                          ? Colors.blue
                          : Colors.white.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        Icons.trending_up,
                        color: _interestType == InterestType.compound
                            ? Colors.blue
                            : Colors.white.withValues(alpha: 0.6),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Composé',
                        style: TextStyle(
                          color: _interestType == InterestType.compound
                              ? Colors.blue
                              : Colors.white.withValues(alpha: 0.8),
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Effet cumulé',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.6),
                          fontSize: 12,
                          fontFamily: 'Poppins',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: GestureDetector(
                onTap: () {
                  setState(() {
                    _interestType = InterestType.simple;
                  });
                },
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _interestType == InterestType.simple
                        ? Colors.orange.withValues(alpha: 0.2)
                        : Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _interestType == InterestType.simple
                          ? Colors.orange
                          : Colors.white.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        Icons.linear_scale,
                        color: _interestType == InterestType.simple
                            ? Colors.orange
                            : Colors.white.withValues(alpha: 0.6),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Simple',
                        style: TextStyle(
                          color: _interestType == InterestType.simple
                              ? Colors.orange
                              : Colors.white.withValues(alpha: 0.8),
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Sans cumul',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.6),
                          fontSize: 12,
                          fontFamily: 'Poppins',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
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
                    'Calculer',
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
    return FadeTransition(
      opacity: _fadeAnimation,
      child: Column(
        children: [
          _buildResultsSummary(),
          const SizedBox(height: 24),
          InterestCalculatorChart(result: _result!),
        ],
      ),
    );
  }

  Widget _buildResultsSummary() {
    if (_result == null) return const SizedBox.shrink();

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
          const Row(
            children: [
              Icon(Icons.analytics, color: Colors.blue, size: 24),
              SizedBox(width: 8),
              Text(
                'Résultats de simulation',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Poppins',
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          // Résultats principaux
          Row(
            children: [
              Expanded(
                child: _buildResultCard(
                  title: 'Capital final',
                  value: '${_result!.finalCapital.toStringAsFixed(2)} €',
                  icon: Icons.account_balance_wallet,
                  color: Colors.green,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildResultCard(
                  title: 'Total investi',
                  value: '${_result!.totalInvested.toStringAsFixed(2)} €',
                  icon: Icons.savings,
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
                  title: 'Intérêts gagnés',
                  value: '${_result!.totalInterest.toStringAsFixed(2)} €',
                  icon: Icons.trending_up,
                  color: Colors.orange,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildResultCard(
                  title: 'Rendement total',
                  value: '${_result!.totalReturnPercentage.toStringAsFixed(1)} %',
                  icon: Icons.percent,
                  color: Colors.purple,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildResultCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
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
              fontSize: 16,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
        ],
      ),
    );
  }

  void _calculate() {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isCalculating = true;
    });

    // Simulation d'un délai de calcul pour l'animation
    Future.delayed(const Duration(milliseconds: 500), () {
      final input = InterestCalculatorInput(
        initialCapital: double.parse(_initialCapitalController.text),
        recurringAmount: double.parse(_recurringAmountController.text),
        recurringFrequency: _recurringFrequency,
        interestRate: double.parse(_interestRateController.text) / 100,
        interestFrequency: _interestFrequency,
        periods: int.parse(_periodsController.text),
        interestType: _interestType,
      );

      final result = InterestCalculatorService.calculateGrowth(input);

      setState(() {
        _result = result;
        _isCalculating = false;
      });

      _animationController.forward();
    });
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
          'À propos de la calculatrice',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: const Text(
          'Cette calculatrice simule la croissance de votre capital avec :\n\n'
          '• Investissement initial\n'
          '• Investissements récurrents\n'
          '• Intérêts simples ou composés\n'
          '• Graphiques interactifs\n\n'
          'IMPORTANT :\n'
          '• La périodicité du taux détermine la fréquence des intérêts\n'
          '• Le nombre de périodes est toujours en mois\n'
          '• Les investissements récurrents sont convertis en montants mensuels',
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
