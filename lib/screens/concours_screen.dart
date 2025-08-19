import 'package:flutter/material.dart';
import '../models/contest_model.dart';
import '../services/contest_service.dart';
import '../services/auth_service.dart';
import '../widgets/contest_countdown_section.dart';
import '../widgets/contest_winner_card.dart';
import '../widgets/mt5_account_card.dart';
import '../widgets/winner_announcement_card.dart';
import '../widgets/all_winners_section.dart';
import 'profile_screen.dart';

class ConcoursScreen extends StatefulWidget {
  const ConcoursScreen({super.key});

  @override
  State<ConcoursScreen> createState() => _ConcoursScreenState();
}

class _ConcoursScreenState extends State<ConcoursScreen> {
  Contest? _currentContest;
  bool _isLoading = true;
  bool _isParticipating = false;
  bool _isJoining = false;
  Map<String, dynamic>? _contestStats;
  Map<String, dynamic>? _contestWinners;
  bool _isUserWinner = false;

  @override
  void initState() {
    super.initState();
    _loadContestData();
  }

  Future<void> _loadContestData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final contest = await ContestService.getCurrentWeeklyContest();
      final stats = await ContestService.getContestStats();
      final winners = await ContestService.getCurrentContestWinners();
      final isUserWinner = await ContestService.checkIfUserWon();
      
