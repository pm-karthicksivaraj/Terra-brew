import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../config/app_config.dart';
import '../utils/logger.dart';

/// Secure storage for authentication tokens and user data.
///
/// Uses flutter_secure_storage which encrypts data at rest using
/// platform-specific secure storage (Keychain on iOS, EncryptedSharedPreferences
/// on Android). This ensures tokens and sensitive user data are never
/// stored in plain text.
class AuthStorage {
  AuthStorage._();

  static const _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  // ── Access Token ────────────────────────────────────────────────

  /// Saves the access token to secure storage.
  static Future<void> saveAccessToken(String token) async {
    try {
      await _secureStorage.write(
        key: AppConfig.accessTokenKey,
        value: token,
      );
      AppLogger.debug('Access token saved');
    } catch (e) {
      AppLogger.error('Failed to save access token', error: e);
      rethrow;
    }
  }

  /// Retrieves the access token from secure storage.
  /// Returns null if no token is stored.
  static Future<String?> getAccessToken() async {
    try {
      return await _secureStorage.read(key: AppConfig.accessTokenKey);
    } catch (e) {
      AppLogger.error('Failed to read access token', error: e);
      return null;
    }
  }

  // ── Refresh Token ───────────────────────────────────────────────

  /// Saves the refresh token to secure storage.
  static Future<void> saveRefreshToken(String token) async {
    try {
      await _secureStorage.write(
        key: AppConfig.refreshTokenKey,
        value: token,
      );
      AppLogger.debug('Refresh token saved');
    } catch (e) {
      AppLogger.error('Failed to save refresh token', error: e);
      rethrow;
    }
  }

  /// Retrieves the refresh token from secure storage.
  /// Returns null if no token is stored.
  static Future<String?> getRefreshToken() async {
    try {
      return await _secureStorage.read(key: AppConfig.refreshTokenKey);
    } catch (e) {
      AppLogger.error('Failed to read refresh token', error: e);
      return null;
    }
  }

  // ── Tenant ID ───────────────────────────────────────────────────

  /// Saves the current tenant ID to secure storage.
  static Future<void> saveTenantId(String tenantId) async {
    try {
      await _secureStorage.write(
        key: AppConfig.tenantIdKey,
        value: tenantId,
      );
      AppLogger.debug('Tenant ID saved: $tenantId');
    } catch (e) {
      AppLogger.error('Failed to save tenant ID', error: e);
      rethrow;
    }
  }

  /// Retrieves the current tenant ID from secure storage.
  static Future<String?> getTenantId() async {
    try {
      return await _secureStorage.read(key: AppConfig.tenantIdKey);
    } catch (e) {
      AppLogger.error('Failed to read tenant ID', error: e);
      return null;
    }
  }

  // ── User Data ───────────────────────────────────────────────────

  /// Saves user data as a JSON-encoded map to secure storage.
  static Future<void> saveUserData(Map<String, dynamic> data) async {
    try {
      final encoded = jsonEncode(data);
      await _secureStorage.write(
        key: AppConfig.userDataKey,
        value: encoded,
      );
      AppLogger.debug('User data saved');
    } catch (e) {
      AppLogger.error('Failed to save user data', error: e);
      rethrow;
    }
  }

  /// Retrieves user data from secure storage as a decoded Map.
  /// Returns null if no data is stored or if decoding fails.
  static Future<Map<String, dynamic>?> getUserData() async {
    try {
      final encoded = await _secureStorage.read(key: AppConfig.userDataKey);
      if (encoded == null) return null;
      return jsonDecode(encoded) as Map<String, dynamic>;
    } catch (e) {
      AppLogger.error('Failed to read user data', error: e);
      return null;
    }
  }

  // ── Token Convenience Methods ───────────────────────────────────

  /// Saves both access and refresh tokens at once.
  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      saveAccessToken(accessToken),
      saveRefreshToken(refreshToken),
    ]);
  }

  /// Returns true if an access token is currently stored.
  static Future<bool> hasAccessToken() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  /// Clears the access token only (used during token refresh failure).
  static Future<void> clearAccessToken() async {
    try {
      await _secureStorage.delete(key: AppConfig.accessTokenKey);
      AppLogger.debug('Access token cleared');
    } catch (e) {
      AppLogger.error('Failed to clear access token', error: e);
    }
  }

  // ── Clear All ───────────────────────────────────────────────────

  /// Clears all stored authentication data (tokens, user data, tenant ID).
  /// Called during logout.
  static Future<void> clearAll() async {
    try {
      await _secureStorage.deleteAll();
      AppLogger.debug('All auth data cleared');
    } catch (e) {
      AppLogger.error('Failed to clear auth data', error: e);
      rethrow;
    }
  }
}
