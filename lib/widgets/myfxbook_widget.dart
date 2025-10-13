import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/myfxbook_api_service.dart';
import '../models/portfolio_data_model.dart';
import 'portfolio_chart_widget.dart';

class MyfxbookWidget extends StatefulWidget {
  final String portfolioId;
  final double height;
  final double width;

  const MyfxbookWidget({
    super.key,
    required this.portfolioId,
    this.height = 400,
    this.width = double.infinity,
  });

  @override
  State<MyfxbookWidget> createState() => _MyfxbookWidgetState();
}

class _MyfxbookWidgetState extends State<MyfxbookWidget> {
  List<PortfolioData> _portfolioData = [];
  PortfolioInfo? _portfolioInfo;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPortfolioData();
  }

  Future<void> _loadPortfolioData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Récupérer les informations du portfolio
      final portfolioInfo = await MyfxbookApiService.getPortfolioInfo(widget.portfolioId);
      
      // Récupérer les données historiques
      final portfolioData = await MyfxbookApiService.getPortfolioData(widget.portfolioId);
      
          if (mounted) {
        setState(() {
          _portfolioInfo = portfolioInfo != null ? PortfolioInfo.fromJson(portfolioInfo) : null;
          
            if (portfolioData != null) {
              print('Données reçues: $portfolioData');
              
              // Essayer différents formats de données
              List<dynamic> dataList = [];
              
              if (portfolioData['dataDaily'] != null) {
                // Format MyFXBook: dataDaily est un tableau de tableaux
                final dataDaily = portfolioData['dataDaily'] as List;
                if (dataDaily.isNotEmpty && dataDaily[0] is List) {
                  // Aplatir le tableau de tableaux
                  dataList = dataDaily.expand((item) => item as List).toList();
                  print('Données dataDaily trouvées: ${dataList.length} points');
                }
              } else if (portfolioData['data'] != null) {
                dataList = portfolioData['data'] as List;
              } else if (portfolioData['dailyData'] != null) {
                dataList = portfolioData['dailyData'] as List;
              } else if (portfolioData['history'] != null) {
                dataList = portfolioData['history'] as List;
              }
              
              if (dataList.isNotEmpty) {
                try {
                  // Convertir les données MyFXBook avec calcul du profit cumulé
                  _portfolioData = _parseMyfxbookDataWithCumulativeProfit(dataList);
                  print('✅ Données MyFXBook parsées avec succès: ${_portfolioData.length} points');
                  print('Premier point: Balance=${_portfolioData.first.balance}€, Profit cumulé=${_portfolioData.first.profit}€');
                  print('Dernier point: Balance=${_portfolioData.last.balance}€, Profit cumulé=${_portfolioData.last.profit}€');
                } catch (e) {
                  print('❌ Erreur lors du parsing des données MyFXBook: $e');
                  print('Structure des données: ${dataList.first}');
                  _portfolioData = [];
                  _error = 'Erreur lors du parsing des données MyFXBook';
                }
              } else {
                print('Aucune donnée trouvée dans la réponse');
                _portfolioData = [];
                _error = 'Aucune donnée disponible dans l\'API MyFXBook';
              }
            }
          
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Erreur lors du chargement des données MyFXBook: $e';
          _portfolioInfo = null;
          _portfolioData = [];
          _isLoading = false;
        });
      }
    }
  }

  // Méthode pour parser les données MyFXBook avec calcul du profit cumulé
  List<PortfolioData> _parseMyfxbookDataWithCumulativeProfit(List<dynamic> dataList) {
    final List<PortfolioData> portfolioData = [];
    
    // Trier les données par date pour s'assurer de l'ordre chronologique
    dataList.sort((a, b) => (a['date'] ?? '').compareTo(b['date'] ?? ''));
    
    double cumulativeProfit = 0.0;
    double initialBalance = 0.0;
    
    for (int i = 0; i < dataList.length; i++) {
      final item = dataList[i];
      final balance = (item['balance'] ?? 0.0).toDouble();
      final dailyProfit = (item['profit'] ?? 0.0).toDouble();
      
      // Pour le premier point, déterminer la balance initiale
      if (i == 0) {
        initialBalance = balance - dailyProfit;
        cumulativeProfit = dailyProfit;
      } else {
        // Ajouter le profit du jour au profit cumulé
        cumulativeProfit += dailyProfit;
      }
      
      // Calculer le growth basé sur le profit cumulé
      final growth = initialBalance > 0 ? (cumulativeProfit / initialBalance) * 100 : 0.0;
      
      portfolioData.add(PortfolioData(
        date: item['date'] ?? '',
        balance: balance,
        equity: balance, // Pour MyFXBook, equity = balance généralement
        profit: cumulativeProfit, // Profit cumulé depuis le début
        growth: growth,
        drawdown: 0.0, // Pas disponible dans les données MyFXBook
      ));
    }
    
    return portfolioData;
  }

  // Méthode pour ouvrir la page MyFXBook du portfolio
  void _openMyfxbookPage() async {
    final String myfxbookUrl = 'https://www.myfxbook.com/members/${widget.portfolioId}';
    
    try {
      final Uri uri = Uri.parse(myfxbookUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        _showErrorSnackBar('Impossible d\'ouvrir MyFXBook');
      }
    } catch (e) {
      print('Erreur lors de l\'ouverture de MyFXBook: $e');
      _showErrorSnackBar('Erreur lors de l\'ouverture de MyFXBook');
    }
  }

  void _showErrorSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: widget.height,
      width: widget.width,
      child: Column(
        children: [
          // En-tête avec informations du portfolio (toujours affiché)
          _buildPortfolioHeader(),
          
          // Graphique ou état de chargement
          Expanded(
            child: _isLoading
                ? _buildLoadingState()
                : _error != null
                    ? _buildErrorState()
                    : _portfolioData.isNotEmpty
                        ? PortfolioChartWidget(
                            data: _portfolioData,
                            title: 'Profit du Portfolio (€)',
                            height: widget.height - 160, // Soustraire header + lien discret
                          )
                        : _buildNoDataState(),
          ),
          
          // Lien discret pour rediriger vers MyFXBook
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            child: GestureDetector(
              onTap: () => _openMyfxbookPage(),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.open_in_new,
                    size: 16,
                    color: Colors.white,
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'Voir sur MyFXBook',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.white,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPortfolioHeader() {
    if (_portfolioInfo == null) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.red.withOpacity(0.1),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(12),
            topRight: Radius.circular(12),
          ),
        ),
        child: const Row(
          children: [
            Icon(Icons.error_outline, color: Colors.red, size: 20),
            SizedBox(width: 8),
            Text(
              'Informations du portfolio non disponibles',
              style: TextStyle(
                color: Colors.red,
                fontSize: 14,
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
      );
    }
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF3B82F6).withOpacity(0.1),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(12),
          topRight: Radius.circular(12),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _portfolioInfo!.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Poppins',
                ),
              ),
              Text(
                '${_portfolioInfo!.broker} • ${_portfolioInfo!.currency}',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontFamily: 'Poppins',
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${_portfolioInfo!.totalGrowth.toStringAsFixed(2)}%',
                style: TextStyle(
                  color: _portfolioInfo!.totalGrowth >= 0 ? Colors.green : Colors.red,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Poppins',
                ),
              ),
              Text(
                '${_portfolioInfo!.currentBalance.toStringAsFixed(0)} ${_portfolioInfo!.currency}',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontFamily: 'Poppins',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF3B82F6),
          width: 1,
        ),
      ),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF3B82F6)),
            ),
            SizedBox(height: 16),
            Text(
              'Chargement des données Myfxbook...',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF3B82F6),
          width: 1,
        ),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 48,
            ),
            const SizedBox(height: 16),
            Text(
              _error ?? 'Erreur inconnue',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontFamily: 'Poppins',
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadPortfolioData,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3B82F6),
                foregroundColor: Colors.white,
              ),
              child: const Text('Réessayer'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoDataState() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF3B82F6),
          width: 1,
        ),
      ),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.show_chart,
              color: Color(0xFF3B82F6),
              size: 48,
            ),
            SizedBox(height: 16),
            Text(
              'Aucune donnée disponible',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
      ),
    );
  }

}
