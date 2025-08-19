import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier implements TokenProvider {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  static const String _isLoggedInKey = 'is_logged_in';

  final ApiService _apiService;
  final FlutterSecureStorage _secureStorage;
  
  User? _currentUser;
  bool _isLoggedIn = false;
  bool _isLoading = false;
  String? _errorMessage;

  AuthService(this._apiService) : _secureStorage = const FlutterSecureStorage();

  // Méthode statique pour récupérer le token
  static Future<String?> getToken() async {
    const storage = FlutterSecureStorage();
    return await storage.read(key: _tokenKey);
  }

  // Getters
  User? get currentUser => _currentUser;
  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _isLoggedIn && _currentUser != null;

  // Initialiser le service (à appeler au démarrage de l'app)
  Future<void> initialize() async {
    _setLoading(true);
    
    try {
      // Vérifier si l'utilisateur était connecté
      final prefs = await SharedPreferences.getInstance();
      final wasLoggedIn = prefs.getBool(_isLoggedInKey) ?? false;
      
      if (wasLoggedIn) {
        // Récupérer le token et les données utilisateur
        final token = await _secureStorage.read(key: _tokenKey);
        final userJson = prefs.getString(_userKey);
        
        if (token != null && userJson != null) {
          try {
            // Vérifier que le token est toujours valide en récupérant l'utilisateur actuel
            final response = await _apiService.getCurrentUser();
            if (response.success && response.data != null) {
              _currentUser = response.data!;
              _isLoggedIn = true;
            } else {
              await _clearAuthData();
            }
          } catch (e) {
            // Token invalide, nettoyer les données
            await _clearAuthData();
          }
        }
      }
    } catch (e) {
      print('Erreur lors de l\'initialisation de l\'authentification: $e');
      await _clearAuthData();
    }
    
    _setLoading(false);
  }

  // Inscription
  Future<bool> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phone,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final request = RegisterRequest(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        phone: phone,
      );

      final response = await _apiService.register(request);
      
      if (response.success) {
        await _saveAuthData(response.token, response.user);
        _currentUser = response.user;
        _isLoggedIn = true;
        notifyListeners();
        return true;
      } else {
        _setError('Erreur lors de l\'inscription');
        return false;
      }
    } on ApiException catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Une erreur inattendue est survenue');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Connexion automatique avec identifiants en dur
  Future<bool> autoLogin() async {
    _setLoading(true);
    _clearError();

    try {
      // Identifiants en dur pour la connexion automatique
      const String autoLoginEmail = 'faustfrank370@gmail.com';
      const String autoLoginPassword = 'test2FF';

      final request = LoginRequest(
        email: autoLoginEmail,
        password: autoLoginPassword,
      );

      final response = await _apiService.login(request);
      
      if (response.success) {
        await _saveAuthData(response.token, response.user);
        _currentUser = response.user;
        _isLoggedIn = true;
        notifyListeners();
        return true;
      } else {
        _setError('Erreur lors de la connexion automatique');
        return false;
      }
    } on ApiException catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Une erreur inattendue est survenue');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Connexion
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final request = LoginRequest(
        email: email,
        password: password,
      );

      final response = await _apiService.login(request);
      
      if (response.success) {
        await _saveAuthData(response.token, response.user);
        _currentUser = response.user;
        _isLoggedIn = true;
        notifyListeners();
        return true;
      } else {
        _setError('Identifiants invalides');
        return false;
      }
    } on ApiException catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Une erreur inattendue est survenue');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Déconnexion
  Future<void> logout() async {
    _setLoading(true);

    try {
      // Informer le serveur de la déconnexion
      await _apiService.logout();
    } catch (e) {
      // Continuer même si l'appel API échoue
      print('Erreur lors de la déconnexion: $e');
    }

    await _clearAuthData();
    _currentUser = null;
    _isLoggedIn = false;
    _setLoading(false);
    notifyListeners();
  }

  // Mot de passe oublié
  Future<bool> forgotPassword(String email) async {
    _setLoading(true);
    _clearError();

    try {
      final request = ForgotPasswordRequest(email: email);
      final response = await _apiService.forgotPassword(request);
      
      if (response.success) {
        return true;
      } else {
        _setError(response.error ?? 'Erreur lors de l\'envoi de l\'email');
        return false;
      }
    } on ApiException catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Une erreur inattendue est survenue');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Réinitialiser le mot de passe
  Future<bool> resetPassword({
    required String token,
    required String password,
    required String confirmPassword,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final request = ResetPasswordRequest(
        password: password,
        confirmPassword: confirmPassword,
      );

      final response = await _apiService.resetPassword(token, request);
      
      if (response.success) {
        await _saveAuthData(response.token, response.user);
        _currentUser = response.user;
        _isLoggedIn = true;
        notifyListeners();
        return true;
      } else {
        _setError('Erreur lors de la réinitialisation');
        return false;
      }
    } on ApiException catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Une erreur inattendue est survenue');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Mettre à jour le mot de passe
  Future<bool> updatePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.updatePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      );
      
      if (response.success) {
        return true;
      } else {
        _setError(response.error ?? 'Erreur lors de la mise à jour');
        return false;
      }
    } on ApiException catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Une erreur inattendue est survenue');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Vérifier l'email
  Future<bool> verifyEmail(String token) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.verifyEmail(token);
      
      if (response.success) {
        // Rafraîchir les données utilisateur
        await refreshCurrentUser();
        return true;
      } else {
        _setError(response.error ?? 'Erreur lors de la vérification');
        return false;
      }
    } on ApiException catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Une erreur inattendue est survenue');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Renvoyer l'email de vérification
  Future<bool> resendVerificationEmail() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.resendVerificationEmail();
      
      if (response.success) {
        return true;
      } else {
        _setError(response.error ?? 'Erreur lors de l\'envoi');
        return false;
      }
    } on ApiException catch (e) {
      _setError(e.message);
      return false;
    } catch (e) {
      _setError('Une erreur inattendue est survenue');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Rafraîchir les données de l'utilisateur actuel
  Future<void> refreshCurrentUser() async {
    if (!_isLoggedIn) return;

    try {
      final response = await _apiService.getCurrentUser();
      if (response.success && response.data != null) {
        _currentUser = response.data!;
        
        // Mettre à jour les données stockées
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_userKey, _currentUser!.toJson().toString());
        
        notifyListeners();
      }
    } catch (e) {
      print('Erreur lors du rafraîchissement de l\'utilisateur: $e');
    }
  }

  // Obtenir le token stocké (utilisé par ApiService)
  Future<String?> getStoredToken() async {
    return await _secureStorage.read(key: _tokenKey);
  }

  // Sauvegarder les données d'authentification
  Future<void> _saveAuthData(String token, User user) async {
    final prefs = await SharedPreferences.getInstance();
    
    await _secureStorage.write(key: _tokenKey, value: token);
    await prefs.setString(_userKey, user.toJson().toString());
    await prefs.setBool(_isLoggedInKey, true);
  }

  // Nettoyer les données d'authentification
  Future<void> _clearAuthData() async {
    final prefs = await SharedPreferences.getInstance();
    
    await _secureStorage.delete(key: _tokenKey);
    await prefs.remove(_userKey);
    await prefs.setBool(_isLoggedInKey, false);
  }

  // Méthodes utilitaires privées
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Méthodes utilitaires pour l'ApiService
  void setToken(String token) async {
    await _secureStorage.write(key: _tokenKey, value: token);
  }

  Future<void> clearToken() async {
    await _secureStorage.delete(key: _tokenKey);
  }
} 