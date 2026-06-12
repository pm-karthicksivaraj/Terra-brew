import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/storage/auth_storage.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';

class AuthRepository {
  /// Login with email, password, and tenant slug
  Future<AuthResponseModel> login({
    required String email,
    required String password,
    required String tenantSlug,
  }) async {
    try {
      final data = await ApiClient.postMap(
        '/mobile/auth',
        data: {
          'email': email.trim(),
          'password': password,
          'tenantSlug': tenantSlug.trim(),
        },
      );

      final authResponse = AuthResponseModel.fromJson(data);

      await _persistAuthData(authResponse);

      return authResponse;
    } on ApiException catch (e) {
      throw AuthException(_mapApiException(e));
    } catch (e) {
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

      final authResponse = AuthResponseModel.fromJson(data);

      await _persistAuthData(authResponse);

      return authResponse;
    } on ApiException catch (e) {
      throw AuthException(_mapApiException(e));
    } catch (e) {
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
    await AuthStorage.saveTenantId(authResponse.user.tenantId);
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
