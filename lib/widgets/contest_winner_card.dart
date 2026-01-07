import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ContestWinnerCard extends StatelessWidget {
  final String drawDate;
  final String winner;
  final String gains;
  final String? ethAddress;
  final bool isCurrentUser;
  final VoidCallback? onTap;

  const ContestWinnerCard({
    super.key,
    required this.drawDate,
    required this.winner,
    required this.gains,
    this.ethAddress,
    this.isCurrentUser = false,
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
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      Text(
                        'Gagnant : $winner',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      Text(
                        'Gains : $gains',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      // Afficher l'adresse ETH SEULEMENT si elle existe
                      if (ethAddress != null && ethAddress!.isNotEmpty)
                        _buildEthAddressRow(context),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                // Trophée 3D violet - plus grand et incliné
                Transform.rotate(
                  angle: 0.2, // Inclinaison vers la droite
                  child: Image.asset(
                    'assets/images/trophies.png',
                    width: 100,
                    height: 100,
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

  Widget _buildEthAddressRow(BuildContext context) {
    if (isCurrentUser) {
      // L'utilisateur connecté est le gagnant - afficher l'adresse avec bouton copier
      return GestureDetector(
        onTap: () {
          Clipboard.setData(ClipboardData(text: ethAddress!));
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Adresse copiée !'),
              duration: Duration(seconds: 2),
            ),
          );
        },
        child: Row(
          children: [
            Text(
              'Adresse ETH : ',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
            ),
            Flexible(
              child: Text(
                _truncateEthAddress(ethAddress!),
                style: TextStyle(
                  color: Colors.blue[300],
                  fontSize: 10,
                  fontFamily: 'monospace',
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.copy,
              size: 12,
              color: Colors.blue[300],
            ),
          ],
        ),
      );
    } else {
      // L'utilisateur n'est pas le gagnant - masquer l'adresse
      return Text(
        'Adresse ETH : ••••••••',
        style: TextStyle(
          color: Colors.grey[500],
          fontSize: 12,
          fontWeight: FontWeight.bold,
          fontFamily: 'Poppins',
        ),
      );
    }
  }

  String _truncateEthAddress(String address) {
    if (address.length > 15) {
      return '${address.substring(0, 8)}...${address.substring(address.length - 6)}';
    }
    return address;
  }
}