import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/contest_stats_service.dart';
import '../services/auth_service.dart';
import 'contest_winner_card.dart';

class LastWinnerSliderWidget extends StatefulWidget {
  const LastWinnerSliderWidget({super.key});

  @override
  State<LastWinnerSliderWidget> createState() => _LastWinnerSliderWidgetState();
}

class _LastWinnerSliderWidgetState extends State<LastWinnerSliderWidget> {
  FirstPlaceWinner? _firstPlaceWinner;
  ContestStats? _stats;
  bool _isLoading = true;
  PageController _pageController = PageController();
  Timer? _timer;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoSlide() {
    // Ne démarrer le timer que si on a des gagnants
    if (_stats != null && _stats!.recentWinners.length > 1) {
      _timer = Timer.periodic(Duration(seconds: 5), (timer) {
        if (_stats != null && _stats!.recentWinners.isNotEmpty) {
          _currentIndex = (_currentIndex + 1) % _stats!.recentWinners.length;
          if (_pageController.hasClients) {
            _pageController.animateToPage(
              _currentIndex,
              duration: Duration(milliseconds: 500),
              curve: Curves.easeInOut,
            );
          }
        }
      });
    }
  }

  Future<void> _loadData() async {
    try {
      // Récupérer l'ID de l'utilisateur connecté
      String? currentUserId;
      if (mounted) {
        try {
          final authService = Provider.of<AuthService>(context, listen: false);
          currentUserId = authService.currentUser?.id;
        } catch (e) {
          // AuthService non disponible dans le contexte
        }
      }

      // Charger le gagnant #1 avec l'adresse ETH
      final contestService = ContestStatsService();
      final firstPlace = await contestService.getFirstPlaceWinner(currentUserId);
      
      // Charger les statistiques générales
      final stats = await contestService.getContestStats(forceRefresh: true);
      
      if (mounted) {
        setState(() {
          _firstPlaceWinner = firstPlace;
          _stats = stats;
          _isLoading = false;
        });
        // Démarrer l'auto-slide après le chargement des données
        _startAutoSlide();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _firstPlaceWinner = null;
          _stats = null;
          _isLoading = false;
        });
      }
    }
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
        height: 140,
        child: Center(
          child: CircularProgressIndicator(
            color: Colors.white.withOpacity(0.7),
          ),
        ),
      );
    }

    // Si on a un gagnant #1, l'afficher en priorité
    if (_firstPlaceWinner != null) {
      return SizedBox(
        height: 140,
        child: ContestWinnerCard(
          drawDate: _formatDate(_firstPlaceWinner!.drawDate),
          winner: _firstPlaceWinner!.displayName,
          gains: _firstPlaceWinner!.formattedAmount,
          ethAddress: _firstPlaceWinner!.ethAddress,
          isCurrentUser: _firstPlaceWinner!.isCurrentUser,
          onTap: () {},
        ),
      );
    }

    // Si pas de gagnant #1 mais des gagnants récents, les afficher en slider
    if (_stats != null && _stats!.recentWinners.isNotEmpty) {
      final allWinners = _stats!.recentWinners.toList();

      return SizedBox(
        height: 140,
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
            return ContestWinnerCard(
              drawDate: _formatDate(winner.drawDate),
              winner: winner.fullName,
              gains: winner.formattedAmount,
              ethAddress: winner.ethAddress,
              isCurrentUser: false,
              onTap: () {},
            );
          },
        ),
      );
    }

    // Si pas de gagnants, afficher une carte par défaut avec un message
    return SizedBox(
      height: 140,
      child: Container(
        padding: EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.white.withOpacity(0.2),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Le gagnant du dernier tirage !',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Aucun gagnant encore',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 12,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  Text(
                    'Participez au prochain tirage !',
                    style: TextStyle(
                      color: Colors.blue,
                      fontSize: 12,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
            ),
            Image.asset(
              'assets/images/gifttrophy.gif',
              width: 80,
              height: 80,
              errorBuilder: (context, error, stackTrace) {
                return Icon(
                  Icons.emoji_events,
                  color: Colors.amber,
                  size: 60,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
