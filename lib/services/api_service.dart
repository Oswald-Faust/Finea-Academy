import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../models/newsletter_model.dart';
import '../models/notification_model.dart';

// Interface pour la gestion des tokens
abstract class TokenProvider {
  Future<String?> getStoredToken();
  Future<void> clearToken();
}

class ApiService {
  late final Dio _dio;
  static const String baseUrl = kDebugMode 
      ? 'https://finea-api-production.up.railway.app/api/'  // URL pour le développement
      : 'https://finea-api-production.up.railway.app/api/';  // URL pour la production

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

  // Méthodes pour les newsletters
  Future<ApiResponse<List<NewsletterArticle>>> getNewsletterArticles({
    int page = 1,
    int limit = 10,
    String? status,
    String? search,
    String sortBy = 'createdAt',
    String sortOrder = 'desc',
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        'type': 'article',
        'sortBy': sortBy,
        'sortOrder': sortOrder,
      };
      
      if (status != null) queryParams['status'] = status;
      if (search != null) queryParams['search'] = search;

      final response = await _dio.get('/newsletters', queryParameters: queryParams);
      
      final List<dynamic> articlesData = response.data['data'] as List<dynamic>;
      final articles = articlesData.map((json) => NewsletterArticle.fromJson(json as Map<String, dynamic>)).toList();
      
      return ApiResponse<List<NewsletterArticle>>.fromJson(
        response.data, 
        (json) => articles,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<NewsletterArticle>> getNewsletterArticleById(String id) async {
    try {
      final response = await _dio.get('/newsletters/$id');
      
      final articleData = response.data['data'] as Map<String, dynamic>;
      final article = NewsletterArticle.fromJson(articleData);
      
      return ApiResponse<NewsletterArticle>.fromJson(
        response.data, 
        (json) => article,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<String>> toggleNewsletterBookmark(String articleId, bool isBookmarked) async {
    try {
      final response = await _dio.patch('/newsletters/$articleId/bookmark', data: {
        'isBookmarked': isBookmarked,
      });
      return ApiResponse<String>.fromJson(response.data, null);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Méthodes pour les notifications
  Future<ApiResponse<List<NotificationModel>>> getNotifications({
    int page = 1,
    int limit = 20,
    bool unreadOnly = false,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        'unreadOnly': unreadOnly,
      };

      final response = await _dio.get('/notifications', queryParameters: queryParams);
      
      final List<dynamic> notificationsData = response.data['data'] as List<dynamic>;
      final notifications = notificationsData.map((json) => NotificationModel.fromJson(json as Map<String, dynamic>)).toList();
      
      return ApiResponse<List<NotificationModel>>.fromJson(
        response.data, 
        (json) => notifications,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<List<NotificationModel>>> getUserNotifications({
    required String userId,
    int page = 1,
    int limit = 20,
    bool unreadOnly = false,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        'unreadOnly': unreadOnly,
      };

      final response = await _dio.get('/notifications/user/$userId', queryParameters: queryParams);
      
      final List<dynamic> notificationsData = response.data['data'] as List<dynamic>;
      final notifications = notificationsData.map((json) => NotificationModel.fromJson(json as Map<String, dynamic>)).toList();
      
      return ApiResponse<List<NotificationModel>>.fromJson(
        response.data, 
        (json) => notifications,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<String>> markNotificationAsRead(String notificationId, String userId) async {
    try {
      final response = await _dio.patch('/notifications/$notificationId/read', data: {
        'userId': userId,
      });
      return ApiResponse<String>.fromJson(response.data, null);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<String>> createNotification({
    required String title,
    required String message,
    String type = 'info',
    String priority = 'medium',
    String status = 'sent',
    List<String> targetUsers = const [],
    List<String> targetRoles = const [],
    bool isGlobal = false,
    Map<String, dynamic> metadata = const {},
  }) async {
    try {
      final response = await _dio.post('/notifications', data: {
        'title': title,
        'message': message,
        'type': type,
        'priority': priority,
        'status': status,
        'targetUsers': targetUsers,
        'targetRoles': targetRoles,
        'isGlobal': isGlobal,
        'metadata': metadata,
      });
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