import 'package:flutter/material.dart';
import '../widgets/positioning_alert_card.dart';
import '../widgets/lot_calculator_card.dart';
import '../widgets/currency_converter_card.dart';
import 'profile_screen.dart';
import 'currency_converter_screen.dart';
import 'lot_calculator_screen.dart';

class OutilsScreen extends StatelessWidget {
  const OutilsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f23),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.person, color: Colors.white),
            onPressed: () {
              // Navigation vers le profil
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const ProfileScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // SECTION ALERTE DE POSITIONNEMENT
            PositioningAlertCard(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Ouverture des alertes de positionnement...'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
            ),
            
            const SizedBox(height: 16),
            
            // SECTION CALCULATRICE DE LOT
            LotCalculatorCard(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const LotCalculatorScreen(),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 16),
            
            // SECTION CONVERTISSEUR DE DEVISE
            CurrencyConverterCard(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const CurrencyConverterScreen(),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
} 