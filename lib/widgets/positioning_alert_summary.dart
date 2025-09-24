import 'package:flutter/material.dart';
import '../models/positioning_alert_model.dart';

class PositioningAlertSummary extends StatelessWidget {
  final List<PositioningAlert> openPositions;
  final List<PositioningAlert> recentUpdates;
  final List<PositioningAlert> closedPositions;

  const PositioningAlertSummary({
    super.key,
    required this.openPositions,
    required this.recentUpdates,
    required this.closedPositions,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Titre
        Text(
          'Résumé des Alertes',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
        
        const SizedBox(height: 16),
        
        // Cartes de résumé
        Row(
          children: [
            Expanded(
              child: _buildSummaryCard(
                'Positions Ouvertes',
                openPositions.length.toString(),
                Icons.trending_down,
                Colors.red,
                openPositions,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildSummaryCard(
                'Mises à Jour',
                recentUpdates.length.toString(),
                Icons.info,
                Colors.orange,
                recentUpdates,
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 12),
        
        Row(
          children: [
            Expanded(
              child: _buildSummaryCard(
                'Positions Fermées',
                closedPositions.length.toString(),
                Icons.check_circle,
                Colors.green,
                closedPositions,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildSummaryCard(
                'Total',
                (openPositions.length + recentUpdates.length + closedPositions.length).toString(),
                Icons.notifications,
                Colors.blue,
                [],
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 20),
        
        // Dernières alertes
        if (openPositions.isNotEmpty || recentUpdates.isNotEmpty) ...[
          Text(
            'Dernières Alertes',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 12),
          
          _buildRecentAlertsList(),
        ],
      ],
    );
  }

  Widget _buildSummaryCard(
    String title,
    String count,
    IconData icon,
    Color color,
    List<PositioningAlert> alerts,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                color: color,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                    fontFamily: 'Poppins',
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 8),
          
          Text(
            count,
            style: TextStyle(
              color: color,
              fontSize: 24,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          
          if (alerts.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              _getLastUpdateText(alerts),
              style: TextStyle(
                color: Colors.white70,
                fontSize: 10,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildRecentAlertsList() {
    // Combiner les positions ouvertes et les mises à jour récentes
    final recentAlerts = <PositioningAlert>[];
    recentAlerts.addAll(openPositions.take(3));
    recentAlerts.addAll(recentUpdates.take(2));
    
    // Trier par timestamp décroissant
    recentAlerts.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    
    // Prendre les 5 plus récentes
    final displayAlerts = recentAlerts.take(5).toList();
    
    return Column(
      children: displayAlerts.map((alert) {
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.grey[800],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: _getAlertColor(alert.side).withOpacity(0.3),
              width: 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                _getAlertIcon(alert.side),
                color: _getAlertColor(alert.side),
                size: 16,
              ),
              
              const SizedBox(width: 12),
              
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      alert.symbol,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    Text(
                      _getAlertDescription(alert),
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ],
                ),
              ),
              
              Text(
                _formatTime(alert.timestamp),
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 10,
                  fontFamily: 'Poppins',
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  String _getLastUpdateText(List<PositioningAlert> alerts) {
    if (alerts.isEmpty) return '';
    
    final latest = alerts.reduce((a, b) => 
      a.timestamp.isAfter(b.timestamp) ? a : b
    );
    
    final now = DateTime.now();
    final difference = now.difference(latest.timestamp);
    
    if (difference.inMinutes < 1) {
      return 'À l\'instant';
    } else if (difference.inMinutes < 60) {
      return 'Il y a ${difference.inMinutes}min';
    } else if (difference.inHours < 24) {
      return 'Il y a ${difference.inHours}h';
    } else {
      return '${latest.timestamp.day}/${latest.timestamp.month}';
    }
  }

  String _getAlertDescription(PositioningAlert alert) {
    if (alert.isOpenPosition) {
      return 'Position ouverte - Prix: ${alert.price.toStringAsFixed(5)}';
    } else if (alert.isInfoUpdate) {
      return 'Mise à jour SL: ${alert.previousStopLoss ?? 'N/A'} → ${alert.stopLoss ?? 'N/A'}';
    } else if (alert.isClosedPosition) {
      return 'Position fermée - P&L: ${alert.pnl?.toStringAsFixed(5) ?? 'N/A'}';
    }
    return alert.note;
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
        return Colors.blue;
    }
  }

  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inMinutes < 1) {
      return 'Maintenant';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}min';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h';
    } else {
      return '${dateTime.day}/${dateTime.month}';
    }
  }
}
