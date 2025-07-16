import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';

// Interface pour la gestion des tokens
abstract class TokenProvider {
  Future<String?> getStoredToken();
  Future<void> clearToken();
}

class ApiService {
  late final Dio _dio;
  static const String baseUrl = kDebugMode 
      ? 'http://localhost:5000/api'  // URL pour le développement
      : 'https://your-production-api.com/api';  // URL pour la production

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Ajouter les intercepteurs pour le logging et la gestion des erreurs
    _dio.interceptors.add(LogInterceptor(
      requestBody: kDebugMode,
      responseBody: kDebugMode,
      error: kDebugMode,
      logPrint: (object) {
        if (kDebugMode) {
          print('API: $object');
        }
      },
    ));

    // Intercepteur pour gérer les tokens automatiquement
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Ajouter le token Bearer si disponible
        final token = await _getStoredToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        // Gérer l'expiration du token (401)
        if (error.response?.statusCode == 401) {
          await _clearStoredToken();
          // Rediriger vers l'écran de connexion si nécessaire
        }
        handler.next(error);
      },
    ));
  }

  // Méthodes d'authentification
  Future<AuthResponse> register(RegisterRequest request) async {
    try {
      final response = await _dio.post('/auth/register', data: request.toJson());
      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<AuthResponse> login(LoginRequest request) async {
    try {
      final response = await _dio.post('/auth/login', data: request.toJson());
      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<String>> forgotPassword(ForgotPasswordRequest request) async {
    try {
      final response = await _dio.post('/auth/forgot-password', data: request.toJson());
      return ApiResponse<String>.fromJson(response.data, null);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<AuthResponse> resetPassword(String token, ResetPasswordRequest request) async {
    try {
      final response = await _dio.put('/auth/reset-password/$token', data: request.toJson());
      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<String>> logout() async {
    try {
      final response = await _dio.post('/auth/logout');
      return ApiResponse<String>.fromJson(response.data, null);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<User>> getCurrentUser() async {
    try {
      final response = await _dio.get('/auth/me');
      return ApiResponse<User>.fromJson(response.data, (json) => User.fromJson(json as Map<String, dynamic>));
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<String>> updatePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    try {
      final response = await _dio.put('/auth/update-password', data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
        'confirmPassword': confirmPassword,
      });
      return ApiResponse<String>.fromJson(response.data, null);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<String>> verifyEmail(String token) async {
    try {
      final response = await _dio.get('/auth/verify-email/$token');
      return ApiResponse<String>.fromJson(response.data, null);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<String>> resendVerificationEmail() async {
    try {
      final response = await _dio.post('/auth/resend-verification');
      return ApiResponse<String>.fromJson(response.data, null);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Méthodes de gestion des utilisateurs
  Future<ApiResponse<User>> getUserById(String id) async {
    try {
      final response = await _dio.get('/users/$id');
      return ApiResponse<User>.fromJson(response.data, (json) => User.fromJson(json as Map<String, dynamic>));
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<User>> updateUser(String id, Map<String, dynamic> userData) async {
    try {
      final response = await _dio.put('/users/$id', data: userData);
      return ApiResponse<User>.fromJson(response.data, (json) => User.fromJson(json as Map<String, dynamic>));
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<String>> uploadAvatar(String userId, File avatarFile) async {
    try {
      final formData = FormData.fromMap({
        'avatar': await MultipartFile.fromFile(
          avatarFile.path,
          filename: 'avatar.jpg',
        ),
      });

      final response = await _dio.post('/users/$userId/avatar', data: formData);
      return ApiResponse<String>.fromJson(response.data, null);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Méthodes utilitaires pour la gestion des tokens
  static TokenProvider? _tokenProvider;
  
  static void setTokenProvider(TokenProvider tokenProvider) {
    _tokenProvider = tokenProvider;
  }

  Future<String?> _getStoredToken() async {
    return await _tokenProvider?.getStoredToken();
  }

  Future<void> _clearStoredToken() async {
    await _tokenProvider?.clearToken();
  }

  // Gestion centralisée des erreurs Dio
  ApiException _handleDioError(DioException error) {
    String message = 'Une erreur est survenue';
    int statusCode = 0;

    if (error.response != null) {
      statusCode = error.response!.statusCode ?? 0;
      final responseData = error.response!.data;

      if (responseData is Map<String, dynamic>) {
        message = responseData['error'] ?? responseData['message'] ?? message;
      }

      switch (statusCode) {
        case 400:
          message = 'Données invalides: $message';
          break;
        case 401:
          message = 'Non autorisé. Veuillez vous reconnecter.';
          break;
        case 403:
          message = 'Accès refusé.';
          break;
        case 404:
          message = 'Ressource non trouvée.';
          break;
        case 409:
          message = 'Conflit: $message';
          break;
        case 422:
          message = 'Données non valides: $message';
          break;
        case 429:
          message = 'Trop de requêtes. Veuillez réessayer plus tard.';
          break;
        case 500:
          message = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          message = 'Erreur réseau: $message';
      }
    } else if (error.type == DioExceptionType.connectionTimeout) {
      message = 'Délai de connexion dépassé. Vérifiez votre connexion.';
    } else if (error.type == DioExceptionType.receiveTimeout) {
      message = 'Délai de réception dépassé. Vérifiez votre connexion.';
    } else if (error.type == DioExceptionType.cancel) {
      message = 'Requête annulée.';
    } else {
      message = 'Erreur de connexion. Vérifiez votre connexion internet.';
    }

    return ApiException(message: message, statusCode: statusCode);
  }

  // Méthode pour tester la connexion à l'API
  Future<bool> testConnection() async {
    try {
      final response = await _dio.get('/health');
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}

// Exception personnalisée pour les erreurs API
class ApiException implements Exception {
  final String message;
  final int statusCode;
  final List<String>? details;

  ApiException({
    required this.message,
    this.statusCode = 0,
    this.details,
  });

  @override
  String toString() => message;
} 