import 'package:flutter/material.dart';

class WinnerAnnouncementCard extends StatelessWidget {
  final String contestTitle;
  final bool hasWinners;
  final List<Map<String, dynamic>>? winners;
  final DateTime drawDate;
  final bool isCurrentUserWinner;

  const WinnerAnnouncementCard({
    super.key,
    required this.contestTitle,
    required this.hasWinners,
    this.winners,
    required this.drawDate,
    this.isCurrentUserWinner = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1E40AF), // Bleu foncé
            Color(0xFF7C3AED), // Violet
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E40AF).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Motifs décoratifs
          Positioned(
            top: -50,
            right: -50,
            child: Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: -30,
            left: -30,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                shape: BoxShape.circle,
              ),
            ),
          ),
          
          // Contenu principal
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                // En-tête avec tirage
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        hasWinners 
                          ? 'Tirage du: ${_formatDate(drawDate)}'
                          : 'Prochain tirage dans :',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          fontFamily: 'Poppins',
                        ),
                      ),
                    ),
                    const Spacer(),
                    const Icon(
                      Icons.keyboard_arrow_down,
                      color: Colors.white,
                      size: 24,
                    ),
                  ],
                ),
                
                const SizedBox(height: 24),
                
                // Gagnant principal ou message d'attente
                Row(
                  children: [
                    // Icône trophée
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Icon(
                        hasWinners ? Icons.emoji_events : Icons.access_time,
                        color: Colors.white,
                        size: 40,
                      ),
                    ),
                    
                    const SizedBox(width: 16),
                    
                    // Informations gagnant ou message d'attente
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            hasWinners ? 'Gagnant: @' : 'En attente du tirage',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Poppins',
                            ),
                          ),
                          const SizedBox(height: 4),
                          if (hasWinners && winners != null && winners!.isNotEmpty) ...[
                            Text(
                              'Gains : Accès MT5 Premium',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.9),
                                fontSize: 14,
                                fontFamily: 'Poppins',
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Position #${winners!.first['position']}',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.9),
                                fontSize: 14,
                                fontFamily: 'Poppins',
                              ),
                            ),
                          ] else ...[
                            Text(
                              'Le tirage aura lieu le ${_formatDate(drawDate)}',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.9),
                                fontSize: 14,
                                fontFamily: 'Poppins',
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Dimanche à 19h00',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.9),
                                fontSize: 14,
                                fontFamily: 'Poppins',
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 24),
                
                // Section MT5
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.vpn_key,
                            color: Colors.white.withOpacity(0.8),
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          const Text(
                            'MT5',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Poppins',
                            ),
                          ),
                          const Spacer(),
                          const Icon(
                            Icons.keyboard_arrow_down,
                            color: Colors.white,
                            size: 24,
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                                             _buildMT5Field('Login :', hasWinners && winners != null && winners!.isNotEmpty 
                         ? (winners!.first['mt5Access']?['login'] ?? '•••••••••') 
                         : '•••••••••'),
                       const SizedBox(height: 8),
                       _buildMT5Field('Mot de passe :', hasWinners && winners != null && winners!.isNotEmpty 
                         ? (winners!.first['mt5Access']?['password'] ?? '•••••••••') 
                         : '•••••••••'),
                       const SizedBox(height: 8),
                       _buildMT5Field('Serveur :', hasWinners && winners != null && winners!.isNotEmpty 
                         ? (winners!.first['mt5Access']?['server'] ?? '•••••••••') 
                         : '•••••••••'),
                    ],
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Note explicative
                Text(
                  'Les mots de passe investisseur sont partagés uniquement le samedi et le dimanche, puis modifiés après le tirage au sort chaque dimanche. Cela permet d\'éviter tout vol ou copie des trades en cours de semaine. Grâce à ces accès, vous pourrez suivre en toute transparence tous les trades via l\'application MT4',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 12,
                    fontFamily: 'Poppins',
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMT5Field(String label, String value) {
    return Row(
      children: [
        Expanded(
          flex: 2,
          child: Text(
            label,
            style: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontSize: 14,
              fontFamily: 'Poppins',
            ),
          ),
        ),
        Expanded(
          flex: 3,
          child: Text(
            value.isEmpty ? '•••••••••' : value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontFamily: 'Poppins',
            ),
          ),
        ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}
