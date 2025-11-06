import 'package:flutter/material.dart';
import '../models/contest_model.dart';
import '../services/contest_service.dart';
import '../services/contest_stats_service.dart';
import '../widgets/finea_app_bar.dart';
import '../widgets/youtube_video_player.dart';
import '../widgets/myfxbook_widget.dart';
import '../widgets/last_winner_slider_widget.dart';
import '../config/youtube_config.dart';
import 'profile_screen.dart';
import 'package:url_launcher/url_launcher.dart';

class ConcoursScreen extends StatefulWidget {
  const ConcoursScreen({super.key});

  @override
  State<ConcoursScreen> createState() => _ConcoursScreenState();
}

class _ConcoursScreenState extends State<ConcoursScreen> {
  Contest? _currentContest;
  bool _isLoading = true;
  bool _isParticipating = false;
  ContestStats? _contestStats;

  @override
  void initState() {
    super.initState();
    _loadContestData();
    _loadContestStats();
  }

  Future<void> _loadContestData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final contest = await ContestService.getCurrentWeeklyContest();
      
      if (mounted) {
        setState(() {
          _currentContest = contest;
          _isLoading = false;
        });

        if (contest != null) {
          _checkUserParticipation();
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        _showErrorSnackBar('Erreur lors du chargement du concours');
      }
    }
  }

  Future<void> _loadContestStats() async {
    try {
      final stats = await ContestStatsService().getContestStats();
      if (mounted) {
        setState(() {
          _contestStats = stats;
        });
      }
    } catch (e) {
      print('Erreur lors du chargement des statistiques: $e');
    }
  }

  Future<void> _checkUserParticipation() async {
    if (_currentContest == null) return;
    
    try {
      final isParticipating = await ContestService.isUserParticipating(_currentContest!.id);
      if (mounted) {
        setState(() {
          _isParticipating = isParticipating;
        });
      }
    } catch (e) {
      print('Erreur lors de la vérification de participation: $e');
    }
  }



  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f23),
      body: Stack(
        children: [
               // Image de fond en plein écran
               Positioned.fill(
                 child: Align(
                   alignment: Alignment.centerLeft,
                   child: Image.asset(
                     'assets/images/roue fondu.png',
                     fit: BoxFit.cover,
                     width: double.infinity,
                     height: double.infinity,
                     alignment: Alignment.centerLeft,
                   ),
                 ),
               ),
          // Couche de transparence grise par-dessus l'image
          Positioned.fill(
            child: Container(
              color: Colors.black.withOpacity(0.4),
            ),
          ),
          // Contenu principal
          Column(
            children: [
              FineaAppBar(
                actions: [
                  IconButton(
                    icon: const Icon(Icons.person, color: Colors.white),
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => const ProfileScreen(),
                        ),
                      );
                    },
                  ),
                ],
              ),
              Expanded(
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(
                          color: Colors.blue,
                        ),
                      )
                    : _currentContest == null
                        ? _buildNoContestView()
                        : _buildContestView(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNoContestView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // En-tête principal avec titre et logo
          _buildMainHeader(),
          
          const SizedBox(height: 8),
          
          // Section vidéo YouTube
          YouTubeVideoPlayer(
            videoId: YouTubeConfig.weeklyContestVideoId,
            title: YouTubeConfig.weeklyContestVideoTitle,
            description: YouTubeConfig.weeklyContestVideoDescription,
            thumbnailPath: YouTubeConfig.weeklyContestThumbnailPath,
            onVideoPlayed: () {
              // Callback optionnel pour tracker les vues
              print('Vidéo YouTube lancée: ${YouTubeConfig.weeklyContestVideoUrl}');
            },
          ),
          
          const SizedBox(height: 24),
          
          // Compte à rebours jusqu'au prochain dimanche
          _buildNextSundayCountdown(),
          
          const SizedBox(height: 8),
          
          // Bouton principal "Prendre mes places !"
          _buildMainActionButton(),
          
          
          const SizedBox(height: 24),
          
          // Section gagnant du dernier tirage
          _buildLastWinnerSection(),
          
          const SizedBox(height: 24),
          
          // Section statistiques des gagnants
          _buildWinnersStatsSection(),
          
          const SizedBox(height: 24),
          
          // Widget Myfxbook - Graphique de portfolio
          _buildMyfxbookSection(),
          
          const SizedBox(height: 60), // Marge importante en bas
        ],
      ),
    );
  }

  Widget _buildContestView() {
    final contest = _currentContest!;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // En-tête principal avec titre et logo
          _buildMainHeader(),
          
          const SizedBox(height: 8),
          
          // Section vidéo YouTube
          YouTubeVideoPlayer(
            videoId: YouTubeConfig.weeklyContestVideoId,
            title: YouTubeConfig.weeklyContestVideoTitle,
            description: YouTubeConfig.weeklyContestVideoDescription,
            thumbnailPath: YouTubeConfig.weeklyContestThumbnailPath,
            onVideoPlayed: () {
              // Callback optionnel pour tracker les vues
              print('Vidéo YouTube lancée: ${YouTubeConfig.weeklyContestVideoUrl}');
            },
          ),
          
          const SizedBox(height: 24),
          
          // Compte à rebours jusqu'au tirage avec icônes intégrées
          if (!contest.drawCompleted)
            _buildContestCountdown(contest.drawDate),
          
          const SizedBox(height: 16),
          
          // Bouton principal "Prendre mes places !"
          _buildMainActionButton(),
          
          
          const SizedBox(height: 24),
          
          // Section gagnant du dernier tirage
          _buildLastWinnerSection(),
          
          const SizedBox(height: 16),
          
          // Section statistiques des gagnants
          _buildWinnersStatsSection(),
          
          const SizedBox(height: 24),
          
          // Widget Myfxbook - Graphique de portfolio
          _buildMyfxbookSection(),
          
          const SizedBox(height: 24),
          
          // Section des gains et informations (COMMENTÉE)
          // _buildPrizesSection(),
          
          const SizedBox(height: 60), // Marge importante en bas
        ],
      ),
    );
  }

  Widget _buildMainHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Text(
            'Déverrouiller ton premier niveau d\'investisseur',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMyfxbookSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Performance du Portfolio',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 12),
        MyfxbookWidget(
          portfolioId: '11712760', // ID du portfolio "JEU-CONCOURS"
          height: 400,
        ),
      ],
    );
  }







  Widget _buildMainActionButton() {
    return Center(
      child: SizedBox(
        width: MediaQuery.of(context).size.width * 0.7, // 70% de la largeur de l'écran
        child: ElevatedButton(
        onPressed: _isParticipating ? null : () async {
          // Rediriger vers le site Shopify pour prendre les places
          final url = 'https://ifgdfg-es.myshopify.com/';
          try {
            await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
          } catch (e) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Impossible d\'ouvrir le site'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: _isParticipating ? Colors.grey : Colors.transparent,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(
              color: _isParticipating ? Colors.grey : const Color(0xFF3B82F6),
              width: 1,
            ),
          ),
          elevation: 0,
          shadowColor: Colors.transparent,
        ),
        child: _isParticipating
            ? const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.check_circle,
                    size: 24,
                  ),
                  SizedBox(width: 12),
                  Text(
                    'Déjà inscrit !',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              )
            : const Text(
                'Prendre mes places !',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Poppins',
                ),
              ),
        ),
      ),
    );
  }


  Widget _buildSocialMediaIcons() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Instagram
        GestureDetector(
          onTap: () async {
            // Ouvrir directement le profil Instagram Finea
            final url = 'https://www.instagram.com/finea.fr?igsh=MXVjd2tkOWZ1ODB3Zg%3D%3D&utm_source=qr';
            try {
              await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
            } catch (e) {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Impossible d\'ouvrir Instagram'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            }
          },
          child: const Image(
            image: AssetImage('assets/images/instagram.png'),
            width: 100,
            height: 100,
          ),
        ),
        
        // TikTok
        GestureDetector(
          onTap: () async {
            // Ouvrir directement le profil TikTok Finea
            final url = 'https://www.tiktok.com/@finea.academie?_t=ZN-90jNZ818pLa&_r=1';
            try {
              await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
            } catch (e) {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Impossible d\'ouvrir TikTok'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            }
          },
          child: const Image(
            image: AssetImage('assets/images/tiktok.png'),
            width: 100,
            height: 100,
          ),
        ),
      ],
    );
  }

  Widget _buildNextSundayCountdown() {
    return Column(
      children: [
        Text(
          'Prochain tirage dans :',
          style: TextStyle(

            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w800,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 8),
        _buildCountdownTimer(),
        const SizedBox(height: 6),
        _buildNextSundayDate(),
        const SizedBox(height: 8),
        _buildSocialMediaIcons(),
      ],
    );
  }

  Widget _buildContestCountdown(DateTime drawDate) {
    return Column(
      children: [
        Text(
          'Prochain tirage dans :',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w800,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 8),
        _buildContestCountdownTimer(drawDate),
        const SizedBox(height: 6),
        _buildContestDate(drawDate),
        const SizedBox(height: 8),
        _buildSocialMediaIcons(),
      ],
    );
  }

  Widget _buildContestCountdownTimer(DateTime drawDate) {
    return StreamBuilder<Duration>(
      stream: Stream.periodic(const Duration(seconds: 1), (_) {
        final now = DateTime.now();
        return drawDate.difference(now);
      }),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const CircularProgressIndicator(color: Colors.blue);
        }

        final duration = snapshot.data!;
        if (duration.isNegative) {
          return const Text(
            'Tirage terminé',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          );
        }

        final days = duration.inDays;
        final hours = duration.inHours % 24;
        final minutes = duration.inMinutes % 60;
        final seconds = duration.inSeconds % 60;

        return Text(
          '${days}j ${hours}h ${minutes}m ${seconds}s',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        );
      },
    );
  }

  Widget _buildContestDate(DateTime drawDate) {
    final dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    final monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    final dayName = dayNames[drawDate.weekday - 1];
    final day = drawDate.day;
    final month = monthNames[drawDate.month - 1];
    final year = drawDate.year;
    final hour = drawDate.hour;
    final minute = drawDate.minute.toString().padLeft(2, '0');

    return Text(
      '$dayName $day $month $year à ${hour}h$minute',
      style: const TextStyle(
        color: Colors.white,
        fontSize: 16,
        fontWeight: FontWeight.w500,
        fontFamily: 'Poppins',
      ),
    );
  }

  Widget _buildCountdownTimer() {
    return StreamBuilder<Duration>(
      stream: Stream.periodic(const Duration(seconds: 1), (_) {
        final now = DateTime.now();
        final nextSunday = _getNextSunday(now);
        return nextSunday.difference(now);
      }),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const CircularProgressIndicator(color: Colors.blue);
        }

        final duration = snapshot.data!;
        final days = duration.inDays;
        final hours = duration.inHours % 24;
        final minutes = duration.inMinutes % 60;
        final seconds = duration.inSeconds % 60;

        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildTimeUnit(days.toString(), 'j'),
            const SizedBox(width: 8),
            _buildTimeUnit(hours.toString().padLeft(2, '0'), 'h'),
            const SizedBox(width: 8),
            _buildTimeUnit(minutes.toString().padLeft(2, '0'), 'm'),
            const SizedBox(width: 8),
            _buildTimeUnit(seconds.toString().padLeft(2, '0'), 's'),
          ],
        );
      },
    );
  }

  Widget _buildTimeUnit(String value, String unit) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(width: 4),
        Text(
          unit,
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 14,
            fontWeight: FontWeight.w500,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }

  Widget _buildNextSundayDate() {
    final now = DateTime.now();
    final nextSunday = _getNextSunday(now);
    
    final weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    final months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    final weekday = weekdays[nextSunday.weekday - 1];
    final day = nextSunday.day;
    final month = months[nextSunday.month - 1];
    final year = nextSunday.year;
    final hour = nextSunday.hour;
    final minute = nextSunday.minute.toString().padLeft(2, '0');
    
    return Text(
      '$weekday $day $month $year à ${hour}h$minute',
      style: TextStyle(
        color: Colors.white.withOpacity(0.8),
        fontSize: 16,
        fontFamily: 'Poppins',
        fontWeight: FontWeight.w500,
      ),
    );
  }

  DateTime _getNextSunday(DateTime now) {
    // Calculer le prochain dimanche à 19h
    int daysUntilSunday = (7 - now.weekday) % 7;
    if (daysUntilSunday == 0) {
      // Si c'est déjà dimanche, vérifier si c'est avant 19h
      if (now.hour < 19) {
        daysUntilSunday = 0; // Aujourd'hui à 19h
      } else {
        daysUntilSunday = 7; // Dimanche prochain
      }
    }
    
    final nextSunday = now.add(Duration(days: daysUntilSunday));
    return DateTime(nextSunday.year, nextSunday.month, nextSunday.day, 19, 0);
  }

  Widget _buildWinnersStatsSection() {
    final stats = _contestStats;
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _buildStatCard(
          stats?.totalWinners.toString() ?? '0', 
          'gagnants'
        ),
        _buildStatCard(
          '${stats?.totalGains.toString() ?? '0'}€', 
          'gains total'
        ),
        _buildStatCard(
          '${stats?.totalPlacesSold.toString() ?? '0'}€', 
          'places vendu'
        ),
      ],
    );
  }

  Widget _buildStatCard(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 32,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 14,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildLastWinnerSection() {
    return Column(
      children: [
        // Titre de la section
        const Center(
          child: Text(
            "Nos gagnants :",
            textAlign: TextAlign.left,
            style: TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
        ),
        
        const SizedBox(height: 12),
        
        // Widget slider pour les gagnants
        LastWinnerSliderWidget(),
      ],
    );
  }

} 