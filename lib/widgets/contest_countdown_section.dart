import 'package:flutter/material.dart';

class ContestCountdownSection extends StatefulWidget {
  const ContestCountdownSection({super.key});

  @override
  State<ContestCountdownSection> createState() => _ContestCountdownSectionState();
}

class _ContestCountdownSectionState extends State<ContestCountdownSection> {
  late DateTime _targetDate;
  late Duration _timeLeft;
  
  @override
  void initState() {
    super.initState();
    // Date cible : Dimanche 6 juillet 2025 à 19h
    _targetDate = DateTime(2025, 7, 6, 19, 0);
    _timeLeft = _targetDate.difference(DateTime.now());
    
    // Mettre à jour le compte à rebours chaque seconde
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          _timeLeft = _targetDate.difference(DateTime.now());
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Titre du compte à rebours
          const Text(
            'Prochain tirage dans :',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Compte à rebours
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.blue.withOpacity(0.2),
                  Colors.purple.withOpacity(0.1),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildTimeUnit('${_timeLeft.inDays}', 'j'),
                _buildTimeUnit('${_timeLeft.inHours % 24}', 'h'),
                _buildTimeUnit('${_timeLeft.inMinutes % 60}', 'm'),
                _buildTimeUnit('${_timeLeft.inSeconds % 60}', 's'),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Date et heure du tirage
          const Text(
            'Dimanche 6 juillet 2025 à 19h',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w500,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Icônes des réseaux sociaux
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Instagram
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFE4405F), Color(0xFF833AB4)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFE4405F).withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.camera_alt,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              
              const SizedBox(width: 20),
              
              // TikTok
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF25F4EE), Color(0xFFFE2C55)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF25F4EE).withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.music_note,
                  color: Colors.white,
                  size: 24,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimeUnit(String value, String unit) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.white.withOpacity(0.2), width: 1),
          ),
          child: Text(
            value.padLeft(2, '0'),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          unit,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w500,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }
} 