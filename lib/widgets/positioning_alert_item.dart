import 'package:flutter/material.dart';
import '../models/positioning_alert_model.dart';

class PositioningAlertItem extends StatelessWidget {
  final PositioningAlert alert;
  final VoidCallback? onTap;

  const PositioningAlertItem({
    super.key,
    required this.alert,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _getAlertColor(alert.side).withOpacity(0.3),
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
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // En-tête avec type et timestamp
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getAlertColor(alert.side).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: _getAlertColor(alert.side).withOpacity(0.5),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _getAlertIcon(alert.side),
                            color: _getAlertColor(alert.side),
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _getAlertTypeText(alert.side),
                            style: TextStyle(
                              color: _getAlertColor(alert.side),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Poppins',
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    Text(
                      _formatDateTime(alert.timestamp),
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // Informations principales
                Row(
                  children: [
                    // Symbole et prix
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            alert.symbol,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Poppins',
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Prix: ${alert.price.toStringAsFixed(5)}',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                              fontFamily: 'Poppins',
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    // ID de la position
                    if (alert.id.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: Colors.blue.withOpacity(0.5),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          'ID: ${alert.id}',
                          style: TextStyle(
                            color: Colors.blue,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ),
                  ],
                ),
                
                // Informations spécifiques selon le type
                if (alert.isOpenPosition) ...[
                  const SizedBox(height: 12),
                  _buildPositionInfo(),
                ] else if (alert.isInfoUpdate) ...[
                  const SizedBox(height: 12),
                  _buildUpdateInfo(),
                ] else if (alert.isClosedPosition) ...[
                  const SizedBox(height: 12),
                  _buildClosedInfo(),
                ],
                
                // Note si disponible
                if (alert.note.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.grey[800],
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      alert.note,
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPositionInfo() {
    return Row(
      children: [
        if (alert.stopLoss != null) ...[
          Expanded(
            child: _buildInfoChip(
              'SL: ${alert.stopLoss}',
              Colors.red,
            ),
          ),
          const SizedBox(width: 8),
        ],
        if (alert.takeProfit != null) ...[
          Expanded(
            child: _buildInfoChip(
              'TP: ${alert.takeProfit}',
              Colors.green,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildUpdateInfo() {
    return Row(
      children: [
        if (alert.previousStopLoss != null) ...[
          Expanded(
            child: _buildInfoChip(
              'SL: ${alert.previousStopLoss}',
              Colors.red.withOpacity(0.5),
            ),
          ),
          const SizedBox(width: 8),
          const Icon(
            Icons.arrow_forward,
            color: Colors.white70,
            size: 16,
          ),
          const SizedBox(width: 8),
        ],
        if (alert.stopLoss != null) ...[
          Expanded(
            child: _buildInfoChip(
              'SL: ${alert.stopLoss}',
              Colors.red,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildClosedInfo() {
    return Row(
      children: [
        if (alert.pnl != null) ...[
          Expanded(
            child: _buildInfoChip(
              'P&L: ${alert.pnl!.toStringAsFixed(5)}',
              alert.pnl! >= 0 ? Colors.green : Colors.red,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildInfoChip(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: color.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w500,
          fontFamily: 'Poppins',
        ),
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
        return Colors.blue;
    }
  }

  String _getAlertTypeText(String side) {
    switch (side) {
      case 'SELL':
        return 'POSITION OUVERTE';
      case 'CLOSED':
        return 'POSITION FERMÉE';
      case 'INFO':
        return 'MISE À JOUR';
      default:
        return 'ALERTE';
    }
  }

  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inMinutes < 1) {
      return 'À l\'instant';
    } else if (difference.inMinutes < 60) {
      return 'Il y a ${difference.inMinutes}min';
    } else if (difference.inHours < 24) {
      return 'Il y a ${difference.inHours}h';
    } else {
      return '${dateTime.day}/${dateTime.month} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
    }
  }
}
