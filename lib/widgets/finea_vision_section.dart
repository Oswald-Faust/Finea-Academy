import 'package:flutter/material.dart';

class FineaVisionSection extends StatelessWidget {
  const FineaVisionSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Titre de la section
          const Text(
            'La vision de Finéa',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Premier élément : Rendre l'investissement accessible à tous
          _buildVisionCard(
            title: 'Rendre l\'investissement accessible à tous',
            description: 'On guide chacun, pas à pas, pour comprendre les bases de l\'investissement et faire ses premiers choix en toute confiance.',
            icon: Icons.lock_open,
            iconColor: Colors.purple,
            iconPosition: IconPosition.right,
          ),
          
          const SizedBox(height: 16),
          
          // Deuxième élément : Comprendre l'économie
          _buildVisionCard(
            title: 'Comprendre l\'économie',
            description: 'Parce qu\'investir sans comprendre le monde qui nous entoure, c\'est naviguer à l\'aveugle. On aide chacun à décrypter l\'économie pour mieux agir.',
            icon: Icons.account_balance_wallet,
            iconColor: Colors.purple,
            iconPosition: IconPosition.left,
          ),
          
          const SizedBox(height: 16),
          
          // Troisième élément : Créer un vrai plan de développement
          _buildVisionCard(
            title: 'Créer un vrai plan de développement personnel et financier',
            description: 'On propose des stratégies concrètes pour développer son capital, mais aussi pour structurer une activité durable autour de l\'investissement.',
            icon: Icons.explore,
            iconColor: Colors.purple,
            iconPosition: IconPosition.right,
          ),
          
          const SizedBox(height: 16),
          
          // Quatrième élément : Accompagnement simple et humain
          _buildVisionCard(
            title: 'Un accompagnement simple, clair et humain',
            description: 'Pas de jargon, pas de barrière : notre mission, c\'est de rendre l\'éducation financière simple et utile, pour que chacun prenne le contrôle de son avenir.',
            icon: Icons.people,
            iconColor: Colors.purple,
            iconPosition: IconPosition.left,
          ),
        ],
      ),
    );
  }

  Widget _buildVisionCard({
    required String title,
    required String description,
    required IconData icon,
    required Color iconColor,
    required IconPosition iconPosition,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF1a1a2e).withOpacity(0.8),
            const Color(0xFF16213e).withOpacity(0.6),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (iconPosition == IconPosition.left) ...[
            _buildIconContainer(icon, iconColor),
            const SizedBox(width: 16),
          ],
          
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  style: const TextStyle(
                    color: Color(0xFFE6E6E6),
                    fontSize: 14,
                    height: 1.4,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ),
          
          if (iconPosition == IconPosition.right) ...[
            const SizedBox(width: 16),
            _buildIconContainer(icon, iconColor),
          ],
        ],
      ),
    );
  }

  Widget _buildIconContainer(IconData icon, Color color) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withOpacity(0.3),
            color.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Icon(
        icon,
        color: color,
        size: 24,
      ),
    );
  }
}

enum IconPosition { left, right } 