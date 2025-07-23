import 'package:flutter/material.dart';

class MT5AccountCard extends StatelessWidget {
  final VoidCallback? onTap;

  const MT5AccountCard({
    super.key,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Titre "Découvrir tout les gagnants"
          const Text(
            'Découvrir tout les gagnants',
            style: TextStyle(
              color: Color(0xFFB0B0B0),
              fontSize: 14,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 12),
          
          // Carte MT5
          Container(
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
                // Informations MT5
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'MT5',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      
                      const SizedBox(height: 12),
                      
                      _buildInfoRow('Login :', ''),
                      const SizedBox(height: 8),
                      _buildInfoRow('Mot de passe :', ''),
                      const SizedBox(height: 8),
                      _buildInfoRow('Serveur :', ''),
                    ],
                  ),
                ),
                
                const SizedBox(width: 16),
                
                // Icône clé 3D
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.purple.withOpacity(0.8),
                        Colors.blue.withOpacity(0.6),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withOpacity(0.2), width: 1),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.purple.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.key,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Texte explicatif
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
            ),
            child: const Text(
              'Les mots de passe investisseur sont partagés uniquement le samedi et le dimanche, puis modifiés apres le tirage au sort chaque dimanche. Cela permet d\'éviter tout vol ou copie des trades en cours de semaine. Grâce à ces accès, vous pourrez suivre en toute transparence tous les trades via l\'application MT4',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                height: 1.4,
                fontFamily: 'Poppins',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w500,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }
} 