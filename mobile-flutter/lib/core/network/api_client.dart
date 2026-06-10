import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../storage/auth_storage.dart';
import '../utils/logger.dart';
import 'api_interceptor.dart';

/// Dio-based API client for the TerraBrew Coffee application.
///
/// Provides a centralized HTTP client with:
/// - JWT authentication via interceptor
/// - Automatic token refresh on 401 responses
/// - Tenant isolation headers
/// - Consistent error handling
/// - Request/response logging
/// - Support for GET, POST, PUT, DELETE with typed responses
class ApiClient {
  ApiClient._();

  static Dio? _dio;

  /// Returns the configured Dio instance, creating it if necessary.
  static Dio get dio {
    if (_dio == null) {
      _dio = _createDio();
    }
    return _dio!;
  }

  /// Creates a configured Dio instance with base options and interceptors.
  static Dio _createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.fullApiUrl,
        connectTimeout: AppConfig.apiTimeout,
        receiveTimeout: AppConfig.apiTimeout,
        sendTimeout: AppConfig.apiTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        responseType: ResponseType.json,
        validateStatus: (status) => status != null && status < 500,
      ),
    );

    dio.interceptors.addAll([
      ApiInterceptor(),
      _LoggingInterceptor(),
    ]);

    return dio;
  }

  /// Resets the Dio instance, forcing recreation on next access.
  /// Useful after logout or when base URL changes.
  static void reset() {
    _dio?.close(force: true);
    _dio = null;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONVENIENCE METHODS
  // ═══════════════════════════════════════════════════════════════

  /// Performs a GET request.
  ///
  /// [path] is the endpoint path (appended to base URL).
  /// [queryParameters] are optional URL query parameters.
  /// [options] are optional Dio request options overrides.
  ///
  /// Returns the parsed response data, or throws an [ApiException].
  static Future<T> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Performs a GET request that returns a list.
  ///
  /// Same as [get] but returns the data as a List<dynamic>.
  static Future<List<dynamic>> getList(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await dio.get<List<dynamic>>(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data ?? [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Performs a GET request that returns a Map.
  ///
  /// Same as [get] but returns the data as a Map<String, dynamic>.
  static Future<Map<String, dynamic>> getMap(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await dio.get<Map<String, dynamic>>(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data ?? {};
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Performs a POST request.
  ///
  /// [path] is the endpoint path.
  /// [data] is the request body.
  /// [queryParameters] are optional URL query parameters.
  /// [options] are optional Dio request options overrides.
  static Future<T> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Performs a POST request that returns a Map.
  static Future<Map<String, dynamic>> postMap(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await dio.post<Map<String, dynamic>>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data ?? {};
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Performs a PUT request.
  static Future<T> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Performs a PUT request that returns a Map.
  static Future<Map<String, dynamic>> putMap(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await dio.put<Map<String, dynamic>>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data ?? {};
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Performs a PATCH request.
  static Future<T> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await dio.patch<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Performs a DELETE request.
  static Future<T> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Performs a multipart file upload.
  ///
  /// [path] is the endpoint path.
  /// [fields] are form data fields.
  /// [files] is a list of upload file info (key, file path, file name).
  static Future<Map<String, dynamic>> upload(
    String path, {
    Map<String, String>? fields,
    List<UploadFileInfo>? files,
    Options? options,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final formData = FormData();

      // Add form fields
      if (fields != null) {
        fields.forEach((key, value) {
          formData.fields.add(MapEntry(key, value));
        });
      }

      // Add files
      if (files != null) {
        for (final fileInfo in files) {
          formData.files.add(MapEntry(
            fileInfo.key,
            await MultipartFile.fromFile(
              fileInfo.filePath,
              filename: fileInfo.fileName,
            ),
          ));
        }
      }

      final response = await dio.post<Map<String, dynamic>>(
        path,
        data: formData,
        options: options,
        onSendProgress: onSendProgress,
      );
      return response.data ?? {};
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Downloads a file from the given path.
  ///
  /// [path] is the API endpoint path.
  /// [savePath] is the local path to save the downloaded file.
  /// [onReceiveProgress] is an optional progress callback.
  static Future<void> download(
    String path,
    String savePath, {
    ProgressCallback? onReceiveProgress,
    Options? options,
  }) async {
    try {
      await dio.download(
        path,
        savePath,
        onReceiveProgress: onReceiveProgress,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PAGINATED REQUEST HELPER
  // ═══════════════════════════════════════════════════════════════

  /// Performs a paginated GET request with standard pagination parameters.
  ///
  /// Returns a [PaginatedResponse] containing the data items and
  /// pagination metadata.
  static Future<PaginatedResponse> getPaginated(
    String path, {
    int page = 1,
    int pageSize = AppConfig.defaultPageSize,
    String? search,
    String? sortBy,
    String? sortOrder,
    Map<String, dynamic>? filters,
  }) async {
    final queryParameters = <String, dynamic>{
      'page': page,
      'pageSize': pageSize,
    };

    if (search != null && search.isNotEmpty) {
      queryParameters['search'] = search;
    }
    if (sortBy != null) {
      queryParameters['sortBy'] = sortBy;
    }
    if (sortOrder != null) {
      queryParameters['sortOrder'] = sortOrder;
    }
    if (filters != null) {
      filters.forEach((key, value) {
        queryParameters[key] = value;
      });
    }

    try {
      final response = await dio.get<Map<String, dynamic>>(
        path,
        queryParameters: queryParameters,
      );

      final data = response.data ?? {};
      return PaginatedResponse.fromJson(data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TENANT-ISOLATED REQUESTS
  // ═══════════════════════════════════════════════════════════════

  /// Performs a GET request scoped to a specific tenant.
  /// The tenant ID is automatically added as a header via the interceptor.
  static Future<T> getForTenant<T>(
    String path, {
    required String tenantId,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    // Save the tenant ID temporarily for the interceptor to pick up
    await AuthStorage.saveTenantId(tenantId);
    return get<T>(path, queryParameters: queryParameters, options: options);
  }

  /// Performs a POST request scoped to a specific tenant.
  static Future<T> postForTenant<T>(
    String path, {
    required String tenantId,
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    await AuthStorage.saveTenantId(tenantId);
    return post<T>(path, data: data, queryParameters: queryParameters, options: options);
  }

  // ═══════════════════════════════════════════════════════════════
  // ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════

  /// Converts a DioException into a more specific ApiException.
  static ApiException _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException(
          message: 'Connection timed out. Please check your internet connection and try again.',
          statusCode: error.response?.statusCode,
          type: ApiErrorType.timeout,
        );

      case DioExceptionType.connectionError:
        return ApiException(
          message: 'No internet connection. Please check your network settings.',
          statusCode: error.response?.statusCode,
          type: ApiErrorType.network,
        );

      case DioExceptionType.badResponse:
        return _handleBadResponse(error);

      case DioExceptionType.cancel:
        return ApiException(
          message: 'Request was cancelled.',
          statusCode: error.response?.statusCode,
          type: ApiErrorType.cancelled,
        );

      case DioExceptionType.badCertificate:
        return ApiException(
          message: 'SSL certificate verification failed.',
          statusCode: error.response?.statusCode,
          type: ApiErrorType.ssl,
        );

      case DioExceptionType.unknown:
        return ApiException(
          message: error.message ?? 'An unexpected error occurred.',
          statusCode: error.response?.statusCode,
          type: ApiErrorType.unknown,
        );
    }
  }

  /// Handles HTTP error responses (4xx, 5xx).
  static ApiException _handleBadResponse(DioException error) {
    final statusCode = error.response?.statusCode;
    final data = error.response?.data;

    String message;
    ApiErrorType type;

    // Try to extract error message from response body
    if (data is Map<String, dynamic>) {
      message = data['message'] as String? ??
          data['error'] as String? ??
          data['detail'] as String? ??
          _defaultMessageForStatus(statusCode);
    } else if (data is String) {
      message = data;
    } else {
      message = _defaultMessageForStatus(statusCode);
    }

    switch (statusCode) {
      case 400:
        type = ApiErrorType.badRequest;
        break;
      case 401:
        type = ApiErrorType.unauthorized;
        break;
      case 403:
        type = ApiErrorType.forbidden;
        message = 'You do not have permission to perform this action.';
        break;
      case 404:
        type = ApiErrorType.notFound;
        message = 'The requested resource was not found.';
        break;
      case 409:
        type = ApiErrorType.conflict;
        break;
      case 422:
        type = ApiErrorType.validation;
        break;
      case 429:
        type = ApiErrorType.rateLimit;
        message = 'Too many requests. Please try again later.';
        break;
      case 500:
        type = ApiErrorType.server;
        message = 'Internal server error. Please try again later.';
        break;
      case 502:
      case 503:
      case 504:
        type = ApiErrorType.server;
        message = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        type = ApiErrorType.unknown;
    }

    return ApiException(
      message: message,
      statusCode: statusCode,
      type: type,
      data: data is Map<String, dynamic> ? data : null,
    );
  }

  /// Returns a default error message for common HTTP status codes.
  static String _defaultMessageForStatus(int? statusCode) {
    switch (statusCode) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The resource may already exist.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout. The server is taking too long to respond.';
      default:
        return 'An error occurred (status: $statusCode).';
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// SUPPORTING CLASSES
// ═══════════════════════════════════════════════════════════════════

/// Custom exception for API errors with typed error categories.
class ApiException implements Exception {
  ApiException({
    required this.message,
    this.statusCode,
    this.type = ApiErrorType.unknown,
    this.data,
  });

  /// Factory constructor to create an ApiException from a DioException.
  factory ApiException.fromDioError(DioException e) {
    return ApiClient._handleDioError(e);
  }

  /// Human-readable error message.
  final String message;

  /// HTTP status code (if applicable).
  final int? statusCode;

  /// Categorized error type.
  final ApiErrorType type;

  /// Raw response data (if available).
  final Map<String, dynamic>? data;

  /// Whether this error is due to authentication failure.
  bool get isAuthError =>
      type == ApiErrorType.unauthorized || type == ApiErrorType.forbidden;

  /// Whether this error is due to network connectivity.
  bool get isNetworkError =>
      type == ApiErrorType.network || type == ApiErrorType.timeout;

  /// Whether this error is retryable.
  bool get isRetryable =>
      type == ApiErrorType.timeout ||
      type == ApiErrorType.network ||
      type == ApiErrorType.server ||
      type == ApiErrorType.rateLimit;

  @override
  String toString() => 'ApiException($type, $statusCode): $message';
}

/// Categorized API error types for programmatic error handling.
enum ApiErrorType {
  /// Request timed out.
  timeout,

  /// No network connection.
  network,

  /// 400 Bad Request.
  badRequest,

  /// 401 Unauthorized.
  unauthorized,

  /// 403 Forbidden.
  forbidden,

  /// 404 Not Found.
  notFound,

  /// 409 Conflict.
  conflict,

  /// 422 Validation Error.
  validation,

  /// 429 Rate Limited.
  rateLimit,

  /// 5xx Server Error.
  server,

  /// SSL certificate error.
  ssl,

  /// Request was cancelled.
  cancelled,

  /// Unknown error.
  unknown,
}

/// Standardized paginated API response.
class PaginatedResponse {
  PaginatedResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });

  /// Factory constructor from API response JSON.
  factory PaginatedResponse.fromJson(Map<String, dynamic> json) {
    return PaginatedResponse(
      data: json['data'] as List<dynamic>? ?? [],
      total: json['total'] as int? ?? 0,
      page: json['page'] as int? ?? 1,
      pageSize: json['pageSize'] as int? ?? AppConfig.defaultPageSize,
      totalPages: json['totalPages'] as int? ?? 0,
    );
  }

  /// The list of data items for the current page.
  final List<dynamic> data;

  /// Total number of items across all pages.
  final int total;

  /// Current page number (1-indexed).
  final int page;

  /// Number of items per page.
  final int pageSize;

  /// Total number of pages.
  final int totalPages;

  /// Whether there is a next page.
  bool get hasNextPage => page < totalPages;

  /// Whether there is a previous page.
  bool get hasPreviousPage => page > 1;
}

/// Information about a file to upload via multipart form data.
class UploadFileInfo {
  UploadFileInfo({
    required this.key,
    required this.filePath,
    required this.fileName,
  });

  /// Form field name for the file.
  final String key;

  /// Local file path to read the file from.
  final String filePath;

  /// File name to send in the request.
  final String fileName;
}

/// Simple logging interceptor for debugging API requests and responses.
class _LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    AppLogger.debug(
      '┌────────────────────────────────────────────────\n'
      '│ REQUEST: ${options.method} ${options.uri}\n'
      '│ Headers: ${_formatHeaders(options.headers)}\n'
      '│ Data: ${_truncate(options.data?.toString())}\n'
      '└────────────────────────────────────────────────',
      tag: 'HTTP',
    );
    handler.next(options);
  }

  @override
  void onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) {
    AppLogger.debug(
      '┌────────────────────────────────────────────────\n'
      '│ RESPONSE: ${response.statusCode} ${response.requestOptions.uri}\n'
      '│ Data: ${_truncate(response.data?.toString())}\n'
      '└────────────────────────────────────────────────',
      tag: 'HTTP',
    );
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    AppLogger.error(
      '┌────────────────────────────────────────────────\n'
      '│ ERROR: ${err.response?.statusCode} ${err.requestOptions.uri}\n'
      '│ Message: ${err.message}\n'
      '│ Data: ${_truncate(err.response?.data?.toString())}\n'
      '└────────────────────────────────────────────────',
      tag: 'HTTP',
      error: err,
    );
    handler.next(err);
  }

  String _formatHeaders(Map<String, dynamic> headers) {
    final sanitized = Map<String, dynamic>.from(headers);
    if (sanitized.containsKey('Authorization')) {
      final auth = sanitized['Authorization'] as String? ?? '';
      if (auth.length > 20) {
        sanitized['Authorization'] = '${auth.substring(0, 20)}...';
      }
    }
    return sanitized.toString();
  }

  String _truncate(String? text, {int maxLength = 500}) {
    if (text == null) return 'null';
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}... (truncated)';
  }
}
