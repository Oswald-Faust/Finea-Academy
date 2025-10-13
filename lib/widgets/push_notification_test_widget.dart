import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/push_notification_service.dart';

class PushNotificationTestWidget extends StatefulWidget {
  const PushNotificationTestWidget({super.key});

  @override
  State<PushNotificationTestWidget> createState() => _PushNotificationTestWidgetState();
}

class _PushNotificationTestWidgetState extends State<PushNotificationTestWidget> {
  String _status = 'Initialisation...';
  bool _isInitialized = false;
  String? _currentToken;

  @override
  void initState() {
    super.initState();
    _checkStatus();
  }

  void _checkStatus() {
    final pushService = Provider.of<PushNotificationService>(context, listen: false);
    setState(() {
      _isInitialized = pushService.isInitialized;
      _currentToken = pushService.currentToken;
      _status = _isInitialized ? 'Service initialisé ✅' : 'Service non initialisé ❌';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: ExpansionTile(
        leading: Icon(
          Icons.notification_add,
          color: _isInitialized ? Colors.green : Colors.orange,
        ),
        title: const Text(
          'Test Notifications Push',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(_status),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Statut du service
                _buildStatusCard(),
                
                const SizedBox(height: 16),
                
                // Informations du token
                _buildTokenCard(),
                
                const SizedBox(height: 16),
                
                // Actions de test
                _buildTestActions(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard() {
    return Card(
      color: _isInitialized ? Colors.green.shade50 : Colors.orange.shade50,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  _isInitialized ? Icons.check_circle : Icons.warning,
                  color: _isInitialized ? Colors.green : Colors.orange,
                  size: 20,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Statut du Service',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(_status),
            if (!_isInitialized) ...[
              const SizedBox(height: 8),
              ElevatedButton.icon(
                onPressed: _reinitializeService,
                icon: const Icon(Icons.refresh),
                label: const Text('Réinitialiser'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTokenCard() {
    return Card(
      color: Colors.blue.shade50,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.vpn_key, color: Colors.blue, size: 20),
                SizedBox(width: 8),
                Text(
                  'Token FCM',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (_currentToken != null) ...[
              Text(
                'Token: ${_currentToken!.length > 40 ? '${_currentToken!.substring(0, 40)}...' : _currentToken!}',
                style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  ElevatedButton.icon(
                    onPressed: () => _copyToClipboard(_currentToken!),
                    icon: const Icon(Icons.copy, size: 16),
                    label: const Text('Copier'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    onPressed: _refreshToken,
                    icon: const Icon(Icons.refresh, size: 16),
                    label: const Text('Actualiser'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ] else ...[
              const Text(
                'Aucun token disponible',
                style: TextStyle(color: Colors.red),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTestActions() {
    return Card(
      color: Colors.purple.shade50,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.science, color: Colors.purple, size: 20),
                SizedBox(width: 8),
                Text(
                  'Actions de Test',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ElevatedButton.icon(
                  onPressed: _isInitialized ? _sendTestNotification : null,
                  icon: const Icon(Icons.send, size: 16),
                  label: const Text('Test Local'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.purple,
                    foregroundColor: Colors.white,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: _checkStatus,
                  icon: const Icon(Icons.refresh, size: 16),
                  label: const Text('Actualiser Statut'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              '💡 Conseil: Utilisez l\'admin dashboard pour envoyer des vraies notifications push',
              style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      ),
    );
  }

  void _reinitializeService() async {
    setState(() {
      _status = 'Réinitialisation...';
    });

    try {
      final pushService = Provider.of<PushNotificationService>(context, listen: false);
      await pushService.initialize();
      _checkStatus();
      _showSnackBar('Service réinitialisé avec succès', Colors.green);
    } catch (e) {
      setState(() {
        _status = 'Erreur lors de la réinitialisation: $e';
      });
      _showSnackBar('Erreur lors de la réinitialisation', Colors.red);
    }
  }

  void _refreshToken() {
    _checkStatus();
    _showSnackBar('Statut actualisé', Colors.blue);
  }

  void _copyToClipboard(String text) {
    // Note: Pour implémenter la copie, vous auriez besoin du package flutter/services
    // Clipboard.setData(ClipboardData(text: text));
    _showSnackBar('Token copié (fonctionnalité à implémenter)', Colors.blue);
  }

  void _sendTestNotification() async {
    try {
      final pushService = Provider.of<PushNotificationService>(context, listen: false);
      await pushService.sendTestNotification();
      _showSnackBar('Notification de test envoyée !', Colors.green);
    } catch (e) {
      _showSnackBar('Erreur lors de l\'envoi de la notification de test', Colors.red);
    }
  }

  void _showSnackBar(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: color,
        duration: const Duration(seconds: 2),
      ),
    );
  }
}

// Widget simplifié pour utilisation dans les paramètres
class PushNotificationStatusWidget extends StatelessWidget {
  const PushNotificationStatusWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<PushNotificationService>(
      builder: (context, pushService, child) {
        final isInitialized = pushService.isInitialized;
        final hasToken = pushService.currentToken != null;
        
        return ListTile(
          leading: Icon(
            Icons.notifications_active,
            color: isInitialized && hasToken ? Colors.green : Colors.orange,
          ),
          title: const Text('Notifications Push'),
          subtitle: Text(
            isInitialized 
              ? (hasToken ? 'Actives ✅' : 'Token manquant ⚠️')
              : 'Non initialisées ❌'
          ),
          trailing: Icon(
            isInitialized && hasToken ? Icons.check_circle : Icons.warning,
            color: isInitialized && hasToken ? Colors.green : Colors.orange,
          ),
          onTap: () {
            showDialog(
              context: context,
              builder: (context) => const Dialog(
                child: PushNotificationTestWidget(),
              ),
            );
          },
        );
      },
    );
  }
}
