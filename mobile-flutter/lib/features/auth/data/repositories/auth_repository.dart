import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/storage/auth_storage.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';

class AuthRepository {
  /// Login with email and password (email-first, auto-discovers tenant)
  /// If user belongs to multiple tenants, returns requiresTenantSelection.
  Future<AuthResponseModel> login({
    required String email,
    required String password,
  }) async {
    try {
      final data = await ApiClient.postMap(
        '/mobile/auth',
        data: {
          'email': email.trim(),
          'password': password,
        },
      );

      // Check if the API explicitly returned a failure
      // (API returns {success: false, error: "..."} with 401,
      //  but Dio's validateStatus allows < 500 so it doesn't throw)
      if (data['success'] == false) {
        final errorMsg = data['error'] as String? ?? 'Login failed. Please try again.';
        throw AuthException(errorMsg);
      }

      // Check if tenant selection is required
      if (data['requiresTenantSelection'] == true) {
        throw TenantSelectionRequiredException(
          tenants: (data['tenants'] as List<dynamic>)
              .map((t) => TenantOption.fromJson(t as Map<String, dynamic>))
              .toList(),
        );
      }

      final authResponse = AuthResponseModel.fromJson(data);

      await _persistAuthData(authResponse);

      return authResponse;
    } on ApiException catch (e) {
      throw AuthException(_mapApiException(e));
    } catch (e) {
      if (e is TenantSelectionRequiredException) rethrow;
      if (e is AuthException) rethrow;
      throw AuthException('An unexpected error occurred. Please try again.');
    }
  }

  /// Select a specific tenant after multi-tenant discovery
  Future<AuthResponseModel> selectTenant({
    required String email,
    required String password,
    required String tenantId,
  }) async {
    try {
      final data = await ApiClient.postMap(
        '/mobile/auth/select-tenant',
        data: {
          'email': email.trim(),
          'password': password,
          'tenantId': tenantId,
        },
      );

      // Check if the API explicitly returned a failure
      if (data['success'] == false) {
        final errorMsg = data['error'] as String? ?? 'Tenant selection failed. Please try again.';
        throw AuthException(errorMsg);
      }

      final authResponse = AuthResponseModel.fromJson(data);

      await _persistAuthData(authResponse);

      return authResponse;
    } on ApiException catch (e) {
      throw AuthException(_mapApiException(e));
    } catch (e) {
      if (e is AuthException) rethrow;
      throw AuthException('An unexpected error occurred. Please try again.');
    }
  }

  /// Platform super admin login
  Future<AuthResponseModel> platformLogin({
    required String email,
    required String password,
  }) async {
    try {
      final data = await ApiClient.postMap(
        '/mobile/auth/platform',
        data: {
          'email': email.trim(),
          'password': password,
        },
      );

      // Check if the API explicitly returned a failure
      if (data['success'] == false) {
        final errorMsg = data['error'] as String? ?? 'Platform login failed. Please try again.';
        throw AuthException(errorMsg);
      }

      final authResponse = AuthResponseModel.fromJson(data);

      await _persistAuthData(authResponse);

      return authResponse;
    } on ApiException catch (e) {
      throw AuthException(_mapApiException(e));
    } catch (e) {
      if (e is AuthException) rethrow;
      throw AuthException('An unexpected error occurred. Please try again.');
    }
  }

  /// Logout and clear stored data
  Future<void> logout() async {
    await AuthStorage.clearAll();
    ApiClient.reset();
  }

  /// Get current user from secure storage
  Future<UserModel?> getCurrentUser() async {
    try {
      final userData = await AuthStorage.getUserData();
      if (userData == null) return null;
      return UserModel.fromJson(userData);
    } catch (_) {
      return null;
    }
  }

