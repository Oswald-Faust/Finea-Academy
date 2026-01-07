import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../models/newsletter_model.dart';
import '../models/notification_model.dart';
import '../config/api_config.dart';

// Interface pour la gestion des tokens
abstract class TokenProvider {
  Future<String?> getStoredToken();
  Future<void> clearToken();
}

class ApiService {
  late final Dio _dio;
  
  // Utilise la configuration centralisée
  static String get baseUrl => ApiConfig.apiUrl;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: ApiConfig.connectTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
      headers: ApiConfig.defaultHeaders,
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

  // Méthodes pour gérer les favoris
  Future<ApiResponse<List<Map<String, dynamic>>>> getUserFavorites({String? type}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (type != null) queryParams['type'] = type;
      
      final response = await _dio.get('/favorites', queryParameters: queryParams);
      return ApiResponse<List<Map<String, dynamic>>>.fromJson(
        response.data, 
        (data) => List<Map<String, dynamic>>.from((data as List<dynamic>?) ?? [])
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<Map<String, dynamic>>> addToFavorites(String articleId, {String type = 'article'}) async {
    try {
      final response = await _dio.post('/favorites', data: {
        'articleId': articleId,
        'type': type,
      });
      return ApiResponse<Map<String, dynamic>>.fromJson(response.data, null);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<void>> removeFromFavorites(String articleId) async {
    try {
      final response = await _dio.delete('/favorites/$articleId');
      return ApiResponse<void>.fromJson(response.data, null);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<ApiResponse<Map<String, dynamic>>> checkIfFavorite(String articleId) async {
    try {
      final response = await _dio.get('/favorites/check/$articleId');
      return ApiResponse<Map<String, dynamic>>.fromJson(response.data, null);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // ==================== PUSH NOTIFICATIONS ====================

  /// Enregistre un token FCM pour l'utilisateur connecté
  static Future<Map<String, dynamic>> registerFCMToken({
    required String token,
    required String platform,
    required String deviceId,
  }) async {
    try {
      final dio = Dio(BaseOptions(
        baseUrl: baseUrl,
        headers: {'Content-Type': 'application/json'},
      ));

      // Ajouter le token d'authentification s'il existe
      String? authToken;
      if (_tokenProvider != null) {
        authToken = await _tokenProvider!.getStoredToken();
        if (authToken != null) {
          dio.options.headers['Authorization'] = 'Bearer $authToken';
          print('🔑 Token d\'auth trouvé pour enregistrement Player ID');
        } else {
          print('⚠️  Pas de token d\'auth disponible');
        }
      } else {
        print('⚠️  TokenProvider non configuré');
      }

      final response = await dio.post('/push-notifications/register', data: {
        'token': token,
        'platform': platform,
        'deviceId': deviceId,
      });

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      print('Erreur lors de l\'enregistrement du token FCM: ${e.message}');
      return {
        'success': false,
        'error': e.response?.data?['error'] ?? 'Erreur de réseau'
      };
    }
  }

  /// Supprime un token FCM
  static Future<Map<String, dynamic>> unregisterFCMToken({
    required String deviceId,
  }) async {
    try {
      final dio = Dio(BaseOptions(
        baseUrl: baseUrl,
        headers: {'Content-Type': 'application/json'},
      ));

      // Ajouter le token d'authentification s'il existe
      String? authToken;
      if (_tokenProvider != null) {
        authToken = await _tokenProvider!.getStoredToken();
        if (authToken != null) {
          dio.options.headers['Authorization'] = 'Bearer $authToken';
          print('🔑 Token d\'auth trouvé pour enregistrement Player ID');
        } else {
          print('⚠️  Pas de token d\'auth disponible');
        }
      } else {
        print('⚠️  TokenProvider non configuré');
      }

      final response = await dio.delete('/push-notifications/unregister', data: {
        'deviceId': deviceId,
      });

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      print('Erreur lors de la suppression du token FCM: ${e.message}');
      return {
        'success': false,
        'error': e.response?.data?['error'] ?? 'Erreur de réseau'
      };
    }
  }

  /// Récupère le token d'authentification stocké (à implémenter selon votre système d'auth)

  // Récupérer les statistiques des gagnants pour l'affichage
  Future<ApiResponse<Map<String, dynamic>>> getContestDisplayStats() async {
    try {
      final response = await _dio.get('/contests/stats/display');
      
      if (response.statusCode == 200) {
        return ApiResponse(
          success: true,
          data: response.data['data'],
          message: 'Statistiques récupérées avec succès',
        );
      } else {
        return ApiResponse(
          success: false,
          error: 'Erreur lors de la récupération des statistiques',
        );
      }
    } on DioException catch (e) {
      String errorMessage = 'Erreur de connexion';
      if (e.response?.data != null) {
        errorMessage = e.response!.data['error'] ?? 'Erreur lors de la récupération des statistiques';
      } else if (e.message != null) {
        errorMessage = e.message!;
      }
      
      return ApiResponse(
        success: false,
        error: errorMessage,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Erreur inattendue: $e',
      );
    }
  }

  /// Récupérer le gagnant en position 1 avec l'adresse ETH conditionnelle
  Future<ApiResponse<Map<String, dynamic>>> getFirstPlaceWinner(String? currentUserId) async {
    try {
      final queryParams = <String, dynamic>{};
      if (currentUserId != null) {
        queryParams['userId'] = currentUserId;
      }
      
      final response = await _dio.get(
        '/standalone-winners/first-place',
        queryParameters: queryParams,
      );
      
      if (response.statusCode == 200) {
        return ApiResponse(
          success: true,
          data: response.data['data'],
          message: 'Gagnant récupéré avec succès',
        );
      } else {
        return ApiResponse(
          success: false,
          error: 'Erreur lors de la récupération du gagnant',
        );
      }
    } on DioException catch (e) {
      String errorMessage = 'Erreur de connexion';
      if (e.response?.data != null) {
        errorMessage = e.response!.data['error'] ?? 'Erreur lors de la récupération du gagnant';
      } else if (e.message != null) {
        errorMessage = e.message!;
      }
      
      return ApiResponse(
        success: false,
        error: errorMessage,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Erreur inattendue: $e',
      );
    }
  }

  // ==================== NEWS API METHODS ====================

  /// Récupérer la dernière actualité publiée
  Future<ApiResponse<Map<String, dynamic>>> getLatestNews() async {
    try {
      final response = await _dio.get('/news/latest');
      
      if (response.statusCode == 200) {
        return ApiResponse(
          success: true,
          data: response.data['data'],
          message: 'Actualité récupérée avec succès',
        );
      } else {
        return ApiResponse(
          success: false,
          error: 'Erreur lors de la récupération de l\'actualité',
        );
      }
    } on DioException catch (e) {
      String errorMessage = 'Erreur de connexion';
      if (e.response?.data != null) {
        errorMessage = e.response!.data['error'] ?? 'Erreur lors de la récupération de l\'actualité';
      } else if (e.message != null) {
        errorMessage = e.message!;
      }
      
      return ApiResponse(
        success: false,
        error: errorMessage,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Erreur inattendue: $e',
      );
    }
  }

  /// Récupérer l'actualité de la semaine actuelle
  Future<ApiResponse<Map<String, dynamic>>> getCurrentWeekNews() async {
    try {
      final response = await _dio.get('/news/current-week');
      
      if (response.statusCode == 200) {
        return ApiResponse(
          success: true,
          data: response.data['data'],
          message: 'Actualité de la semaine récupérée avec succès',
        );
      } else {
        return ApiResponse(
          success: false,
          error: 'Erreur lors de la récupération de l\'actualité de la semaine',
        );
      }
    } on DioException catch (e) {
      String errorMessage = 'Erreur de connexion';
      if (e.response?.data != null) {
        errorMessage = e.response!.data['error'] ?? 'Erreur lors de la récupération de l\'actualité de la semaine';
      } else if (e.message != null) {
        errorMessage = e.message!;
      }
      
      return ApiResponse(
        success: false,
        error: errorMessage,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Erreur inattendue: $e',
      );
    }
  }

  /// Récupérer toutes les actualités
  Future<ApiResponse<List<Map<String, dynamic>>>> getAllNews({
    int page = 1,
    int limit = 10,
    String? status,
    String? search,
    String sortBy = 'publishedAt',
    String sortOrder = 'desc',
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        'sortBy': sortBy,
        'sortOrder': sortOrder,
      };
      
      if (status != null) queryParams['status'] = status;
      if (search != null) queryParams['search'] = search;

      final response = await _dio.get('/news', queryParameters: queryParams);
      
      if (response.statusCode == 200) {
        final List<dynamic> newsData = response.data['data']['news'] as List<dynamic>;
        final news = newsData.map((json) => json as Map<String, dynamic>).toList();
        
        return ApiResponse(
          success: true,
          data: news,
          message: 'Actualités récupérées avec succès',
        );
      } else {
        return ApiResponse(
          success: false,
          error: 'Erreur lors de la récupération des actualités',
        );
      }
    } on DioException catch (e) {
      String errorMessage = 'Erreur de connexion';
      if (e.response?.data != null) {
        errorMessage = e.response!.data['error'] ?? 'Erreur lors de la récupération des actualités';
      } else if (e.message != null) {
        errorMessage = e.message!;
      }
      
      return ApiResponse(
        success: false,
        error: errorMessage,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Erreur inattendue: $e',
      );
    }
  }

  /// Récupérer une actualité par ID
  Future<ApiResponse<Map<String, dynamic>>> getNewsById(String id) async {
    try {
      final response = await _dio.get('/news/$id');
      
      if (response.statusCode == 200) {
        return ApiResponse(
          success: true,
          data: response.data['data'],
          message: 'Actualité récupérée avec succès',
        );
      } else {
        return ApiResponse(
          success: false,
          error: 'Erreur lors de la récupération de l\'actualité',
        );
      }
    } on DioException catch (e) {
      String errorMessage = 'Erreur de connexion';
      if (e.response?.data != null) {
        errorMessage = e.response!.data['error'] ?? 'Erreur lors de la récupération de l\'actualité';
      } else if (e.message != null) {
        errorMessage = e.message!;
      }
      
      return ApiResponse(
        success: false,
        error: errorMessage,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Erreur inattendue: $e',
      );
    }
  }

  /// Récupérer les permissions d'alertes de l'utilisateur connecté
  Future<Map<String, bool>> getAlertsPermissions() async {
    try {
      final response = await _dio.get('/users/me/alerts-permissions');
      final data = response.data['data'] as Map<String, dynamic>;
      return {
        'canViewClosedAlerts': data['canViewClosedAlerts'] ?? false,
        'canViewPositioningAlerts': data['canViewPositioningAlerts'] ?? false,
      };
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Demander un rappel téléphonique
  Future<ApiResponse<String>> requestCallback() async {
    try {
      final response = await _dio.post('/users/request-callback');
      return ApiResponse<String>.fromJson(response.data, null);
    } on DioException catch (e) {
      throw _handleDioError(e);
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