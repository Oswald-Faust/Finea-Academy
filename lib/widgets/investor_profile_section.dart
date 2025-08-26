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
              
              // Premier paragraphe avec icône graphique
              Expanded(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      child: const Icon(
                        Icons.bar_chart,
                        color: Colors.blue,
                        size: 16,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Ton profil investisseur, c\'est ton GPS financier. On scanne ton rapport au risque, ton cashflow et ton horizon, pour générer une stratégie sur mesure. Plus de pilotage à l\'aveugle. Place à la donnée.',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          height: 1.5,
                          fontFamily: 'Poppins',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Deuxième paragraphe avec icône loupe - prend toute la largeur
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(4),
                child: const Icon(
                  Icons.search,
                  color: Colors.purple,
                  size: 16,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: RichText(
                  text: const TextSpan(
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      height: 1.5,
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
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          
          // Bouton "Découvrir mon profil investisseur" avec bordures arrondies
          Container(
            width: double.infinity,
            height: 50,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.purple, width: 1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onDiscoverProfile,
                borderRadius: BorderRadius.circular(12),
                child: const Center(
                  child: Text(
                    'Découvrir mon profil investisseur',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
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