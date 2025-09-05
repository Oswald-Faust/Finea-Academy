import 'package:flutter/material.dart';
import '../widgets/formation_expandable_card.dart';
import 'profile_screen.dart';

class AcademieScreen extends StatefulWidget {
  const AcademieScreen({super.key});

  @override
  State<AcademieScreen> createState() => _AcademieScreenState();
}

class _AcademieScreenState extends State<AcademieScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f23),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'ACADÉMIE',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person, color: Colors.white),
            onPressed: () {
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
                'Découvrez nos formations spécialisées pour développer vos compétences',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontFamily: 'Poppins',
                  height: 1.4,
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Formation Bourse
            FormationExpandableCard(
              title: 'BOURSE',
              subtitle: 'Formation Bourse',
              imagePath: 'assets/images/Formation-Bourse.jpeg',
              isComingSoon: false,
              modules: [
                'Module 1 – Introduction (Mindset)',
                'Module 2 – Les connaissances de base (Intérêts composés, actions, obligations, marchés, indices financiers, risques)',
                'Module 3 – Les stratégies d\'investissement (Analyse technique, trading court terme, stock-picking, dividendes, frais, behavior gap)',
                'Module 4 – Les bases de la gestion passive (Diversification, ETF, sélection)',
                'Module 5 – L\'importance de la fiscalité (PEA, CTO, Assurance-vie)',
                'Module 6 – Épargner mieux (Types d\'épargne, stratégie)',
                'Module 7 – Allocation et rééquilibrage (Stratégique, tactique, bonnes pratiques)',
                'Module 8 – Les composantes d\'un portefeuille actions (Cœur global, Smart Beta, thématiques, or, Private Equity, ISR)',
                'Module 9 – Obligations & ETF obligataires (Fonctionnement, sélection, fonds euros)',
                'Module 10 – Nos portefeuilles (Anti-crise, surperformance)',
                'Module 11 – Commencer à investir (Comment investir, ordres, règle des 4%, optimisation)',
                'Modules BONUS (Liens utiles, partenaires)',
              ],
              actionIcon: Icons.trending_up,
              actionIconColor: Colors.blue,
            ),
            
            const SizedBox(height: 24),
            
            // Formation Trading
            FormationExpandableCard(
              title: 'TRADING',
              subtitle: 'Formation Trading',
              imagePath: 'assets/images/Formation-Trading.jpeg',
              isComingSoon: false,
              modules: [
                'Présentation Learning',
                'Introduction aux Marchés Financiers',
                'Le Métier de Trader',
                'Les Outils à Connaître',
                'Analyse Fondamentale',
                'Analyse Technique',
                'La Psychologie du Trader',
                'La Gestion des Risques',
                'Les Mathématiques en Trading',
                'Cas Pratique',
                'Récap de Marché',
              ],
              actionIcon: Icons.bar_chart,
              actionIconColor: Colors.blue,
            ),
            
            const SizedBox(height: 24),
            
            // Formation Algorithme
            FormationExpandableCard(
              title: 'ALGORITHME',
              subtitle: 'Formation Algorithme',
              imagePath: 'assets/images/Formaton-Algo.jpeg',
              isComingSoon: true,
              comingSoonText: 'Prochainement...',
              actionIcon: Icons.code,
              actionIconColor: Colors.blue,
            ),
            
            const SizedBox(height: 24),
            
            // Formation Marketing
            FormationExpandableCard(
              title: 'MARKETING',
              subtitle: 'Formation Marketing',
              imagePath: 'assets/images/Formation-Marketing.jpeg',
              isComingSoon: true,
              comingSoonText: 'Prochainement...',
              actionIcon: Icons.campaign,
              actionIconColor: Colors.blue,
            ),
            
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
} 