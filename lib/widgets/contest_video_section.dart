import 'package:flutter/material.dart';
import '../services/contest_service.dart';
import '../models/contest_model.dart';
import '../services/auth_service.dart';

class ContestVideoSection extends StatefulWidget {
  const ContestVideoSection({super.key});

  @override
  State<ContestVideoSection> createState() => _ContestVideoSectionState();
}

class _ContestVideoSectionState extends State<ContestVideoSection> {
  Contest? _currentContest;
  bool _isLoading = false;
  bool _isParticipating = false;
  bool _isUserLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _checkAuthStatus();
    _loadCurrentContest();
  }

  Future<void> _checkAuthStatus() async {
    final token = await AuthService.getToken();
    setState(() {
      _isUserLoggedIn = token != null;
    });
  }

  Future<void> _loadCurrentContest() async {
    try {
      final contest = await ContestService.getCurrentWeeklyContest();
      setState(() {
        _currentContest = contest;
      });
      
      if (contest != null && _isUserLoggedIn) {
        _checkParticipationStatus();
      }
    } catch (e) {
      print('Erreur lors du chargement du concours: $e');
    }
  }

  Future<void> _checkParticipationStatus() async {
    if (_currentContest == null) return;
    
    try {
      final isParticipating = await ContestService.isUserParticipating(_currentContest!.id);
      setState(() {
        _isParticipating = isParticipating;
      });
    } catch (e) {
      print('Erreur lors de la vérification de participation: $e');
    }
  }

  Future<void> _participateInContest() async {
    if (!_isUserLoggedIn) {
      _showLoginRequiredDialog();
      return;
    }

    if (_currentContest == null) {
      _showNoContestDialog();
      return;
    }

    if (_isParticipating) {
      _showAlreadyParticipatingDialog();
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final success = await ContestService.participateInWeeklyContest();
      
      if (success) {
        setState(() {
          _isParticipating = true;
        });
        _showSuccessDialog();
        _loadCurrentContest(); // Recharger pour mettre à jour le nombre de participants
      } else {
        _showErrorDialog('Erreur lors de la participation au concours');
      }
    } catch (e) {
      _showErrorDialog('Erreur lors de la participation au concours: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showLoginRequiredDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Connexion requise'),
        content: const Text('Vous devez être connecté pour participer au concours.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showNoContestDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Aucun concours actif'),
        content: const Text('Il n\'y a actuellement aucun concours hebdomadaire en cours.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showAlreadyParticipatingDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Déjà participant'),
        content: const Text('Vous participez déjà à ce concours !'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Participation enregistrée !'),
        content: const Text('Votre participation au concours hebdomadaire a été enregistrée avec succès. Bonne chance !'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Merci !'),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Erreur'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  String _getButtonText() {
    if (_isLoading) return 'Chargement...';
    if (_isParticipating) return 'Déjà participant !';
    if (!_isUserLoggedIn) return 'Se connecter pour participer';
    return 'Prendre mes places !';
  }

  Color _getButtonColor() {
    if (_isLoading) return Colors.grey;
    if (_isParticipating) return Colors.green;
    if (!_isUserLoggedIn) return Colors.orange;
    return Colors.blue;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.blue.shade900,
            Colors.purple.shade900,
          ],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          // Titre et description du concours
          if (_currentContest != null) ...[
            Text(
              _currentContest!.title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            Text(
              _currentContest!.description,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            
            // Informations du concours
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildInfoCard(
                  'Participants',
                  '${_currentContest!.currentParticipants}',
                  Icons.people,
                ),
                _buildInfoCard(
                  'Jours restants',
                  '${_currentContest!.daysUntilEnd}',
                  Icons.calendar_today,
                ),
                _buildInfoCard(
                  'Tirage dans',
                  '${_currentContest!.daysUntilDraw} jours',
                  Icons.schedule,
                ),
              ],
            ),
            const SizedBox(height: 20),
          ] else ...[
            Text(
              'Concours Hebdomadaire',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            Text(
              'Participez au concours hebdomadaire de Finéa Académie !',
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
          ],

          // Bouton de participation
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _isLoading || _isParticipating ? null : _participateInContest,
              style: ElevatedButton.styleFrom(
                backgroundColor: _getButtonColor(),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(25),
                ),
                elevation: 5,
              ),
              child: Text(
                _getButtonText(),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 15),
          
          // Règles du concours
          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Column(
              children: [
                const Text(
                  '📋 Règles du concours',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  '• Participation gratuite\n• Un seul ticket par utilisateur\n• Tirage au sort automatique le samedi à 20h\n• Le gagnant sera contacté par email',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.left,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: Colors.white,
            size: 24,
          ),
          const SizedBox(height: 5),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 12,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
} 