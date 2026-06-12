import 'dart:developer' as developer;

import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';

/// Application-wide logger with structured output and log levels.
///
/// Provides a simple wrapper around the logger package with:
/// - Multiple log levels (trace, debug, info, warning, error, fatal)
/// - Pretty-printed console output during development
/// - Tag-based filtering for easy debugging
/// - Conditional logging (disabled in release mode by default)
class AppLogger {
  AppLogger._();

  static Logger? _logger;

  /// Whether logging is enabled. Defaults to kDebugMode.
  static bool enabled = kDebugMode;

  /// Gets the logger instance, creating it if necessary.
  static Logger get _instance {
    _logger ??= Logger(
      printer: PrettyPrinter(
        methodCount: 0,
        errorMethodCount: 5,
        lineLength: 80,
        colors: true,
        printEmojis: true,
        dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart,
      ),
      output: _ConsoleOutput(),
      level: Level.all,
    );
    return _logger!;
  }

  /// Logs a trace-level message.
  /// Use for very detailed tracing (e.g., entering/exiting functions).
  static void trace(
    String message, {
    String? tag,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    if (!enabled) return;
    _instance.t(
      _formatMessage(message, tag),
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Logs a debug-level message.
  /// Use for debugging information that helps during development.
  static void debug(
    String message, {
    String? tag,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    if (!enabled) return;
    _instance.d(
      _formatMessage(message, tag),
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Logs an info-level message.
  /// Use for general information about app flow (e.g., user actions).
  static void info(
    String message, {
    String? tag,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    if (!enabled) return;
    _instance.i(
      _formatMessage(message, tag),
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Logs a warning-level message.
  /// Use for potentially harmful situations that don't prevent operation.
  static void warning(
    String message, {
    String? tag,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    if (!enabled) return;
    _instance.w(
      _formatMessage(message, tag),
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Logs an error-level message.
  /// Use for error events that might still allow the app to continue.
  static void error(
    String message, {
    dynamic error,
    String? tag,
    StackTrace? stackTrace,
  }) {
    if (!enabled) return;
    _instance.e(
      _formatMessage(message, tag),
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Logs a fatal-level message.
  /// Use for conditions that should never happen and will crash the app.
  static void fatal(
    String message, {
    String? tag,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    if (!enabled) return;
    _instance.f(
      _formatMessage(message, tag),
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Logs a message with a custom log level.
  static void log(
    Level level,
    String message, {
    String? tag,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    if (!enabled) return;
    _instance.log(
      level,
      _formatMessage(message, tag),
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Formats a log message with an optional tag prefix.
  static String _formatMessage(String message, String? tag) {
    if (tag != null && tag.isNotEmpty) {
      return '[$tag] $message';
    }
    return message;
  }

  /// Sets a custom logger configuration.
  /// Useful for testing or switching output targets.
  static void setLogger(Logger logger) {
    _logger = logger;
  }

  /// Clears the logger instance.
  static void reset() {
    _logger?.close();
    _logger = null;
  }
}

/// Custom console output that uses dart:developer.log for better
/// integration with Flutter DevTools and IDE debugging.
class _ConsoleOutput extends LogOutput {
  @override
  void output(OutputEvent event) {
    final lines = event.lines;
    for (final line in lines) {
      developer.log(
        line,
        level: _mapLevel(event.level),
        name: 'TerraBrew',
      );
    }
  }

  /// Maps logger package levels to dart:developer log levels.
  int _mapLevel(Level level) {
    switch (level) {
      case Level.trace:
        return 300; // FINE
      case Level.debug:
        return 500; // CONFIG
      case Level.info:
        return 800; // INFO
      case Level.warning:
        return 900; // WARNING
      case Level.error:
        return 1000; // SEVERE
      case Level.fatal:
        return 1200; // SHOUT
      case Level.off:
        return 0; // OFF
      case Level.all:
        return 0; // ALL
      default:
        return 500; // Default to CONFIG level
    }
  }
}
