import 'package:flutter/material.dart';

class AlertCard extends StatelessWidget {
  final String date;
  final String trade;
  final String takeProfit;
  final String stopLoss;
  final bool isClosed;

  const AlertCard({
    super.key,
    required this.date,
    required this.trade,
    required this.takeProfit,
    required this.stopLoss,
    this.isClosed = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 140,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[600]!, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                date,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  fontFamily: 'Poppins',
                ),
              ),
              Icon(
                Icons.check_circle,
                color: Colors.green,
                size: 14,
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            trade,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.w600,
              fontFamily: 'Poppins',
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 3),
          Text(
            takeProfit,
            style: const TextStyle(
              color: Colors.green,
              fontSize: 10,
              fontFamily: 'Poppins',
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 1),
          Text(
            stopLoss,
            style: const TextStyle(
              color: Colors.red,
              fontSize: 10,
              fontFamily: 'Poppins',
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
} 