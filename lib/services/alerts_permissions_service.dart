import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class AlertsPermissionsService extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  Map<String, bool> _permissions = {
    'canViewClosedAlerts': false,
    'canViewPositioningAlerts': false,
  };
  
  bool _isLoading = false;
  bool _hasLoaded = false;

  Map<String, bool> get permissions => _permissions;
  bool get isLoading => _isLoading;
  bool get hasLoaded => _hasLoaded;

  /// Vérifier si l'utilisateur peut voir les alertes clôturées
  bool get canViewClosedAlerts => _permissions['canViewClosedAlerts'] ?? false;

  /// Vérifier si l'utilisateur peut voir les alertes de positionnement
  bool get canViewPositioningAlerts => _permissions['canViewPositioningAlerts'] ?? false;

  /// Charger les permissions depuis l'API
  Future<void> loadPermissions() async {
    if (_isLoading) return;
    
    try {
      _isLoading = true;
      notifyListeners();
      
      if (kDebugMode) {
        print('🔄 Chargement des permissions d\'alertes...');
      }
      
      final permissions = await _apiService.getAlertsPermissions();
      _permissions = permissions;
      _hasLoaded = true;
      
      if (kDebugMode) {
        print('🔐 Permissions d\'alertes chargées: $permissions');
        print('   - canViewClosedAlerts: ${permissions['canViewClosedAlerts']}');
        print('   - canViewPositioningAlerts: ${permissions['canViewPositioningAlerts']}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Erreur lors du chargement des permissions: $e');
        print('   Stack trace: ${StackTrace.current}');
      }
      // En cas d'erreur, garder les permissions par défaut (false)
      _permissions = {
        'canViewClosedAlerts': false,
        'canViewPositioningAlerts': false,
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Recharger les permissions
  Future<void> refreshPermissions() async {
    _hasLoaded = false;
    await loadPermissions();
  }

  /// Réinitialiser les permissions
  void resetPermissions() {
    _permissions = {
      'canViewClosedAlerts': false,
      'canViewPositioningAlerts': false,
    };
    _hasLoaded = false;
    notifyListeners();
  }
}
