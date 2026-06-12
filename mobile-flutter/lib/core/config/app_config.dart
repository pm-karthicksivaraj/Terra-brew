/// Application configuration constants for TerraBrew Coffee.
///
/// Centralizes all configurable values used across the app including
/// API endpoints, timeouts, and app metadata.
class AppConfig {
  AppConfig._();

  /// Base URL for the TerraBrew API server.
  /// Production: https://terra-brew.vercel.app
  /// Development: http://localhost:3000
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://terra-brew.vercel.app',
  );

  /// API version prefix appended to all API requests.
  static const String apiVersion = '/api';

  /// Full API base URL combining [apiBaseUrl] and [apiVersion].
  static String get fullApiUrl => '$apiBaseUrl$apiVersion';

  /// Default timeout duration for API requests.
  static const Duration apiTimeout = Duration(seconds: 30);

  /// Timeout duration for short API requests (e.g., token validation).
  static const Duration apiTimeoutShort = Duration(seconds: 10);

  /// Timeout duration for long API requests (e.g., file uploads).
  static const Duration apiTimeoutLong = Duration(seconds: 60);

  /// Application display name.
  static const String appName = 'TerraBrew Coffee';

  /// Application version string.
  static const String appVersion = '1.0.0';

  /// Application build number.
  static const int appBuildNumber = 1;

  /// Secure storage keys for auth tokens.
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String tenantIdKey = 'tenant_id';

  /// Shared preferences keys.
  static const String themeKey = 'theme_mode';
  static const String localeKey = 'locale';
  static const String lastTenantKey = 'last_tenant_id';
  static const String onboardingCompletedKey = 'onboarding_completed';

  /// Token refresh threshold — refresh when token expires within this duration.
  static const Duration tokenRefreshThreshold = Duration(minutes: 5);

  /// Maximum number of retry attempts for failed API requests.
  static const int maxRetryAttempts = 3;

  /// Delay between retry attempts (exponential backoff base).
  static const Duration retryBaseDelay = Duration(seconds: 1);

  /// Default page size for paginated API requests.
  static const int defaultPageSize = 20;

  /// Maximum page size allowed for paginated API requests.
  static const int maxPageSize = 100;
}