  /// Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final hasToken = await AuthStorage.hasAccessToken();
    return hasToken;
  }

  /// Save remember me preferences
  Future<void> saveRememberMe({
    required bool remember,
    String? email,
    String? tenantSlug,
  }) async {
    const storage = FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true),
    );
    await storage.write(
      key: 'remember_me',
      value: remember.toString(),
    );
    if (remember && email != null) {
      await storage.write(key: 'saved_email', value: email);
    }
    if (remember && tenantSlug != null) {
      await storage.write(key: 'saved_tenant_slug', value: tenantSlug);
    }
    if (!remember) {
      await storage.delete(key: 'saved_email');
      await storage.delete(key: 'saved_tenant_slug');
    }
  }

  /// Load remember me preferences
  Future<RememberMeData> loadRememberMe() async {
    const storage = FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true),
    );
    final rememberStr = await storage.read(key: 'remember_me');
    final remember = rememberStr == 'true';
    final email = await storage.read(key: 'saved_email');
    final tenantSlug = await storage.read(key: 'saved_tenant_slug');
    return RememberMeData(
      remember: remember,
      email: email ?? '',
      tenantSlug: tenantSlug ?? '',
    );
  }

  /// Persist auth data to secure storage
  Future<void> _persistAuthData(AuthResponseModel authResponse) async {
    await AuthStorage.saveAccessToken(authResponse.token);
    if (authResponse.refreshToken != null) {
      await AuthStorage.saveRefreshToken(authResponse.refreshToken!);
    }
    // Only save tenant ID for tenant-scoped users (not platform admins)
    if (authResponse.user.tenantId.isNotEmpty) {
      await AuthStorage.saveTenantId(authResponse.user.tenantId);
    }
    await AuthStorage.saveUserData(authResponse.user.toJson());
  }

  /// Map ApiException to user-friendly message
  String _mapApiException(ApiException e) {
    if (e.isNetworkError) {
      return 'No internet connection. Please try again.';
    }
    switch (e.type) {
      case ApiErrorType.unauthorized:
        return 'Invalid credentials. Please try again.';
      case ApiErrorType.forbidden:
        return 'Access denied. Contact your administrator.';
      case ApiErrorType.notFound:
        return 'Tenant not found. Check your tenant slug.';
      case ApiErrorType.rateLimit:
        return 'Too many attempts. Please wait and try again.';
      case ApiErrorType.validation:
        return 'Please check your input and try again.';
      case ApiErrorType.timeout:
        return 'Connection timeout. Please check your network.';
      case ApiErrorType.network:
        return 'Network error. Please check your connection.';
      default:
        return e.message;
    }
  }
}

class AuthException implements Exception {
  final String message;
  AuthException(this.message);

  @override
  String toString() => message;
}

/// Thrown when user belongs to multiple tenants and must select one
class TenantSelectionRequiredException implements Exception {
  final List<TenantOption> tenants;
  TenantSelectionRequiredException({required this.tenants});

  @override
  String toString() => 'Tenant selection required (${tenants.length} tenants)';
}

/// Tenant option returned during multi-tenant discovery
class TenantOption {
  final String tenantId;
  final String tenantName;
  final String tenantSlug;
  final String entityType;
  final String? countryCode;
  final String? country;
  final String? currency;
  final String? language;
  final String userId;
  final String userName;
  final String role;

  const TenantOption({
    required this.tenantId,
    required this.tenantName,
    required this.tenantSlug,
    required this.entityType,
    this.countryCode,
    this.country,
    this.currency,
    this.language,
    required this.userId,
    required this.userName,
    required this.role,
  });

  factory TenantOption.fromJson(Map<String, dynamic> json) {
    return TenantOption(
      tenantId: json['tenantId'] as String? ?? '',
      tenantName: json['tenantName'] as String? ?? '',
      tenantSlug: json['tenantSlug'] as String? ?? '',
      entityType: json['entityType'] as String? ?? '',
      countryCode: json['countryCode'] as String?,
      country: json['country'] as String?,
      currency: json['currency'] as String?,
      language: json['language'] as String?,
      userId: json['userId'] as String? ?? '',
      userName: json['userName'] as String? ?? '',
      role: json['role'] as String? ?? '',
    );
  }
}

class RememberMeData {
  final bool remember;
  final String email;
  final String tenantSlug;

  const RememberMeData({
    this.remember = false,
    this.email = '',
    this.tenantSlug = '',
  });
}
