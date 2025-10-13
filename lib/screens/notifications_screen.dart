import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../models/user_model.dart';
import '../widgets/custom_bottom_navigation.dart';
import 'main_navigation_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _pushNotifications = true;
  bool _emailNotifications = true;
  bool _marketingNotifications = false;
  bool _soundEnabled = true;
  bool _vibrationEnabled = true;
  bool _isLoading = false;
  
  String _selectedSound = 'Défaut';
  final List<String> _soundOptions = ['Défaut', 'Bell', 'Chime', 'Ding', 'Notification'];

  @override
  void initState() {
    super.initState();
    _loadUserPreferences();
  }

  void _loadUserPreferences() {
    final authService = Provider.of<AuthService>(context, listen: false);
    final user = authService.currentUser;
    
    if (user != null) {
      setState(() {
        _emailNotifications = user.preferences.notifications.email;
        _pushNotifications = user.preferences.notifications.push;
        _marketingNotifications = user.preferences.notifications.marketing;
      });
    }
  }

  Future<void> _savePreferences() async {
    setState(() => _isLoading = true);
    
    try {
      // TODO: Implémenter la sauvegarde des préférences
      // Pour l'instant, on simule une sauvegarde
      await Future.delayed(const Duration(seconds: 1));
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Préférences sauvegardées'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de la sauvegarde: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthService>(
      builder: (context, authService, child) {
        final user = authService.currentUser;
        
        return Scaffold(
          backgroundColor: const Color(0xFF0f0f23),
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            title: const Text(
              'Notifications',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
            ),
            centerTitle: true,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.of(context).pop(),
            ),
            actions: [
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  ),
                ),
            ],
          ),
          body: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24.0),
                  child: FadeInUp(
                    duration: const Duration(milliseconds: 600),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 20),
                        
                        // Types de notifications
                        const Text(
                          'Types de notifications',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        
                        const SizedBox(height: 20),
                        
                        _buildNotificationTile(
                          title: 'Notifications push',
                          subtitle: 'Recevoir des notifications sur votre appareil',
                          value: _pushNotifications,
                          onChanged: (value) {
                            setState(() {
                              _pushNotifications = value;
                            });
                          },
                          icon: Icons.notifications_active,
                        ),
                        
                        _buildNotificationTile(
                          title: 'Notifications par email',
                          subtitle: 'Recevoir des notifications par email',
                          value: _emailNotifications,
                          onChanged: (value) {
                            setState(() {
                              _emailNotifications = value;
                            });
                          },
                          icon: Icons.email,
                        ),
                        
                        _buildNotificationTile(
                          title: 'Notifications marketing',
                          subtitle: 'Recevoir des offres et promotions',
                          value: _marketingNotifications,
                          onChanged: (value) {
                            setState(() {
                              _marketingNotifications = value;
                            });
                          },
                          icon: Icons.campaign,
                        ),
                        
                        const SizedBox(height: 32),
                        
                        // Paramètres de notification
                        const Text(
                          'Paramètres',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        
                        const SizedBox(height: 20),
                        
                        _buildNotificationTile(
                          title: 'Son',
                          subtitle: 'Activer le son pour les notifications',
                          value: _soundEnabled,
                          onChanged: (value) {
                            setState(() {
                              _soundEnabled = value;
                            });
                          },
                          icon: Icons.volume_up,
                        ),
                        
                        if (_soundEnabled) ...[
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Son de notification',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                DropdownButtonFormField<String>(
                                  initialValue: _selectedSound,
                                  dropdownColor: const Color(0xFF1a1a2e),
                                  style: const TextStyle(color: Colors.white),
                                  decoration: const InputDecoration(
                                    border: OutlineInputBorder(),
                                    enabledBorder: OutlineInputBorder(
                                      borderSide: BorderSide(color: Colors.white30),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderSide: BorderSide(color: Colors.blue),
                                    ),
                                  ),
                                  items: _soundOptions.map((String value) {
                                    return DropdownMenuItem<String>(
                                      value: value,
                                      child: Text(value),
                                    );
                                  }).toList(),
                                  onChanged: (String? newValue) {
                                    setState(() {
                                      _selectedSound = newValue!;
                                    });
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                        
                        _buildNotificationTile(
                          title: 'Vibration',
                          subtitle: 'Activer la vibration pour les notifications',
                          value: _vibrationEnabled,
                          onChanged: (value) {
                            setState(() {
                              _vibrationEnabled = value;
                            });
                          },
                          icon: Icons.vibration,
                        ),
                        
                        const SizedBox(height: 40),
                        
                        // Bouton de sauvegarde
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _savePreferences,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                    ),
                                  )
                                : const Text(
                                    'Sauvegarder',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              
              // Barre de navigation en bas
              CustomBottomNavigation(
                currentIndex: 2, // Accueil est sélectionné par défaut
                onTap: (index) {
                  // Navigation vers les différentes pages
                  if (index != 2) { // Si ce n'est pas la page actuelle
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(
                        builder: (context) => const MainNavigationScreen(),
                      ),
                    );
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNotificationTile({
    required String title,
    required String subtitle,
    required bool value,
    required Function(bool) onChanged,
    required IconData icon,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: Colors.white,
            size: 24,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.7),
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: Colors.white,
            activeTrackColor: Colors.white.withOpacity(0.3),
            inactiveThumbColor: Colors.grey,
            inactiveTrackColor: Colors.grey.withOpacity(0.3),
          ),
        ],
      ),
    );
  }
} 