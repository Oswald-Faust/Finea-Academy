import 'package:flutter/material.dart';
import '../services/myfxbook_api_service.dart';

class MyfxbookDebugWidget extends StatefulWidget {
  const MyfxbookDebugWidget({super.key});

  @override
  State<MyfxbookDebugWidget> createState() => _MyfxbookDebugWidgetState();
}

class _MyfxbookDebugWidgetState extends State<MyfxbookDebugWidget> {
  bool _isLoading = false;
  String _status = 'Prêt';
  String _lastError = '';

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Debug Myfxbook',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Text('Status: $_status'),
            if (_lastError.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                'Erreur: $_lastError',
                style: const TextStyle(color: Colors.red),
              ),
            ],
            const SizedBox(height: 16),
            Row(
              children: [
                ElevatedButton(
                  onPressed: _isLoading ? null : _testAuth,
                  child: _isLoading 
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Tester Auth'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _resetSession,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                  ),
                  child: const Text('Reset Session'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _forceAuth,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                  ),
                  child: const Text('Force Auth'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _testAuth() async {
    setState(() {
      _isLoading = true;
      _status = 'Test en cours...';
      _lastError = '';
    });

    try {
      final success = await MyfxbookApiService.authenticate();
      setState(() {
        _status = success ? 'Authentification réussie' : 'Échec de l\'authentification';
      });
    } catch (e) {
      setState(() {
        _status = 'Erreur';
        _lastError = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _resetSession() {
    MyfxbookApiService.resetSession();
    setState(() {
      _status = 'Session réinitialisée';
      _lastError = '';
    });
  }

  Future<void> _forceAuth() async {
    setState(() {
      _isLoading = true;
      _status = 'Force auth en cours...';
      _lastError = '';
    });

    try {
      final success = await MyfxbookApiService.forceAuthenticate();
      setState(() {
        _status = success ? 'Force auth réussie' : 'Échec du force auth';
      });
    } catch (e) {
      setState(() {
        _status = 'Erreur force auth';
        _lastError = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
}
