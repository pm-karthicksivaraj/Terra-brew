import 'dart:io';

import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../storage/auth_storage.dart';
import '../utils/logger.dart';

/// Dio interceptor that handles JWT authentication, token refresh,
/// and tenant context headers for all API requests.
///
/// This interceptor:
/// 1. Attaches the Authorization: Bearer <token> header to every request.
/// 2. Adds tenant context headers for multi-tenancy isolation.
/// 3. Handles 401 Unauthorized responses by attempting token refresh.
/// 4. Redirects to login when refresh fails or no token exists.
class ApiInterceptor extends Interceptor {
  /// Callback to redirect the user to the login screen.
  /// Should be set during app initialization.
  static void Function()? onAuthFailure;

  /// Whether a token refresh is currently in progress.
  bool _isRefreshing = false;

  /// Queue of requests waiting for token refresh to complete.
  final List<_RetryRequest> _requestQueue = [];

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Attach JWT token
    final token = await AuthStorage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    // Attach tenant context for multi-tenancy
    final tenantId = await AuthStorage.getTenantId();
    if (tenantId != null && tenantId.isNotEmpty) {
      options.headers['X-Tenant-Id'] = tenantId;
    }

    // Add common headers
    options.headers['Accept'] = 'application/json';
    options.headers['X-App-Version'] = AppConfig.appVersion;
    options.headers['X-Platform'] = Platform.operatingSystem;

    AppLogger.debug(
      '→ ${options.method} ${options.uri}',
      tag: 'API',
    );

    handler.next(options);
  }

  @override
  void onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) {
    AppLogger.debug(
      '← ${response.statusCode} ${response.requestOptions.uri}',
      tag: 'API',
    );
    handler.next(response);
  }

  @override
  void onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    AppLogger.error(
      '✕ ${err.response?.statusCode} ${err.requestOptions.uri}: ${err.message}',
      tag: 'API',
      error: err,
    );

    // Only handle 401 Unauthorized
    if (err.response?.statusCode != 401) {
      handler.next(err);
      return;
    }

    // Skip refresh for the refresh token endpoint itself to avoid infinite loop
    if (_isRefreshEndpoint(err.requestOptions.path)) {
      AppLogger.warning('Refresh token request failed, redirecting to login');
      await _handleAuthFailure();
      handler.next(err);
      return;
    }

    // If already refreshing, queue this request
    if (_isRefreshing) {
      AppLogger.debug('Token refresh in progress, queuing request');
      _requestQueue.add(_RetryRequest(err.requestOptions, handler));
      return;
    }

    // Attempt token refresh
    _isRefreshing = true;

    try {
      final newToken = await _refreshToken();
      if (newToken != null) {
        AppLogger.info('Token refresh successful');

        // Retry the original request with new token
        final options = err.requestOptions;
        options.headers['Authorization'] = 'Bearer $newToken';

        // Process queued requests
        _processQueue(newToken);

        // Retry the failed request
        final response = await Dio().fetch(options);
        handler.resolve(response);
      } else {
        AppLogger.warning('Token refresh returned null, redirecting to login');
        _processQueueWithFailure();
        await _handleAuthFailure();
        handler.next(err);
      }
    } catch (refreshError) {
      AppLogger.error('Token refresh failed', error: refreshError);
      _processQueueWithFailure();
      await _handleAuthFailure();
      handler.next(err);
    } finally {
      _isRefreshing = false;
    }
  }

  /// Attempts to refresh the access token using the stored refresh token.
  /// Returns the new access token on success, null on failure.
  Future<String?> _refreshToken() async {
    final refreshToken = await AuthStorage.getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      AppLogger.warning('No refresh token available');
      return null;
    }

    try {
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.fullApiUrl,
        connectTimeout: AppConfig.apiTimeoutShort,
        receiveTimeout: AppConfig.apiTimeoutShort,
      ));

      final response = await dio.post(
        '/mobile/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        final newAccessToken = data['accessToken'] as String?;
        final newRefreshToken = data['refreshToken'] as String?;

        if (newAccessToken != null) {
          await AuthStorage.saveAccessToken(newAccessToken);
          if (newRefreshToken != null) {
            await AuthStorage.saveRefreshToken(newRefreshToken);
          }
          return newAccessToken;
        }
      }

      return null;
    } on DioException catch (e) {
      AppLogger.error('Refresh token API call failed', error: e);
      return null;
    } catch (e) {
      AppLogger.error('Unexpected error during token refresh', error: e);
      return null;
    }
  }

  /// Processes queued requests after a successful token refresh.
  void _processQueue(String newToken) {
    for (final retryRequest in _requestQueue) {
      retryRequest.options.headers['Authorization'] = 'Bearer $newToken';

      Dio().fetch(retryRequest.options).then((response) {
        retryRequest.handler.resolve(response);
      }).catchError((error) {
        retryRequest.handler.next(error as DioException);
      });
    }
    _requestQueue.clear();
  }

  /// Fails all queued requests when token refresh fails.
  void _processQueueWithFailure() {
    for (final retryRequest in _requestQueue) {
      retryRequest.handler.next(
        DioException(
          requestOptions: retryRequest.options,
          error: 'Authentication failed - token refresh unsuccessful',
          type: DioExceptionType.unknown,
        ),
      );
    }
    _requestQueue.clear();
  }

  /// Handles authentication failure by clearing stored tokens and
  /// triggering the login redirect callback.
  Future<void> _handleAuthFailure() async {
    await AuthStorage.clearAll();
    onAuthFailure?.call();
  }

  /// Checks if the given path is the refresh token endpoint.
  ///
  /// IMPORTANT: Only match the exact refresh endpoint.
  /// Do NOT match all /mobile/auth paths — that would cause
  /// login failures (wrong password) to trigger _handleAuthFailure(),
  /// which wipes stored tokens and prevents login.
  bool _isRefreshEndpoint(String path) {
    return path.endsWith('/mobile/auth/refresh');
  }
}

/// Represents a queued request waiting for token refresh.
class _RetryRequest {
  _RetryRequest(this.options, this.handler);

  final RequestOptions options;
  final ErrorInterceptorHandler handler;
}
