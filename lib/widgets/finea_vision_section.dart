import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';

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
          // Titre de la section sans design arrondi
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: const Text(
              'La vision de Finéa',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white,
                fontSize: 26,
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
                letterSpacing: 0.5,
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Liste des éléments de vision sans animations
          Column(
            children: [
              // Premier élément : Rendre l'investissement accessible à tous
              _buildVisionCard(
                title: 'Rendre l\'investissement accessible à tous',
                description: 'On guide chacun, pas à pas, pour comprendre les bases de l\'investissement et faire ses premiers choix en toute confiance.',
                imagePath: 'assets/images/key.png',
                imagePosition: ImagePosition.right,
                isFirst: true,
                isLast: false,
              ),
              
              // Deuxième élément : Comprendre l'économie
              _buildVisionCard(
                title: 'Comprendre l\'économie',
                description: 'Parce qu\'investir sans comprendre le monde qui nous entoure, c\'est naviguer à l\'aveugle. On aide chacun à décrypter l\'économie pour mieux agir.',
                imagePath: 'assets/images/money.png',
                imagePosition: ImagePosition.left,
                isFirst: false,
                isLast: false,
              ),
              
              // Troisième élément : Créer un vrai plan de développement
              _buildVisionCard(
                title: 'Créer un vrai plan de développement personnel et financier',
                description: 'On propose des stratégies concrètes pour développer son capital, mais aussi pour structurer une activité durable autour de l\'investissement.',
                imagePath: 'assets/images/horloge.png',
                imagePosition: ImagePosition.right,
                isFirst: false,
                isLast: false,
              ),
              
              // Quatrième élément : Accompagnement simple et humain
              _buildVisionCard(
                title: 'Un accompagnement simple, clair et humain',
                description: 'Pas de jargon, pas de barrière : notre mission, c\'est de rendre l\'éducation financière simple et utile, pour que chacun prenne le contrôle de son avenir.',
                imagePath: 'assets/images/person.png',
                imagePosition: ImagePosition.left,
                isFirst: false,
                isLast: true,
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
    required ImagePosition imagePosition,
    bool isFirst = false,
    bool isLast = false,
  }) {
    // Définir les bordures arrondies selon la position
    BorderRadius borderRadius;
    if (isFirst) {
      // Première section : arrondie partout sauf en bas
      borderRadius = const BorderRadius.only(
        topLeft: Radius.circular(12),
        topRight: Radius.circular(12),
        bottomLeft: Radius.circular(0),
        bottomRight: Radius.circular(0),
      );
    } else if (isLast) {
      // Dernière section : arrondie partout sauf en haut
      borderRadius = const BorderRadius.only(
        topLeft: Radius.circular(0),
        topRight: Radius.circular(0),
        bottomLeft: Radius.circular(12),
        bottomRight: Radius.circular(12),
      );
    } else {
      // Sections du milieu : arrondies partout
      borderRadius = BorderRadius.circular(12);
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.purple, width: 1),
        borderRadius: borderRadius,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (imagePosition == ImagePosition.left) ...[
            _buildImageContainer(imagePath),
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
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    height: 1.4,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ),
          
          if (imagePosition == ImagePosition.right) ...[
            const SizedBox(width: 16),
            _buildImageContainer(imagePath),
          ],
        ],
      ),
    );
  }

  Widget _buildImageContainer(String imagePath) {
    return Container(
      width: 120,
      height: 120,
      child: Image.asset(
        imagePath,
        fit: BoxFit.contain,
      ),
    );
  }
}

enum ImagePosition { left, right } 