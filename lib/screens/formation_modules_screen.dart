import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';

class FormationModulesScreen extends StatelessWidget {
  final String formationType;
  final String formationTitle;

  const FormationModulesScreen({
    super.key,
    required this.formationType,
    required this.formationTitle,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f23),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          formationTitle,
          style: const TextStyle(
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
              // Navigation vers le profil
              Navigator.of(context).pushNamed('/profile');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // En-tête de la formation
            _buildFormationHeader(),
            
            const SizedBox(height: 30),
            
            // Liste des modules avec animations
            _buildModulesList(),
          ],
        ),
      ),
    );
  }

  Widget _buildFormationHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            _getFormationColor().withOpacity(0.3),
            _getFormationColor().withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: _getFormationColor().withOpacity(0.3),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: _getFormationColor().withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          // Icône de la formation
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: _getFormationColor().withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: _getFormationColor().withOpacity(0.4),
                width: 2,
              ),
            ),
            child: Icon(
              _getFormationIcon(),
              color: _getFormationColor(),
              size: 40,
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Titre de la formation
          Text(
            formationTitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
              letterSpacing: 0.5,
            ),
          ),
          
          const SizedBox(height: 12),
          
          // Description
          Text(
            _getFormationDescription(),
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 16,
              fontFamily: 'Poppins',
              height: 1.4,
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Statistiques
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildStatItem('11', 'Modules'),
              _buildStatItem('50h+', 'Contenu'),
              // _buildStatItem('4.9', 'Note'), // Note supprimée
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            color: _getFormationColor(),
            fontSize: 24,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.7),
            fontSize: 14,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }

  Widget _buildModulesList() {
    final modules = _getFormationModules();
    
    return AnimationLimiter(
      child: Column(
        children: AnimationConfiguration.toStaggeredList(
          duration: const Duration(milliseconds: 600),
          childAnimationBuilder: (widget) => SlideAnimation(
            verticalOffset: 50.0,
            child: FadeInAnimation(
              child: widget,
            ),
          ),
          children: [
            // Titre de la section
            Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 20),
              child: Text(
                'Modules de la formation',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Poppins',
                ),
              ),
            ),
            
            // Liste des modules
            ...modules.asMap().entries.map((entry) {
              final index = entry.key;
              final module = entry.value;
              
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                child: _buildModuleCard(index + 1, module),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildModuleCard(int moduleNumber, String moduleTitle) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF1a1a2e).withOpacity(0.9),
            const Color(0xFF16213e).withOpacity(0.7),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: _getFormationColor().withOpacity(0.2),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Numéro du module
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  _getFormationColor(),
                  _getFormationColor().withOpacity(0.7),
                ],
              ),
              borderRadius: BorderRadius.circular(15),
              boxShadow: [
                BoxShadow(
                  color: _getFormationColor().withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: Text(
                '$moduleNumber',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Poppins',
                ),
              ),
            ),
          ),
          
          const SizedBox(width: 20),
          
          // Titre du module
          Expanded(
            child: Text(
              moduleTitle,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
                fontFamily: 'Poppins',
                height: 1.3,
              ),
            ),
          ),
          
          // Icône de progression
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.lock_outline,
              color: Colors.white.withOpacity(0.6),
              size: 20,
            ),
          ),
        ],
      ),
    );
  }

  Color _getFormationColor() {
    switch (formationType.toLowerCase()) {
      case 'trading':
        return const Color(0xFF3B82F6); // Bleu
      case 'bourse':
        return const Color(0xFFEF4444); // Rouge
      default:
        return const Color(0xFF8B5CF6); // Violet
    }
  }

  IconData _getFormationIcon() {
    switch (formationType.toLowerCase()) {
      case 'trading':
        return Icons.trending_up;
      case 'bourse':
        return Icons.bar_chart;
      default:
        return Icons.school;
    }
  }

  String _getFormationDescription() {
    switch (formationType.toLowerCase()) {
      case 'trading':
        return 'Maîtrisez les techniques de trading et développez votre expertise sur les marchés financiers avec nos 11 modules spécialisés.';
      case 'bourse':
        return 'Apprenez les fondamentaux de l\'investissement en bourse et construisez un portefeuille solide et performant.';
      default:
        return 'Découvrez nos formations spécialisées pour développer vos compétences.';
    }
  }

  List<String> _getFormationModules() {
    switch (formationType.toLowerCase()) {
      case 'trading':
        return [
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
        ];
      case 'bourse':
        return [
          'Introduction (Mindset & bases de l\'investissement)',
          'Les connaissances de base (Intérêts composés, actions, obligations, marchés)',
          'Stratégies d\'investissement (Analyse technique, stock-picking, dividendes)',
          'Gestion passive (ETF, diversification et sélection)',
          'Fiscalité (Optimisation fiscale : PEA, CTO, Assurance-vie)',
          'Épargne (Comment épargner efficacement et choisir les bonnes options)',
          'Allocation et rééquilibrage (Stratégies d\'allocation et de rééquilibrage)',
          'Composantes d\'un portefeuille (Construire un portefeuille)',
          'Obligations & ETF obligataires (Sélection et objectifs des fonds obligataires)',
          'Nos portefeuilles (Exemples pratiques de portefeuilles anti-crise et performants)',
          'Commencer à investir (Comment investir, passer un ordre, optimiser vos rééquilibrages)',
        ];
      default:
        return ['Module en développement...'];
    }
  }
}
