import 'package:flutter/material.dart';
import 'alert_card.dart';

class AlertsSection extends StatelessWidget {
  final List<Map<String, String>> alerts;

  const AlertsSection({
    super.key,
    required this.alerts,
  });

  @override
  Widget build(BuildContext context) {
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