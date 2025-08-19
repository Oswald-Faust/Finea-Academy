import 'package:flutter/material.dart';
import 'dart:async'; // Added for Timer

class ContestCountdownSection extends StatefulWidget {
  final DateTime targetDate;
  final String title;
  
  const ContestCountdownSection({
    super.key,
    required this.targetDate,
    this.title = 'Prochain tirage dans :',
  });

  @override
  State<ContestCountdownSection> createState() => _ContestCountdownSectionState();
}

class _ContestCountdownSectionState extends State<ContestCountdownSection> {
  late Duration _timeLeft;
  Timer? _timer;
  
  @override
  void initState() {
    super.initState();
    _updateTimeLeft();
    
    // Mettre à jour le compte à rebours chaque seconde
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _updateTimeLeft();
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _updateTimeLeft() {
    _timeLeft = widget.targetDate.difference(DateTime.now());
    
    // Si le temps est écoulé, arrêter le timer
    if (_timeLeft.isNegative) {
      _timer?.cancel();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
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
      child: Column(
        children: [
          // Titre du compte à rebours
          Text(
            widget.title,
            style: const TextStyle(
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
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.2), width: 1),
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
          Text(
            'Tirage le ${_formatDate(widget.targetDate)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w500,
              fontFamily: 'Poppins',
            ),
          ),
          
          const SizedBox(height: 24),
          
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

  String _formatDate(DateTime date) {
    final days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    final months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    return '${days[date.weekday - 1]} ${date.day} ${months[date.month - 1]} ${date.year} à ${date.hour.toString().padLeft(2, '0')}h${date.minute.toString().padLeft(2, '0')}';
  }
} 