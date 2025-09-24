import 'package:flutter/material.dart';
import 'dart:async';

class MT5AccountCard extends StatefulWidget {
  final VoidCallback? onTap;

  const MT5AccountCard({
    super.key,
    this.onTap,
  });

  @override
  State<MT5AccountCard> createState() => _MT5AccountCardState();
}

class _MT5AccountCardState extends State<MT5AccountCard> {
  late PageController _pageController;
  late Timer _timer;
  int _currentIndex = 0;

  // Données fictives pour le slider des gagnants
  final List<Map<String, dynamic>> _winnersData = [
    {
      'date': '01/01/2025',
      'winner': '@trader_pro',
      'prize': '1000€',
    },
    {
      'date': '08/01/2025',
      'winner': '@crypto_master',
      'prize': '600€',
    },
    {
      'date': '15/01/2025',
      'winner': '@investor_elite',
      'prize': '300€',
    },
    {
      'date': '22/01/2025',
      'winner': '@trading_guru',
      'prize': '800€',
    },
    {
      'date': '29/01/2025',
      'winner': '@market_wizard',
      'prize': '500€',
    },
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _startAutoScroll();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _timer.cancel();
    super.dispose();
  }

  void _startAutoScroll() {
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_pageController.hasClients) {
        _currentIndex = (_currentIndex + 1) % _winnersData.length;
        _pageController.animateToPage(
          _currentIndex,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
      }
    });
  }

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
          
          const SizedBox(height: 16),
          
          // Slider des tirages
          Container(
            height: 200,
            child: PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              itemCount: _winnersData.length,
              itemBuilder: (context, index) {
                final winner = _winnersData[index];
                return _buildTirageCard(winner);
              },
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Indicateurs de position
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              _winnersData.length,
              (index) => Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _currentIndex == index
                      ? Colors.white
                      : Colors.white.withOpacity(0.3),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTirageCard(Map<String, dynamic> winner) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.blue,
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Contenu textuel
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tirage du : ${winner['date'] ?? '01/01/2025'}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Gagnant : ${winner['winner'] ?? '@gagnant'}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Gains : ${winner['prize'] ?? '300€'}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Adresse ETHscan',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ],
                ),
              ),
              
              // Image trophée
              Container(
                width: 120,
                height: 120,
                child: Image.asset(
                  'assets/images/trophee.png',
                  fit: BoxFit.contain,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 8),
          
          // Chevron vers le bas
          const Icon(
            Icons.keyboard_arrow_down,
            color: Colors.white,
            size: 20,
          ),
        ],
      ),
    );
  }

}