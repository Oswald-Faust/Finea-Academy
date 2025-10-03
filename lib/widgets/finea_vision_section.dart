import 'package:flutter/material.dart';

class FineaVisionSection extends StatelessWidget {
  const FineaVisionSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 1, vertical: 20),
      child: Column(
        children: [
          // Titre centré
          const Text(
            'La vision de Finéa',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Cartes séparées avec bordures individuelles
          Column(
            children: [
              // Première carte : Clé à droite (avec bordure du bas à moitié)
              _buildVisionCard(
                title: 'Rendre l\'investissement accessible à tous',
                description: 'On guide chacun, pas à pas, pour comprendre les bases de l\'investissement et faire ses premiers choix en toute confiance.',
                imagePath: 'assets/images/cle-removebg-preview.png',
                iconPosition: IconPosition.right,
                halfBottomBorder: true,
              ),
              
              // Deuxième carte : Argent à gauche (avec bordure du haut à moitié)
              _buildVisionCard(
                title: 'Comprendre l\'économie',
                description: 'Parce qu\'investir sans comprendre le monde qui nous entoure, c\'est naviguer à l\'aveugle. On aide chacun à décrypter l\'économie pour mieux agir.',
                imagePath: 'assets/images/money.png',
                iconPosition: IconPosition.left,
                halfTopBorder: true,
              ),
              
              const SizedBox(height: 1),
              
              // Troisième carte : Horloge à droite
              _buildVisionCard(
                title: 'Créer un vrai plan de développement personnel et financier',
                description: 'On propose des stratégies concrètes pour développer son capital, mais aussi pour structurer une activité durable autour de l\'investissement.',
                imagePath: 'assets/images/horloge.png',
                iconPosition: IconPosition.right,
              ),
              
              const SizedBox(height: 1),
              
              // Quatrième carte : Accompagnement à gauche
              _buildVisionCard(
                title: 'Un accompagnement simple, clair et humain',
                description: 'Pas de jargon, pas de barrière : notre mission, c\'est de rendre l\'éducation financière simple et utile, pour que chacun prenne le contrôle de son avenir.',
                imagePath: 'assets/images/person.png',
                iconPosition: IconPosition.left,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVisionCard({
    required String title,
    required String description,
    required String imagePath,
    required IconPosition iconPosition,
    bool hideTopBorder = false,
    bool hideBottomBorder = false,
    bool halfTopBorder = false,
    bool halfBottomBorder = false,
  }) {
    return Stack(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(12),
            border: Border(
              top: hideTopBorder ? BorderSide.none : BorderSide(color: Colors.blue, width: 1.5),
              left: BorderSide(color: Colors.blue, width: 1.5),
              right: BorderSide(color: Colors.blue, width: 1.5),
              bottom: hideBottomBorder ? BorderSide.none : BorderSide(color: Colors.blue, width: 1.5),
            ),
          ),
          child: Row(
        children: [
          if (iconPosition == IconPosition.left) ...[
            _buildIconContainer(imagePath),
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
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 10,
                    height: 1.3,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ),
          
          if (iconPosition == IconPosition.right) ...[
            const SizedBox(width: 16),
            _buildIconContainer(imagePath),
          ],
        ],
      ),
        ),
        
        // Bordure du haut à moitié
        if (halfTopBorder)
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                width: 100,
                height: 1.5,
                color: Colors.blue,
              ),
            ),
          ),
        
        // Bordure du bas à moitié
        if (halfBottomBorder)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                width: 100,
                height: 1.5,
                color: Colors.blue,
              ),
            ),
          ),
      ],
    );
  }

      Widget _buildIconContainer(String imagePath) {
        return Container(
          width: 120,
          height: 120,
          child: Image.asset(
            imagePath,
            fit: BoxFit.scaleDown,
            width: 120,
            height: 120,
          ),
        );
      }
}

enum IconPosition { left, right }