      if (mounted) {
        setState(() {
          _currentContest = contest;
          _contestStats = stats;
          _contestWinners = winners;
          _isUserWinner = isUserWinner;
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

  Future<void> _joinContest() async {
    if (_currentContest == null) return;

    setState(() {
      _isJoining = true;
    });

    try {
      final success = await ContestService.participateInWeeklyContest();
      
      if (mounted) {
        if (success) {
          setState(() {
            _isParticipating = true;
          });
          _showSuccessSnackBar('Inscription réussie au concours !');
          _loadContestData();
        } else {
          _showErrorSnackBar('Erreur lors de l\'inscription');
        }
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar('Erreur lors de l\'inscription: $e');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isJoining = false;
        });
      }
    }
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
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
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Concours Hebdomadaire',
          style: TextStyle(
            color: Colors.white,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
          ),
        ),
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
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: Colors.blue,
              ),
            )
          : _currentContest == null
              ? _buildNoContestView()
              : _buildContestView(),
    );
  }

  Widget _buildNoContestView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.emoji_events_outlined,
            size: 80,
            color: Colors.grey[600],
          ),
          const SizedBox(height: 16),
          Text(
            'Aucun concours actif',
            style: TextStyle(
              color: Colors.grey[400],
              fontSize: 20,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Revenez plus tard pour participer\nau prochain concours hebdomadaire !',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 16,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _loadContestData,
            icon: const Icon(Icons.refresh),
            label: const Text('Actualiser'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
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
          // Affichage des gagnants (toujours visible)
          if (_contestWinners != null)
            WinnerAnnouncementCard(
              contestTitle: _contestWinners!['contestTitle'] ?? '',
              hasWinners: _contestWinners!['hasWinners'] ?? false,
              winners: _contestWinners!['winners'] != null 
                ? List<Map<String, dynamic>>.from(_contestWinners!['winners'])
                : null,
              drawDate: DateTime.tryParse(_contestWinners!['drawDate'] ?? DateTime.now().toIso8601String()) ?? DateTime.now(),
              isCurrentUserWinner: _isUserWinner,
            ),
          
          // En-tête principal avec titre et logo
          _buildMainHeader(),
          
          const SizedBox(height: 24),
          
          // Section vidéo YouTube
          _buildVideoSection(),
          
          const SizedBox(height: 24),
          
          // Compte à rebours jusqu'au tirage
          if (!contest.drawCompleted)
            ContestCountdownSection(
              targetDate: contest.drawDate,
              title: 'Prochain tirage dans :',
            ),
          
          const SizedBox(height: 24),
          
          // Bouton principal "Prendre mes places !"
          _buildMainActionButton(),
          
          const SizedBox(height: 24),
          
          // Icônes des réseaux sociaux
          _buildSocialMediaIcons(),
          
          // Section des gains et informations (COMMENTÉE)
          // _buildPrizesSection(),
          
          const SizedBox(height: 24),
          
          // Section MT5
          MT5AccountCard(
            onTap: () {
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
              fontSize: 24,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
              height: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'FINEA',
            style: TextStyle(
              color: Colors.white.withOpacity(0.3),
              fontSize: 16,
              fontFamily: 'Poppins',
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVideoSection() {
    return GestureDetector(
      onTap: () {
        _showVideoPlayer();
      },
      child: Container(
        width: double.infinity,
        height: 200,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.blue.withOpacity(0.1),
              Colors.purple.withOpacity(0.1),
            ],
          ),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Stack(
          children: [
            // Image de fond (placeholder)
            Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                image: const DecorationImage(
                  image: AssetImage('assets/images/Formation_trading.png'),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            // Overlay sombre
            Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: Colors.black.withOpacity(0.4),
              ),
            ),
            // Bouton de lecture central
            Center(
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(40),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.play_arrow,
                  size: 40,
                  color: Color(0xFF0f0f23),
                ),
              ),
            ),
            // Texte "YouTube" en bas à droite
            Positioned(
              bottom: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'YouTube',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showVideoPlayer() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          width: double.infinity,
          height: 300,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: const Color(0xFF1a1a2e),
          ),
          child: Column(
            children: [
              // En-tête du modal
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: Color(0xFF0f0f23),
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                ),
                child: Row(
                  children: [
                    const Text(
                      '🎥 Vidéo',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close, color: Colors.white),
                    ),
                  ],
                ),
              ),
              // Zone de la vidéo
              Expanded(
                child: Container(
                  width: double.infinity,
                  margin: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: Colors.black,
                  ),
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.play_circle_outline,
                          color: Colors.white,
                          size: 64,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Vidéo',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontFamily: 'Poppins',
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Cliquez pour regarder la vidéo',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 14,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMainActionButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isParticipating ? null : _joinContest,
        style: ElevatedButton.styleFrom(
          backgroundColor: _isParticipating ? Colors.grey : const Color(0xFF1E40AF),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 20),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 8,
          shadowColor: const Color(0xFF1E40AF).withOpacity(0.4),
        ),
        child: _isJoining
            ? const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  ),
                  SizedBox(width: 12),
                  Text(
                    'Inscription en cours...',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _isParticipating ? Icons.check_circle : Icons.add,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    _isParticipating ? 'Déjà inscrit !' : 'Prendre mes places !',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
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
          onTap: () {
            _showSocialMediaInfo('Instagram', 'Suivez-nous sur Instagram pour plus de contenu !');
          },
          child: Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFE4405F), Color(0xFF833AB4)],
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFE4405F).withOpacity(0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Center(
              child: Image(
                image: AssetImage('assets/images/logo_instagram.png'),
                width: 32,
                height: 32,
                color: Colors.white,
              ),
            ),
          ),
        ),
        
        const SizedBox(width: 24),
        
        // TikTok
        GestureDetector(
          onTap: () {
            _showSocialMediaInfo('TikTok', 'Découvrez nos vidéos courtes sur TikTok !');
          },
          child: Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF25F4EE), Color(0xFFFE2C55)],
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF25F4EE).withOpacity(0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Center(
              child: Image(
                image: AssetImage('assets/images/logo_tiktok.png'),
                width: 32,
                height: 32,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _showSocialMediaInfo(String platform, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              platform == 'Instagram' ? Icons.camera_alt : Icons.music_note,
              color: Colors.white,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  fontFamily: 'Poppins',
                ),
              ),
            ),
          ],
        ),
        backgroundColor: platform == 'Instagram' 
            ? const Color(0xFFE4405F) 
            : const Color(0xFF25F4EE),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
        action: SnackBarAction(
          label: 'OK',
          textColor: Colors.white,
          onPressed: () {},
        ),
      ),
    );
  }

  Widget _buildPrizesSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.blue.withOpacity(0.1),
            Colors.purple.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '🎁 Gains à gagner',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildPrizeItem('300€', 'Gain minimum'),
              const SizedBox(width: 16),
              _buildPrizeItem('600€', 'Gain moyen'),
              const SizedBox(width: 16),
              _buildPrizeItem('1K€', 'Gain maximum'),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Tirage automatique tous les dimanches à 19h00',
            style: TextStyle(
              color: Colors.grey[400],
              fontSize: 14,
              fontFamily: 'Poppins',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrizeItem(String amount, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Text(
              amount,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
            ),
            Text(
              label,
              style: TextStyle(
                color: Colors.grey[400],
                fontSize: 12,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
      ),
    );
  }
} 