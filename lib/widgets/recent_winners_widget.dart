import 'package:flutter/material.dart';
import '../services/contest_stats_service.dart';

class RecentWinnersWidget extends StatefulWidget {
  const RecentWinnersWidget({super.key});

  @override
  State<RecentWinnersWidget> createState() => _RecentWinnersWidgetState();
}

class _RecentWinnersWidgetState extends State<RecentWinnersWidget> {
  ContestStats? _stats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      final stats = await ContestStatsService().getContestStats();
      if (mounted) {
        setState(() {
          _stats = stats;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Container(
        height: 120,
        child: Center(
          child: CircularProgressIndicator(
            color: Colors.white.withOpacity(0.7),
          ),
        ),
      );
    }

    if (_stats == null || _stats!.recentWinners.isEmpty) {
      return Container(
        height: 120,
        child: Center(
          child: Text(
            'Aucun gagnant récent',
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 16,
              fontFamily: 'Poppins',
            ),
          ),
        ),
      );
    }

    return Container(
      height: 120,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _stats!.recentWinners.length,
        itemBuilder: (context, index) {
          final winner = _stats!.recentWinners[index];
          return _buildWinnerCard(winner);
        },
      ),
    );
  }

  Widget _buildWinnerCard(ContestWinner winner) {
    return Container(
      width: 280,
      margin: EdgeInsets.only(right: 16),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.yellow.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.emoji_events,
                  color: Colors.yellow,
                  size: 20,
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tirage du: ${_formatDate(winner.drawDate)}',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 12,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Gagnant: ${winner.firstName} ${winner.lastName}',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Gains: ${winner.formattedAmount}',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  Text(
                    'Adresse ETHscan',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 10,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
              Container(
                padding: EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.purple.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.keyboard_arrow_down,
                  color: Colors.purple,
                  size: 20,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year;
    return '$day/$month/$year';
  }
}
