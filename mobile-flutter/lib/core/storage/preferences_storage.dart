import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';
import '../utils/logger.dart';

/// Preferences storage using shared_preferences for non-sensitive app settings.
///
/// Stores user preferences like theme mode, locale, last selected tenant,
/// and onboarding completion status. This data is not sensitive and doesn't
/// need the encryption provided by flutter_secure_storage.
class PreferencesStorage {
  PreferencesStorage._();

  static SharedPreferences? _prefs;

  /// Initializes the shared preferences instance.
  /// Must be called before any other method, typically in main.dart.
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    AppLogger.debug('PreferencesStorage initialized');
  }

  /// Returns the shared preferences instance, throwing if not initialized.
  static SharedPreferences get _instance {
    if (_prefs == null) {
      throw StateError(
        'PreferencesStorage not initialized. Call PreferencesStorage.init() first.',
      );
    }
    return _prefs!;
  }

  // ── Theme Mode ──────────────────────────────────────────────────

  /// Saves the theme mode preference.
  /// Accepts 'light', 'dark', or 'system'.
  static Future<void> setThemeMode(String mode) async {
    try {
      await _instance.setString(AppConfig.themeKey, mode);
      AppLogger.debug('Theme mode saved: $mode');
    } catch (e) {
      AppLogger.error('Failed to save theme mode', error: e);
    }
  }

  /// Gets the saved theme mode preference.
  /// Returns 'system' by default.
  static String getThemeMode() {
    try {
      return _instance.getString(AppConfig.themeKey) ?? 'system';
    } catch (e) {
      AppLogger.error('Failed to read theme mode', error: e);
      return 'system';
    }
  }

  // ── Locale ──────────────────────────────────────────────────────

  /// Saves the locale preference as a language code string.
  static Future<void> setLocale(String locale) async {
    try {
      await _instance.setString(AppConfig.localeKey, locale);
      AppLogger.debug('Locale saved: $locale');
    } catch (e) {
      AppLogger.error('Failed to save locale', error: e);
    }
  }

  /// Gets the saved locale preference.
  /// Returns 'en' by default.
  static String getLocale() {
    try {
      return _instance.getString(AppConfig.localeKey) ?? 'en';
    } catch (e) {
      AppLogger.error('Failed to read locale', error: e);
      return 'en';
    }
  }

  // ── Last Selected Tenant ────────────────────────────────────────

  /// Saves the last selected tenant ID for quick re-selection.
  static Future<void> setLastTenantId(String tenantId) async {
    try {
      await _instance.setString(AppConfig.lastTenantKey, tenantId);
      AppLogger.debug('Last tenant ID saved: $tenantId');
    } catch (e) {
      AppLogger.error('Failed to save last tenant ID', error: e);
    }
  }

  /// Gets the last selected tenant ID.
  /// Returns null if no tenant was previously selected.
  static String? getLastTenantId() {
    try {
      return _instance.getString(AppConfig.lastTenantKey);
    } catch (e) {
      AppLogger.error('Failed to read last tenant ID', error: e);
      return null;
    }
  }

  // ── Onboarding ──────────────────────────────────────────────────

  /// Marks the onboarding flow as completed.
  static Future<void> setOnboardingCompleted({bool completed = true}) async {
    try {
      await _instance.setBool(AppConfig.onboardingCompletedKey, completed);
      AppLogger.debug('Onboarding completed: $completed');
    } catch (e) {
      AppLogger.error('Failed to save onboarding status', error: e);
    }
  }

  /// Returns whether the onboarding flow has been completed.
  /// Returns false by default.
  static bool isOnboardingCompleted() {
    try {
      return _instance.getBool(AppConfig.onboardingCompletedKey) ?? false;
    } catch (e) {
      AppLogger.error('Failed to read onboarding status', error: e);
      return false;
    }
  }

  // ── General Purpose Methods ─────────────────────────────────────

  /// Saves a string value with the given key.
  static Future<void> setString(String key, String value) async {
    try {
      await _instance.setString(key, value);
    } catch (e) {
      AppLogger.error('Failed to save string for key: $key', error: e);
    }
  }

  /// Gets a string value for the given key.
  static String? getString(String key) {
    try {
      return _instance.getString(key);
    } catch (e) {
      AppLogger.error('Failed to read string for key: $key', error: e);
      return null;
    }
  }

  /// Saves a boolean value with the given key.
  static Future<void> setBool(String key, bool value) async {
    try {
      await _instance.setBool(key, value);
    } catch (e) {
      AppLogger.error('Failed to save bool for key: $key', error: e);
    }
  }

  /// Gets a boolean value for the given key.
  static bool getBool(String key, {bool defaultValue = false}) {
    try {
      return _instance.getBool(key) ?? defaultValue;
    } catch (e) {
      AppLogger.error('Failed to read bool for key: $key', error: e);
      return defaultValue;
    }
  }

  /// Saves an integer value with the given key.
  static Future<void> setInt(String key, int value) async {
    try {
      await _instance.setInt(key, value);
    } catch (e) {
      AppLogger.error('Failed to save int for key: $key', error: e);
    }
  }

  /// Gets an integer value for the given key.
  static int getInt(String key, {int defaultValue = 0}) {
    try {
      return _instance.getInt(key) ?? defaultValue;
    } catch (e) {
      AppLogger.error('Failed to read int for key: $key', error: e);
      return defaultValue;
    }
  }

  /// Removes a value for the given key.
  static Future<void> remove(String key) async {
    try {
      await _instance.remove(key);
    } catch (e) {
      AppLogger.error('Failed to remove key: $key', error: e);
    }
  }

  /// Checks if a key exists in preferences.
  static bool containsKey(String key) {
    try {
      return _instance.containsKey(key);
    } catch (e) {
      AppLogger.error('Failed to check key: $key', error: e);
      return false;
    }
  }

  /// Clears all preferences data.
  static Future<void> clearAll() async {
    try {
      await _instance.clear();
      AppLogger.debug('All preferences cleared');
    } catch (e) {
      AppLogger.error('Failed to clear preferences', error: e);
    }
  }
}
