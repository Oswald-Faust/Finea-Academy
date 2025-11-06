import 'package:flutter/material.dart';
import 'alert_card.dart';
import 'unauthorized_access_widget.dart';
import '../services/alerts_permissions_service.dart';
import 'package:provider/provider.dart';

class AlertsSection extends StatelessWidget {
  final List<Map<String, String>> alerts;

  const AlertsSection({
    super.key,
    required this.alerts,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<AlertsPermissionsService?>(
      builder: (context, permissionsService, child) {
        // Si le service n'est pas disponible, afficher les alertes par défaut
        if (permissionsService == null) {
          return _buildAlertsContent();
        }

        // Si l'utilisateur n'a pas la permission, ne rien afficher
        if (!permissionsService.canViewClosedAlerts) {
          return const SizedBox.shrink(); // Widget vide, rien ne s'affiche
        }

        return _buildAlertsContent();
      },
    );
  }

  Widget _buildAlertsContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Alertes clôturées :",
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
        
        const SizedBox(height: 16),
        
        SizedBox(
          height: 100,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: alerts.length,
            itemBuilder: (context, index) {
              final alert = alerts[index];
              return Padding(
                padding: EdgeInsets.only(right: index < alerts.length - 1 ? 12 : 0),
                child: AlertCard(
                  date: alert['date'] ?? '',
                  trade: alert['trade'] ?? '',
                  takeProfit: alert['tp'] ?? '',
                  stopLoss: alert['sl'] ?? '',
                ),
              );
            },
          ),
        ),
      ],
    );
  }
} 