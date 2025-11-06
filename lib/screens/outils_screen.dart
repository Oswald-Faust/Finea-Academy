import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../widgets/finea_app_bar.dart';
import '../widgets/positioning_alert_card.dart';
import '../widgets/lot_calculator_card.dart';
import '../widgets/currency_converter_card.dart';
import '../widgets/interest_calculator_card.dart';
import '../widgets/tally_form_card.dart';
import '../widgets/economic_calendar_card.dart';
import '../services/alerts_permissions_service.dart';
import 'profile_screen.dart';
import 'currency_converter_screen.dart';
import 'lot_calculator_screen.dart';
import 'interest_calculator_screen.dart';
import 'positioning_alerts_screen.dart';
import 'tally_form_screen.dart';
import 'economic_calendar_screen.dart';

class OutilsScreen extends StatefulWidget {
  const OutilsScreen({super.key});

  @override
  State<OutilsScreen> createState() => _OutilsScreenState();
}

class _OutilsScreenState extends State<OutilsScreen> {
  bool _hasLoadedPermissions = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Recharger les permissions quand l'utilisateur arrive sur cette page (une seule fois)
    if (!_hasLoadedPermissions) {
      _hasLoadedPermissions = true;
      final permissionsService = Provider.of<AlertsPermissionsService>(context, listen: false);
      permissionsService.refreshPermissions();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f23),
      appBar: FineaAppBar(
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
            // SECTION PROFIL INVESTISSEUR - TALLY
            TallyFormCard(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const TallyFormScreen(),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 16),
            
            // SECTION CALENDRIER ÉCONOMIQUE
            EconomicCalendarCard(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const EconomicCalendarScreen(),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 16),
            
            // SECTION ALERTES DE POSITIONNEMENT
            PositioningAlertCard(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const PositioningAlertsScreen(),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 16),
            
            // SECTION CALCULATEUR D'INTÉRÊTS
            InterestCalculatorCard(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const InterestCalculatorScreen(),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 16),
            
            // SECTION CALCULATEUR DE LOT
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
            
            const SizedBox(height: 32), // Marge en bas
          ],
        ),
      ),
    );
  }
} 