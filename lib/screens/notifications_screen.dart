import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _pushNotifications = true;
  bool _emailNotifications = true;
  bool _tradingAlerts = true;
  bool _marketNews = false;
  bool _weeklyNewsletter = true;
  bool _promotions = false;
  bool _securityAlerts = true;
  bool _soundEnabled = true;
  bool _vibrationEnabled = true;
  
  String _selectedSound = 'Défaut';
  final List<String> _soundOptions = ['Défaut', 'Bell', 'Chime', 'Ding', 'Notification'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000D64),
      appBar: AppBar(
        backgroundColor: const Color(0xFF000D64),
        title: const Text('Notifications', style: TextStyle(color: Colors.white)),
        centerTitle: true,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: FadeInUp(
          duration: const Duration(milliseconds: 600),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              
              // Notifications générales
              const Text(
                'Notifications générales',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              
              const SizedBox(height: 20),
              
              _buildNotificationTile(
                title: 'Notifications push',
                subtitle: 'Recevoir les notifications sur votre appareil',
                value: _pushNotifications,
                onChanged: (value) {
                  setState(() {
                    _pushNotifications = value;
                  });
                },
                icon: Icons.notifications,
              ),
              
              _buildNotificationTile(
                title: 'Notifications email',
                subtitle: 'Recevoir les notifications par email',
                value: _emailNotifications,
                onChanged: (value) {
                  setState(() {
                    _emailNotifications = value;
                  });
                },
                icon: Icons.email,
              ),
              
              const SizedBox(height: 32),
              
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
                title: 'Alertes de trading',
                subtitle: 'Nouveaux signaux et alertes de trading',
                value: _tradingAlerts,
                onChanged: (value) {
                  setState(() {
                    _tradingAlerts = value;
                  });
                },
                icon: Icons.trending_up,
              ),
              
              _buildNotificationTile(
                title: 'Actualités du marché',
                subtitle: 'Nouvelles importantes du marché financier',
                value: _marketNews,
                onChanged: (value) {
                  setState(() {
                    _marketNews = value;
                  });
                },
                icon: Icons.newspaper,
              ),
              
              _buildNotificationTile(
                title: 'Newsletter hebdomadaire',
                subtitle: 'Résumé hebdomadaire des analyses',
                value: _weeklyNewsletter,
                onChanged: (value) {
                  setState(() {
                    _weeklyNewsletter = value;
                  });
                },
                icon: Icons.mail_outline,
              ),
              
              _buildNotificationTile(
                title: 'Promotions et offres',
                subtitle: 'Offres spéciales et promotions partenaires',
                value: _promotions,
                onChanged: (value) {
                  setState(() {
                    _promotions = value;
                  });
                },
                icon: Icons.local_offer,
              ),
              
              _buildNotificationTile(
                title: 'Alertes de sécurité',
                subtitle: 'Notifications importantes de sécurité',
                value: _securityAlerts,
                onChanged: (value) {
                  setState(() {
                    _securityAlerts = value;
                  });
                },
                icon: Icons.security,
              ),
              
              const SizedBox(height: 32),
              
              // Paramètres de notification
              const Text(
                'Paramètres de notification',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              
              const SizedBox(height: 20),
              
              _buildNotificationTile(
                title: 'Son',
                subtitle: 'Activer le son des notifications',
                value: _soundEnabled,
                onChanged: (value) {
                  setState(() {
                    _soundEnabled = value;
                  });
                },
                icon: Icons.volume_up,
              ),
              
              _buildNotificationTile(
                title: 'Vibration',
                subtitle: 'Activer la vibration des notifications',
                value: _vibrationEnabled,
                onChanged: (value) {
                  setState(() {
                    _vibrationEnabled = value;
                  });
                },
                icon: Icons.vibration,
              ),
              
              const SizedBox(height: 20),
              
              // Sélection du son
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.music_note,
                          color: Colors.white,
                          size: 24,
                        ),
                        const SizedBox(width: 16),
                        const Text(
                          'Son de notification',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: _selectedSound,
                      items: _soundOptions.map((sound) {
                        return DropdownMenuItem(
                          value: sound,
                          child: Text(sound),
                        );
                      }).toList(),
                      onChanged: _soundEnabled ? (value) {
                        setState(() {
                          _selectedSound = value!;
                        });
                      } : null,
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.1),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      dropdownColor: const Color(0xFF000D64),
                      style: const TextStyle(color: Colors.white),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 40),
              
              // Boutons d'action
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        // Tester les notifications
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Notification de test envoyée !'),
                            backgroundColor: Colors.blue,
                          ),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white, width: 2),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Tester',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Paramètres sauvegardés'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF000D64),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Sauvegarder',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
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
            activeColor: Colors.white,
            activeTrackColor: Colors.white.withOpacity(0.3),
            inactiveThumbColor: Colors.grey,
            inactiveTrackColor: Colors.grey.withOpacity(0.3),
          ),
        ],
      ),
    );
  }
} 