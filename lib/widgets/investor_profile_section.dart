import 'package:flutter/material.dart';

class InvestorProfileSection extends StatelessWidget {
  final VoidCallback? onDiscoverProfile;

  const InvestorProfileSection({
    super.key,
    this.onDiscoverProfile,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Titre centré
          const Text(
            'Quel investisseur es-tu ?',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Contenu avec illustration et premier texte
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Illustration avec l'image kind-invester.png
              Container(
                width: 140,
                height: 140,
                child: Image.asset(
                  'assets/images/kind-invester.png',
                  width: 160,
                  height: 160,
                  fit: BoxFit.cover,
                ),
              ),
              
              const SizedBox(width: 18),
              
              // Premier paragraphe
              Expanded(
                child: Text(
                  'Ton profil investisseur, c\'est ton GPS financier. On scanne ton rapport au risque, ton cashflow et ton horizon, pour générer une stratégie sur mesure. Plus de pilotage à l\'aveugle. Place à la donnée.',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    height: 1.3,
                    fontFamily: 'Poppins',
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 8),
          
          // Deuxième paragraphe - prend toute la largeur
          RichText(
            text: const TextSpan(
              style: TextStyle(
                color: Colors.white,
                fontSize: 10,
                height: 1.3,
                fontFamily: 'Poppins',
              ),
              children: [
                TextSpan(
                  text: 'Le profil investisseur, c\'est une sorte de carte d\'identité financière. Il sert à définir quel type d\'investisseur tu es, en fonction de plusieurs critères ',
                ),
                TextSpan(
                  text: 'Lire plus....',
                  style: TextStyle(
                    color: Colors.purple,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Bouton "Découvrir mon profil investisseur" avec bordures arrondies
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.purple, width: 1),
                borderRadius: BorderRadius.circular(25),
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: onDiscoverProfile,
                  borderRadius: BorderRadius.circular(25),
                  child: const Text(
                    'Découvrir mon profil investisseur',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
} 