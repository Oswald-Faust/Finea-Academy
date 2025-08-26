import 'package:flutter/material.dart';
import '../widgets/formation_card.dart';
import 'profile_screen.dart';
import 'formation_modules_screen.dart';

class AcademieScreen extends StatelessWidget {
  const AcademieScreen({super.key});

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
            // Texte d'information en haut
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                '(Redirection des bulles vers le site web)',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontFamily: 'Poppins',
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Formation Bourse
            FormationCard(
              title: 'BOURSE',
              subtitle: 'Bourse',
              actionIcon: Icons.trending_up,
              actionIconColor: Colors.red,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const FormationModulesScreen(
                      formationType: 'Bourse',
                      formationTitle: 'FORMATION BOURSE',
                    ),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 24),
            
            // Formation Trading
            FormationCard(
              title: 'TRADING',
              subtitle: 'Trading',
              actionIcon: Icons.bar_chart,
              actionIconColor: Colors.blue,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const FormationModulesScreen(
                      formationType: 'Trading',
                      formationTitle: 'FORMATION TRADING',
                    ),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 24),
            
            // Formation Marketing (commentée)
            // FormationCard(
            //   title: 'MARKETING',
            //   subtitle: 'Marketing',
            //   additionalText: 'CRÉATION DE / CLOSING',
            //   actionIcon: Icons.campaign,
            //   actionIconColor: Colors.purple,
            //   onTap: () {
            //     ScaffoldMessenger.of(context).showSnackBar(
            //       const SnackBar(
            //         content: Text('Formation Marketing en développement...'),
            //         backgroundColor: Colors.purple,
            //       ),
            //     );
            //   },
            // ),
          ],
        ),
      ),
    );
  }
} 