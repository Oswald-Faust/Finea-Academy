import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class User {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? phone;
  final Address? address;
  final String role;
  final String? avatar;
  final bool isEmailVerified;
  final bool isActive;
  final DateTime? lastLogin;
  final UserPreferences preferences;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phone,
    this.address,
    required this.role,
    this.avatar,
    required this.isEmailVerified,
    required this.isActive,
    this.lastLogin,
    required this.preferences,
    required this.createdAt,
    required this.updatedAt,
  });

  String get fullName => '$firstName $lastName';

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);

  User copyWith({
    String? id,
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
    Address? address,
    String? role,
    String? avatar,
    bool? isEmailVerified,
    bool? isActive,
    DateTime? lastLogin,
    UserPreferences? preferences,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      role: role ?? this.role,
      avatar: avatar ?? this.avatar,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      isActive: isActive ?? this.isActive,
      lastLogin: lastLogin ?? this.lastLogin,
      preferences: preferences ?? this.preferences,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

@JsonSerializable()
class Address {
  final String? street;
  final String? city;
  final String? postalCode;
  final String? country;

  Address({
    this.street,
    this.city,
    this.postalCode,
    this.country,
  });

  factory Address.fromJson(Map<String, dynamic> json) => _$AddressFromJson(json);
  Map<String, dynamic> toJson() => _$AddressToJson(this);

  Address copyWith({
    String? street,
    String? city,
    String? postalCode,
    String? country,
  }) {
    return Address(
      street: street ?? this.street,
      city: city ?? this.city,
      postalCode: postalCode ?? this.postalCode,
      country: country ?? this.country,
    );
  }
}

@JsonSerializable()
class UserPreferences {
  final NotificationPreferences notifications;
  final String language;
  final String theme;

  UserPreferences({
    required this.notifications,
    required this.language,
    required this.theme,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) => _$UserPreferencesFromJson(json);
  Map<String, dynamic> toJson() => _$UserPreferencesToJson(this);

  factory UserPreferences.defaultPreferences() {
    return UserPreferences(
      notifications: NotificationPreferences.defaultPreferences(),
      language: 'fr',
      theme: 'auto',
    );
  }

  UserPreferences copyWith({
    NotificationPreferences? notifications,
    String? language,
    String? theme,
  }) {
    return UserPreferences(
      notifications: notifications ?? this.notifications,
      language: language ?? this.language,
      theme: theme ?? this.theme,
    );
  }
}

@JsonSerializable()
class NotificationPreferences {
  final bool email;
  final bool push;
  final bool marketing;

  NotificationPreferences({
    required this.email,
    required this.push,
    required this.marketing,
  });

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) => _$NotificationPreferencesFromJson(json);
  Map<String, dynamic> toJson() => _$NotificationPreferencesToJson(this);

  factory NotificationPreferences.defaultPreferences() {
    return NotificationPreferences(
      email: true,
      push: true,
      marketing: false,
    );
  }

  NotificationPreferences copyWith({
    bool? email,
    bool? push,
    bool? marketing,
  }) {
    return NotificationPreferences(
      email: email ?? this.email,
      push: push ?? this.push,
      marketing: marketing ?? this.marketing,
    );
  }
}

// Modèles pour les requêtes d'authentification
@JsonSerializable()
class RegisterRequest {
  final String firstName;
  final String lastName;
  final String email;
  final String password;
  final String? phone;

  RegisterRequest({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.password,
    this.phone,
  });

  factory RegisterRequest.fromJson(Map<String, dynamic> json) => _$RegisterRequestFromJson(json);
  Map<String, dynamic> toJson() => _$RegisterRequestToJson(this);
}

@JsonSerializable()
class LoginRequest {
  final String email;
  final String password;

  LoginRequest({
    required this.email,
    required this.password,
  });

  factory LoginRequest.fromJson(Map<String, dynamic> json) => _$LoginRequestFromJson(json);
  Map<String, dynamic> toJson() => _$LoginRequestToJson(this);
}

@JsonSerializable()
class ForgotPasswordRequest {
  final String email;

  ForgotPasswordRequest({
    required this.email,
  });

  factory ForgotPasswordRequest.fromJson(Map<String, dynamic> json) => _$ForgotPasswordRequestFromJson(json);
  Map<String, dynamic> toJson() => _$ForgotPasswordRequestToJson(this);
}

@JsonSerializable()
class ResetPasswordRequest {
  final String password;
  final String confirmPassword;

  ResetPasswordRequest({
    required this.password,
    required this.confirmPassword,
  });

  factory ResetPasswordRequest.fromJson(Map<String, dynamic> json) => _$ResetPasswordRequestFromJson(json);
  Map<String, dynamic> toJson() => _$ResetPasswordRequestToJson(this);
}

// Modèles pour les réponses API
@JsonSerializable()
class AuthResponse {
  final bool success;
  final String token;
  final User user;

  AuthResponse({
    required this.success,
    required this.token,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) => _$AuthResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);
}

class ApiResponse<T> {
  final bool success;
  final String? message;
  final String? error;
  final T? data;
  final List<String>? details;

  ApiResponse({
    required this.success,
    this.message,
    this.error,
    this.data,
    this.details,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(Object? json)? fromJsonT) {
    return ApiResponse<T>(
      success: json['success'] as bool,
      message: json['message'] as String?,
      error: json['error'] as String?,
      data: json['data'] != null && fromJsonT != null ? fromJsonT(json['data']) : null,
      details: (json['details'] as List<dynamic>?)?.cast<String>(),
    );
  }

  Map<String, dynamic> toJson(Object? Function(T value)? toJsonT) {
    return {
      'success': success,
      'message': message,
      'error': error,
      'data': data != null && toJsonT != null ? toJsonT(data as T) : data,
      'details': details,
    };
  }
} 