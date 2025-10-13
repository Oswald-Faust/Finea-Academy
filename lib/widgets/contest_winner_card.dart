import 'package:flutter/material.dart';

class ContestWinnerCard extends StatelessWidget {
  final String drawDate;
  final String winner;
  final String gains;
  final String ethscanAddress;
  final VoidCallback? onTap;

  const ContestWinnerCard({
    super.key,
    required this.drawDate,
    required this.winner,
    required this.gains,
    required this.ethscanAddress,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: const Color(0xFF1a1a2e).withOpacity(0.8),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.blue.withOpacity(0.3), width: 1),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Tirage du : $drawDate',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      Text(
                        'Gagnant : $winner',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      Text(
                        'Gains : $gains',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      Text(
                        'Adresse ETH : ',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                // Trophée 3D violet - plus grand et incliné
                Transform.rotate(
                  angle: 0.2, // Inclinaison vers la droite
                  child: Image.asset(
                    'assets/images/trophies.png',
                    width: 140,
                    height: 140,
                    fit: BoxFit.contain,
                  ),
                ),
              ],
            ),
            ],
          ),
        ),
      ),
    );
  }
} 