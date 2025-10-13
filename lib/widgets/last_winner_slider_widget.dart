import 'dart:async';
import 'package:flutter/material.dart';
import '../services/contest_stats_service.dart';
import 'contest_winner_card.dart';

class LastWinnerSliderWidget extends StatefulWidget {
  const LastWinnerSliderWidget({super.key});

  @override
  State<LastWinnerSliderWidget> createState() => _LastWinnerSliderWidgetState();
}

class _LastWinnerSliderWidgetState extends State<LastWinnerSliderWidget> {
  ContestStats? _stats;
  bool _isLoading = true;
  PageController _pageController = PageController();
  Timer? _timer;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadStats();
    _startAutoSlide();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoSlide() {
    _timer = Timer.periodic(Duration(seconds: 5), (timer) {
      if (_stats != null && _stats!.recentWinners.isNotEmpty) {
        _currentIndex = (_currentIndex + 1) % _stats!.recentWinners.length;
        _pageController.animateToPage(
          _currentIndex,
          duration: Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  Future<void> _loadStats() async {
    try {
      final stats = await ContestStatsService().getContestStats();
      if (mounted) {
        setState(() {
          // Pour l'instant, utiliser toujours les données de test
          _stats = stats ?? _createTestStats();
          _isLoading = false;
        });
      }
    } catch (e) {
      // En cas d'erreur, créer des données de test pour voir le slider
      if (mounted) {
        setState(() {
          _stats = _createTestStats();
          _isLoading = false;
        });
      }
    }
    
    // Toujours utiliser les données de test pour l'instant
    if (mounted && (_stats == null || _stats!.recentWinners.isEmpty)) {
      setState(() {
        _stats = _createTestStats();
        _isLoading = false;
      });
    }
  }

  ContestStats _createTestStats() {
    print('🎯 Création des données de test pour LastWinnerSliderWidget');
    final testWinners = [
      ContestWinner(
        contestTitle: 'Concours Hebdomadaire #1',
        drawDate: DateTime.now().subtract(Duration(days: 7)),
        firstName: 'Jean',
        lastName: 'Dupont',
        prize: '58€',
        amount: 58.0,
      ),
      ContestWinner(
        contestTitle: 'Concours Hebdomadaire #2',
        drawDate: DateTime.now().subtract(Duration(days: 14)),
        firstName: 'Marie',
        lastName: 'Martin',
        prize: '125€',
        amount: 125.0,
      ),
      ContestWinner(
        contestTitle: 'Concours Hebdomadaire #3',
        drawDate: DateTime.now().subtract(Duration(days: 21)),
        firstName: 'Pierre',
        lastName: 'Durand',
        prize: '200€',
        amount: 200.0,
      ),
    ];

    return ContestStats(
      totalGains: 383,
      totalPlacesSold: 500,
      totalWinners: 3,
      recentWinners: testWinners,
    );
  }

  String _formatDate(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year;
    return '$day/$month/$year';
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Container(
        height: 200,
        child: Center(
          child: CircularProgressIndicator(
            color: Colors.white.withOpacity(0.7),
          ),
        ),
      );
    }

    // Si pas de gagnants, afficher une carte par défaut
    if (_stats == null || _stats!.recentWinners.isEmpty) {
      print('🎯 Aucun gagnant trouvé, affichage de la carte par défaut');
      return SizedBox(
        height: 180,
        child: ContestWinnerCard(
          drawDate: "01/01/2025",
          winner: "@username",
          gains: "147€",
          ethscanAddress: "0x1234...5678",
          onTap: () {
            print('Gagnant par défaut sélectionné');
          },
        ),
      );
    }

    // Créer une liste avec le dernier gagnant en premier, puis les autres
    final allWinners = _stats!.recentWinners.toList();
    
    print('🎯 LastWinnerSliderWidget: ${allWinners.length} gagnants trouvés');

    return SizedBox(
      height: 180,
      child: PageView.builder(
        controller: _pageController,
        itemCount: allWinners.length,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        itemBuilder: (context, index) {
          final winner = allWinners[index];
          return Container(
            margin: EdgeInsets.symmetric(horizontal: 16),
            child: ContestWinnerCard(
              drawDate: _formatDate(winner.drawDate),
              winner: winner.fullName,
              gains: winner.formattedAmount,
              ethscanAddress: "0x1234...5678",
              onTap: () {
                print('Gagnant sélectionné: ${winner.fullName}');
              },
            ),
          );
        },
      ),
    );
  }
}
