import 'package:flutter/material.dart';
import '../widgets/contest_video_section.dart';
import '../widgets/contest_countdown_section.dart';
import '../widgets/contest_winner_card.dart';
import '../widgets/mt5_account_card.dart';
import 'profile_screen.dart'; // Added import for ProfileScreen

class ConcoursScreen extends StatelessWidget {
  const ConcoursScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f23),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.person, color: Colors.white),
            onPressed: () {
              // Navigation vers le profil
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
            // SECTION VIDÉO
            ContestVideoSection(
              onPlayVideo: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Lecture de la vidéo...'),
                    backgroundColor: Colors.blue,
                  ),
                );
              },
              onTakeSpots: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Réservation de vos places...'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
            ),
            
            const SizedBox(height: 24),
            
            // SECTION COMPTE À REBOURS
            const ContestCountdownSection(),
            
            const SizedBox(height: 24),
            
            // SECTION GAGNANT DU CONCOURS
            const Text(
              "Le gagnant du jeu concours !",
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
            ),
            
            const SizedBox(height: 16),
            
            ContestWinnerCard(
              drawDate: "01/01/2025",
              winner: "@username",
              gains: "147€",
              ethscanAddress: "0x1234...5678",
              onTap: () {
                // Navigation vers les détails du gagnant
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Détails du gagnant'),
                    backgroundColor: Colors.blue,
                  ),
                );
              },
            ),
            
            const SizedBox(height: 24),
            
            // SECTION COMPTE MT5
            MT5AccountCard(
              onTap: () {
                // Navigation vers les détails du compte MT5
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Accès au compte MT5'),
                    backgroundColor: Colors.purple,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
} 