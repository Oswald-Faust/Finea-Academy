import 'package:flutter/material.dart';
import 'module_expandable_card.dart';

class FormationExpandableCard extends StatefulWidget {
  final String title;
  final String subtitle;
  final String imagePath;
  final bool isComingSoon;
  final String? comingSoonText;
  final List<String>? modules;
  final IconData actionIcon;
  final Color actionIconColor;

  const FormationExpandableCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.imagePath,
    required this.isComingSoon,
    this.comingSoonText,
    this.modules,
    required this.actionIcon,
    required this.actionIconColor,
  });

  @override
  State<FormationExpandableCard> createState() => _FormationExpandableCardState();
}

class _FormationExpandableCardState extends State<FormationExpandableCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _heightAnimation;
  bool _isExpanded = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _heightAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleExpanded() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          // En-tête de la formation
          _buildFormationHeader(),
          
          // Contenu déroulant
          if (widget.modules != null && !widget.isComingSoon)
            AnimatedBuilder(
              animation: _heightAnimation,
              builder: (context, child) {
                return SizeTransition(
                  sizeFactor: _heightAnimation,
                  child: _buildModulesContent(),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildFormationHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Image de la formation
          Container(
            width: double.infinity,
            height: 200,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              image: DecorationImage(
                image: AssetImage(widget.imagePath),
                fit: BoxFit.cover,
              ),
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Titre de la formation
          Text(
            widget.title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
              letterSpacing: 0.5,
            ),
          ),
          
          const SizedBox(height: 8),
          
          // Sous-titre
          Text(
            widget.subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 16,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Statut "Prochainement" ou bouton d'expansion
          if (widget.isComingSoon)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: widget.actionIconColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(25),
                border: Border.all(
                  color: widget.actionIconColor.withOpacity(0.5),
                  width: 1,
                ),
              ),
              child: Text(
                widget.comingSoonText ?? 'Prochainement...',
                style: TextStyle(
                  color: widget.actionIconColor,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  fontFamily: 'Poppins',
                ),
              ),
            )
          else
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Statistiques
                Row(
                  children: [
                    _buildStatItem('${widget.modules?.length ?? 0}', 'Modules'),
                    const SizedBox(width: 20),
                    _buildStatItem('50h+', 'Contenu'),
                  ],
                ),
                
                // Bouton d'expansion
                GestureDetector(
                  onTap: _toggleExpanded,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: widget.actionIconColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: AnimatedRotation(
                      turns: _isExpanded ? 0.5 : 0.0,
                      duration: const Duration(milliseconds: 300),
                      child: Icon(
                        Icons.keyboard_arrow_down,
                        color: widget.actionIconColor,
                        size: 24,
                      ),
                    ),
                  ),
                ),
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
            color: widget.actionIconColor,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.7),
            fontSize: 12,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }

  Widget _buildModulesContent() {
    if (widget.modules == null) return const SizedBox.shrink();
    
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Divider(
            color: Colors.white24,
            thickness: 1,
          ),
          
          const SizedBox(height: 20),
          
          // Titre des modules
          Text(
            'Programme de la formation',
            style: TextStyle(
              color: widget.actionIconColor,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Liste des modules avec menus déroulants
          ...widget.modules!.asMap().entries.map((entry) {
            final index = entry.key;
            final module = entry.value;
            
            return ModuleExpandableCard(
              moduleNumber: index + 1,
              moduleTitle: module,
              moduleContent: _getModuleContent(index),
              actionIconColor: widget.actionIconColor,
            );
          }),
        ],
      ),
    );
  }

  String _getModuleContent(int moduleIndex) {
    // Contenu détaillé pour chaque module selon la formation
    if (widget.title == 'BOURSE') {
      return _getBourseModuleContent(moduleIndex);
    } else if (widget.title == 'TRADING') {
      return _getTradingModuleContent(moduleIndex);
    }
    return 'Contenu détaillé du module en cours de développement...';
  }

  String _getBourseModuleContent(int moduleIndex) {
    switch (moduleIndex) {
      case 0: // Module 1 - Introduction
        return '• Mindset';
      case 1: // Module 2 - Connaissances de base
        return '• Les intérêts composés et les leviers\n• Les actions, les obligations & les marchés\n• Les indices financiers\n• Les risques et indices financiers';
      case 2: // Module 3 - Stratégies d'investissement
        return '• Les stratégies les plus connues (analyse technique, trading court terme, stock-picking, stratégie de dividende)\n• L\'importance des frais sous-estimés\n• Activité, passivité et anticipation\n• Behavior Gap : pourquoi une sous-performance ?';
      case 3: // Module 4 - Gestion passive
        return '• Les fondamentaux (diversification)\n• Les ETF et leurs fonctions\n• Risques et avantages\n• Comment lire et sélectionner un ETF';
      case 4: // Module 5 - Fiscalité
        return '• Comprendre la fiscalité\n• Pourquoi optimiser la fiscalité\n• Le PEA\n• Le compte-titres (CTO)\n• L\'assurance-vie';
      case 5: // Module 6 - Épargne
        return '• Les différents types d\'épargne\n• Analyser votre stratégie d\'épargne';
      case 6: // Module 7 - Allocation et rééquilibrage
        return '• Allocation stratégique\n• Allocation tactique\n• Rééquilibrage\n• Sécurisation progressive\n• Les bonnes pratiques à adopter';
      case 7: // Module 8 - Composantes portefeuille
        return '• Le cœur de portefeuille actions global (PEA)\n• Construction d\'un cœur de portefeuille actions (CTO/AV)\n• Les ETF Smart Beta\n• Les ETF leveraged\n• Les ETF thématiques\n• L\'or\n• Le Private Equity\n• Investissement socialement responsable (ISR/ESG)';
      case 8: // Module 9 - Obligations
        return '• Fonctionnement et objectifs des obligations\n• ETF obligataires : fonctionnement et sélection\n• Fonds obligataires datés à échéance\n• Le fonds euros : utilisation et objectifs\n• Quels investissements choisir pour un portefeuille sécuritaire ?';
      case 9: // Module 10 - Portefeuilles
        return '• Exemples de portefeuilles\n• Portefeuille anti-crise\n• Portefeuille pour surperformer le marché';
      case 10: // Module 11 - Commencer à investir
        return '• Comment investir en bourse ?\n• Comment investir une somme d\'argent importante ?\n• Comment bien passer un ordre de bourse ?\n• La règle des 4 % et comment vivre de ses investissements\n• Comment optimiser ses rééquilibrages (PEA / AV / CTO)';
      case 11: // Modules BONUS
        return '• Liens utiles\n• Liens partenaires';
      default:
        return 'Contenu détaillé du module en cours de développement...';
    }
  }

  String _getTradingModuleContent(int moduleIndex) {
    switch (moduleIndex) {
      case 0: // Module 1 - Présentation
        return '• Présentation Learn';
      case 1: // Module 2 - Introduction aux marchés financiers
        return '• Partie 1\n• Partie 2\n• Partie 3';
      case 2: // Module 3 - Le métier de Trader
        return '• Partie 1\n• Partie 2';
      case 3: // Module 4 - Les outils à connaître
        return '• Les outils à connaître';
      case 4: // Module 5 - Analyse fondamentale
        return '• Introduction analyse fondamentale\n• Partie 1\n• Partie 2\n• Partie 3\n• Partie 4\n• Partie 5\n• Partie 6\n• Partie 7 - Sectoriel\n• Partie 8 - Sectoriel';
      case 5: // Module 6 - Analyse technique
        return '• Partie 1\n• Partie 2\n• Partie 3\n• Partie 4\n• Partie 5\n• Partie 6.A - Les figures de continuation\n• Partie 6.B\n• Partie 7\n• Partie 8\n• Partie 9 - La méthode Wickoff et l\'analyse comportementale';
      case 6: // Module 7 - La psychologie du trader
        return '• La psychologie du trader';
      case 7: // Module 8 - La gestion des risques
        return '• Partie 1\n• Partie 2';
      case 8: // Module 9 - Les mathématiques en trading
        return '• Partie 1\n• Partie 2\n• Partie 3\n• Partie 4\n• Partie 5';
      case 9: // Module 10 - Cas pratique
        return '• Cas pratique 1';
      case 10: // Module 11 - Récap de marché
        return '• Récap de marché 1\n• Récap de marché 2\n• Récap de marché 3\n• Récap de marché 4\n• Récap de marché 5';
      case 11: // Module BONUS - Liens utiles
        return '• Liens utiles';
      default:
        return 'Contenu détaillé du module en cours de développement...';
    }
  }
}
