import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/positioning_alert_model.dart';
import '../services/google_sheets_service.dart';
import '../widgets/positioning_alert_item.dart';

class PositioningAlertsScreen extends StatefulWidget {
  const PositioningAlertsScreen({super.key});

  @override
  State<PositioningAlertsScreen> createState() => _PositioningAlertsScreenState();
}

class _PositioningAlertsScreenState extends State<PositioningAlertsScreen>
    with TickerProviderStateMixin {
  List<PositioningAlert> _allAlerts = [];
  bool _isLoading = true;
  String _errorMessage = '';
  late TabController _tabController;
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadAlerts();
    _startAutoRefresh();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadAlerts() async {
    // Éviter les appels multiples simultanés
    if (_isLoading) {
      print('Chargement déjà en cours, ignoré');
      return;
    }
    
    print('Début du chargement des alertes...');
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final alerts = await GoogleSheetsService.getPositioningAlerts();
      
      if (mounted) {
        setState(() {
          _allAlerts = alerts;
          _isLoading = false;
        });
        print('Alertes chargées avec succès: ${alerts.length} éléments');
      }
    } catch (e) {
      print('Erreur lors du chargement des alertes: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Erreur lors du chargement des alertes: $e';
        });
      }
    }
  }

  Future<void> _refreshAlerts() async {
    if (!mounted || _isLoading) {
      print('Actualisation ignorée - widget non monté ou chargement en cours');
      return;
    }
    await _loadAlerts();
  }

  void _startAutoRefresh() {
    // Actualiser toutes les 2 minutes (moins fréquent pour éviter les boucles)
    _refreshTimer = Timer.periodic(const Duration(minutes: 2), (timer) {
      if (mounted && !_isLoading) { // Éviter les appels multiples
        _refreshAlerts();
      }
    });
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
          'Alertes de Positionnement',
          style: TextStyle(
            color: Colors.white,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: _isLoading 
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Icon(Icons.refresh, color: Colors.white),
            onPressed: _isLoading ? null : _refreshAlerts,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF000D64),
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: 'Alertes'),
            Tab(text: 'Historique'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: Color(0xFF000D64),
              ),
            )
          : _errorMessage.isNotEmpty
              ? _buildErrorView()
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildAlertsTab(),
                    _buildHistoryTab(),
                  ],
                ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 64,
            ),
            const SizedBox(height: 16),
            Text(
              'Erreur de chargement',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
                fontFamily: 'Poppins',
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _refreshAlerts,
              icon: const Icon(Icons.refresh),
              label: const Text('Réessayer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF000D64),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }


  Widget _buildAlertsTab() {
    final activeAlerts = _allAlerts.where((alert) => 
      alert.isOpenPosition || alert.isInfoUpdate
    ).toList();
    
    return activeAlerts.isEmpty
        ? _buildEmptyState()
        : RefreshIndicator(
            onRefresh: _refreshAlerts,
            color: const Color(0xFF000D64),
            child: ListView.builder(
              padding: const EdgeInsets.all(16.0),
              itemCount: activeAlerts.length,
              itemBuilder: (context, index) {
                final alert = activeAlerts[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: PositioningAlertItem(
                    alert: alert,
                    onTap: () => _showAlertDetails(alert),
                  ),
                );
              },
            ),
          );
  }

  Widget _buildHistoryTab() {
    final closedAlerts = _allAlerts.where((alert) => alert.isClosedPosition).toList();
    
    return closedAlerts.isEmpty
        ? _buildEmptyState()
        : RefreshIndicator(
            onRefresh: _refreshAlerts,
            color: const Color(0xFF000D64),
            child: ListView.builder(
              padding: const EdgeInsets.all(16.0),
              itemCount: closedAlerts.length,
              itemBuilder: (context, index) {
                final alert = closedAlerts[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: PositioningAlertItem(
                    alert: alert,
                    onTap: () => _showAlertDetails(alert),
                  ),
                );
              },
            ),
          );
  }



  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.notifications_none,
              color: Colors.grey[600],
              size: 64,
            ),
            const SizedBox(height: 16),
            Text(
              'Aucune alerte trouvée',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Aucune alerte ne correspond aux critères sélectionnés',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAlertDetails(PositioningAlert alert) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1a1a2e),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  _getAlertIcon(alert.side),
                  color: _getAlertColor(alert.side),
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Détails de l\'alerte',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: Colors.white70),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildDetailRow('ID', alert.id),
            _buildDetailRow('Type', alert.side),
            _buildDetailRow('Symbole', alert.symbol),
            _buildDetailRow('Prix', alert.price.toString()),
            if (alert.stopLoss != null)
              _buildDetailRow('Stop Loss', alert.stopLoss!),
            if (alert.takeProfit != null)
              _buildDetailRow('Take Profit', alert.takeProfit!),
            if (alert.previousStopLoss != null)
              _buildDetailRow('SL Précédent', alert.previousStopLoss!),
            if (alert.pnl != null)
              _buildDetailRow('P&L', alert.pnl!.toString()),
            _buildDetailRow('Heure', _formatDateTime(alert.timestamp)),
            if (alert.note.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                'Note',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Poppins',
                ),
              ),
              const SizedBox(height: 4),
              Text(
                alert.note,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontFamily: 'Poppins',
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
                fontFamily: 'Poppins',
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontFamily: 'Poppins',
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getAlertIcon(String side) {
    switch (side) {
      case 'SELL':
        return Icons.trending_down;
      case 'CLOSED':
        return Icons.check_circle;
      case 'INFO':
        return Icons.info;
      default:
        return Icons.notifications;
    }
  }

  Color _getAlertColor(String side) {
    switch (side) {
      case 'SELL':
        return Colors.red;
      case 'CLOSED':
        return Colors.green;
      case 'INFO':
        return Colors.orange;
      default:
        return const Color(0xFF000D64);
    }
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day}/${dateTime.month}/${dateTime.year} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
