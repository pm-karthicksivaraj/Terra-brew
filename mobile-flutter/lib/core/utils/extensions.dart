import 'dart:math';

import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// Common extension methods for the TerraBrew Coffee application.
///
/// Provides convenient, chainable methods on standard Dart types
/// for common operations like string manipulation, date formatting,
/// currency conversion, and BuildContext access.

// ═══════════════════════════════════════════════════════════════════
// STRING EXTENSIONS
// ═══════════════════════════════════════════════════════════════════

extension StringExtensions on String {
  /// Capitalizes the first letter of the string.
  ///
  /// 'hello' → 'Hello'
  /// 'hello world' → 'Hello world'
  String get capitalize {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  /// Capitalizes the first letter of each word.
  ///
  /// 'hello world' → 'Hello World'
  /// 'coffee_beans' → 'Coffee_beans'
  String get capitalizeWords {
    if (isEmpty) return this;
    return split(' ').map((word) => word.capitalize).join(' ');
  }

  /// Converts snake_case to Title Case.
  ///
  /// 'eudr_compliance' → 'EUDR Compliance'
  /// 'farm_land' → 'Farm Land'
  String get fromSnakeCase {
    if (isEmpty) return this;
    return split('_').map((word) {
      if (word.toUpperCase() == word && word.length <= 4) {
        // Keep acronyms uppercase (e.g., 'eudr' → 'EUDR')
        return word.toUpperCase();
      }
      return word.capitalize;
    }).join(' ');
  }

  /// Converts camelCase to Title Case.
  ///
  /// 'firstName' → 'First Name'
  /// 'eudrCompliance' → 'Eudr Compliance'
  String get fromCamelCase {
    if (isEmpty) return this;
    final result = replaceAllMapped(
      RegExp(r'[A-Z]'),
      (match) => ' ${match.group(0)}',
    );
    return result.capitalizeWords.trim();
  }

  /// Checks if the string is a valid email address.
  bool get isValidEmail {
    final regex = RegExp(
      r'^[a-zA-Z0-9.!#$%&*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$',
    );
    return regex.hasMatch(this);
  }

  /// Checks if the string is a valid phone number.
  /// Supports international format with + prefix.
  bool get isValidPhone {
    final regex = RegExp(r'^\+?[1-9]\d{6,14}$');
    return regex.hasMatch(replaceAll(RegExp(r'[\s\-()]'), ''));
  }

  /// Checks if the string is a valid URL.
  bool get isValidUrl {
    return Uri.tryParse(this)?.hasAbsolutePath ?? false;
  }

  /// Truncates the string to [maxLength] and adds an ellipsis if needed.
  String truncate(int maxLength, {String suffix = '...'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength - suffix.length)}$suffix';
  }

  /// Removes all whitespace from the string.
  String get removeWhitespace => replaceAll(RegExp(r'\s+'), '');

  /// Checks if the string contains only numeric characters.
  bool get isNumeric => RegExp(r'^[0-9]+$').hasMatch(this);

  /// Reverses the string.
  String get reverse => String.fromCharCodes(codeUnits.reversed);

  /// Returns the string or a default if empty.
  String orDefault(String defaultValue) => isEmpty ? defaultValue : this;

  /// Masks the string for display (e.g., emails, phone numbers).
  ///
  /// 'secret@example.com' → 's****t@example.com'
  String mask({int visibleStart = 1, int visibleEnd = 1}) {
    if (length <= visibleStart + visibleEnd) return this;
    final start = substring(0, visibleStart);
    final end = substring(length - visibleEnd);
    final maskedLength = length - visibleStart - visibleEnd;
    return '$start${'*' * maskedLength}$end';
  }

  /// Parses the string as a slug for route paths.
  /// Converts spaces to hyphens and lowercases.
  String get toSlug => toLowerCase().replaceAll(RegExp(r'\s+'), '-').replaceAll(RegExp(r'[^a-z0-9-]'), '');

  /// Checks if the string is a valid GPS coordinate (lat or lng).
  bool get isGpsCoordinate {
    final value = double.tryParse(this);
    return value != null && value >= -180 && value <= 180;
  }
}

// ═══════════════════════════════════════════════════════════════════
// NULLABLE STRING EXTENSIONS
// ═══════════════════════════════════════════════════════════════════

extension NullableStringExtensions on String? {
  /// Returns the string or an empty string if null.
  String get orEmpty => this ?? '';

  /// Returns the string or a default value if null or empty.
  String orDefault(String defaultValue) {
    if (this == null || this!.isEmpty) return defaultValue;
    return this!;
  }

  /// Checks if the string is null or empty.
  bool get isNullOrEmpty => this == null || this!.isEmpty;

  /// Checks if the string is null, empty, or only whitespace.
  bool get isNullOrBlank => this == null || this!.trim().isEmpty;
}

// ═══════════════════════════════════════════════════════════════════
// DATE TIME EXTENSIONS
// ═══════════════════════════════════════════════════════════════════

extension DateTimeExtensions on DateTime {
  /// Formats the date as 'dd/MM/yyyy'.
  String get formatDate {
    final day = this.day.toString().padLeft(2, '0');
    final month = this.month.toString().padLeft(2, '0');
    return '$day/$month/$year';
  }

  /// Formats the date as 'yyyy-MM-dd' (ISO format).
  String get formatDateIso {
    final day = this.day.toString().padLeft(2, '0');
    final month = this.month.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }

  /// Formats the time as 'HH:mm'.
  String get formatTime {
    final hour = this.hour.toString().padLeft(2, '0');
    final minute = this.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  /// Formats the time as 'HH:mm:ss'.
  String get formatTimeWithSeconds {
    final hour = this.hour.toString().padLeft(2, '0');
    final minute = this.minute.toString().padLeft(2, '0');
    final second = this.second.toString().padLeft(2, '0');
    return '$hour:$minute:$second';
  }

  /// Formats the date and time as 'dd/MM/yyyy HH:mm'.
  String get formatDateTime => '$formatDate $formatTime';

  /// Formats the date as 'MMM dd, yyyy' (e.g., 'Jan 15, 2024').
  String get formatDateLong {
    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[month]} ${day.toString().padLeft(2, '0')}, $year';
  }

  /// Formats as a relative time string (e.g., '2 hours ago', '3 days ago').
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(this);

    if (difference.inSeconds < 60) {
      return 'just now';
    } else if (difference.inMinutes < 60) {
      final minutes = difference.inMinutes;
      return '$minutes ${minutes == 1 ? 'minute' : 'minutes'} ago';
    } else if (difference.inHours < 24) {
      final hours = difference.inHours;
      return '$hours ${hours == 1 ? 'hour' : 'hours'} ago';
    } else if (difference.inDays < 30) {
      final days = difference.inDays;
      return '$days ${days == 1 ? 'day' : 'days'} ago';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '$months ${months == 1 ? 'month' : 'months'} ago';
    } else {
      final years = (difference.inDays / 365).floor();
      return '$years ${years == 1 ? 'year' : 'years'} ago';
    }
  }

  /// Returns a human-readable time difference for future dates
  /// (e.g., 'in 2 hours', 'in 3 days').
  String get timeUntil {
    final now = DateTime.now();
    final diff = difference(now);

    if (diff.inSeconds < 60) {
      return 'now';
    } else if (diff.inMinutes < 60) {
      final minutes = diff.inMinutes;
      return 'in $minutes ${minutes == 1 ? 'minute' : 'minutes'}';
    } else if (diff.inHours < 24) {
      final hours = diff.inHours;
      return 'in $hours ${hours == 1 ? 'hour' : 'hours'}';
    } else if (diff.inDays < 30) {
      final days = diff.inDays;
      return 'in $days ${days == 1 ? 'day' : 'days'}';
    } else if (diff.inDays < 365) {
      final months = (diff.inDays / 30).floor();
      return 'in $months ${months == 1 ? 'month' : 'months'}';
    } else {
      final years = (diff.inDays / 365).floor();
      return 'in $years ${years == 1 ? 'year' : 'years'}';
    }
  }

  /// Checks if the date is today.
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  /// Checks if the date is yesterday.
  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year && month == yesterday.month && day == yesterday.day;
  }

  /// Checks if the date is in the current week.
  bool get isThisWeek {
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    final endOfWeek = startOfWeek.add(const Duration(days: 6));
    return isAfter(startOfWeek.subtract(const Duration(seconds: 1))) &&
        isBefore(endOfWeek.add(const Duration(days: 1)));
  }

  /// Checks if the date is in the current month.
  bool get isThisMonth {
    final now = DateTime.now();
    return year == now.year && month == now.month;
  }

  /// Checks if the date is in the current year.
  bool get isThisYear => year == DateTime.now().year;

  /// Returns the start of the day (midnight).
  DateTime get startOfDay => DateTime(year, month, day);

  /// Returns the end of the day (23:59:59.999).
  DateTime get endOfDay => DateTime(year, month, day, 23, 59, 59, 999);

  /// Returns the start of the week (Monday).
  DateTime get startOfWeek => subtract(Duration(days: weekday - 1)).startOfDay;

  /// Returns the end of the week (Sunday).
  DateTime get endOfWeek => add(Duration(days: 7 - weekday)).endOfDay;

  /// Returns the start of the month.
  DateTime get startOfMonth => DateTime(year, month, 1);

  /// Returns the end of the month.
  DateTime get endOfMonth => DateTime(year, month + 1, 0, 23, 59, 59, 999);

  /// Returns the number of days in the month.
  int get daysInMonth => DateTime(year, month + 1, 0).day;

  /// Formats as an ISO 8601 string suitable for API transmission.
  String get toIso8601String => toUtc().toIso8601String();

  /// Returns a friendly date string for display.
  /// Shows 'Today', 'Yesterday', or the formatted date.
  String get friendlyDate {
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return formatDateLong;
  }
}

// ═══════════════════════════════════════════════════════════════════
// NUM EXTENSIONS
// ═══════════════════════════════════════════════════════════════════

extension NumExtensions on num {
  /// Formats as currency string.
  ///
  /// 1234.5.toCurrency(symbol: '\$', decimals: 2) → '\$1,234.50'
  /// 1234.5.toCurrency(symbol: 'VND', decimals: 0) → '1,235 VND'
  String toCurrency({
    String symbol = '\$',
    int decimals = 2,
    String separator = ',',
    String decimalSeparator = '.',
  }) {
    final value = abs();
    final integerPart = value.truncate();
    final decimalPart = ((value - integerPart) * pow(10, decimals)).round();

    final integerStr = integerPart.toString();
    final formatted = StringBuffer();

    for (var i = 0; i < integerStr.length; i++) {
      if (i > 0 && (integerStr.length - i) % 3 == 0) {
        formatted.write(separator);
      }
      formatted.write(integerStr[i]);
    }

    var result = formatted.toString();

    if (decimals > 0) {
      result += decimalSeparator + decimalPart.toString().padLeft(decimals, '0');
    }

    if (isNegative) result = '-$result';

    // Place symbol before or after based on convention
    if (symbol == 'VND' || symbol == '€') {
      return '$result $symbol';
    }
    return '$symbol$result';
  }

  /// Formats as a percentage string.
  ///
  /// 0.756.toPercentage() → '75.6%'
  /// 0.756.toPercentage(decimals: 0) → '76%'
  String toPercentage({int decimals = 1}) {
    return '${(this * 100).toStringAsFixed(decimals)}%';
  }

  /// Formats with thousands separators.
  ///
  /// 1234567.formatWithSeparator() → '1,234,567'
  String formatWithSeparator({String separator = ','}) {
    final parts = toString().split('.');
    final integerPart = parts[0];
    final formatted = StringBuffer();

    for (var i = 0; i < integerPart.length; i++) {
      if (i > 0 && (integerPart.length - i) % 3 == 0) {
        formatted.write(separator);
      }
      formatted.write(integerPart[i]);
    }

    if (parts.length > 1) {
      formatted.write('.${parts[1]}');
    }

    return formatted.toString();
  }

  /// Formats as a compact number (e.g., 1.2K, 3.4M).
  ///
  /// 1234.toCompact() → '1.2K'
  /// 1234567.toCompact() → '1.2M'
  String toCompact() {
    if (this >= 1000000000) {
      return '${(this / 1000000000).toStringAsFixed(1)}B';
    } else if (this >= 1000000) {
      return '${(this / 1000000).toStringAsFixed(1)}M';
    } else if (this >= 1000) {
      return '${(this / 1000).toStringAsFixed(1)}K';
    }
    return toStringAsFixed(0);
  }

  /// Clamps the value between [min] and [max].
  num clampValue(num min, num max) => clamp(min, max);

  /// Rounds to the specified number of decimal places.
  double roundTo(int decimals) {
    final mod = pow(10, decimals);
    return (this * mod).round() / mod;
  }

  /// Returns the value as a weight string with unit.
  /// 75.5.toWeight() → '75.5 kg'
  String toWeight({String unit = 'kg'}) => '${toStringAsFixed(1)} $unit';

  /// Returns the value as an area string with unit.
  /// 2.5.toArea() → '2.5 ha'
  String toArea({String unit = 'ha'}) => '${toStringAsFixed(2)} $unit';

  /// Returns the value as a temperature string.
  /// 25.toTemperature() → '25°C'
  String toTemperature({String unit = '°C'}) => '${toStringAsFixed(0)}$unit';

  /// Maps a value from one range to another (linear interpolation).
  double mapRange(double inMin, double inMax, double outMin, double outMax) {
    return ((this - inMin) * (outMax - outMin) / (inMax - inMin) + outMin)
        .toDouble();
  }
}

// ═══════════════════════════════════════════════════════════════════
// BUILD CONTEXT EXTENSIONS
// ═══════════════════════════════════════════════════════════════════

extension BuildContextExtensions on BuildContext {
  /// Returns the current ThemeData.
  ThemeData get theme => Theme.of(this);

  /// Returns the current ColorScheme.
  ColorScheme get colorScheme => Theme.of(this).colorScheme;

  /// Returns the current TextTheme.
  TextTheme get textTheme => Theme.of(this).textTheme;

  /// Returns the current MediaQueryData.
  MediaQueryData get mediaQuery => MediaQuery.of(this);

  /// Returns the screen size.
  Size get screenSize => MediaQuery.of(this).size;

  /// Returns the screen width.
  double get screenWidth => screenSize.width;

  /// Returns the screen height.
  double get screenHeight => screenSize.height;

  /// Returns the device pixel ratio.
  double get devicePixelRatio => MediaQuery.of(this).devicePixelRatio;

  /// Returns the current padding (safe area).
  EdgeInsets get padding => MediaQuery.of(this).padding;

  /// Returns the keyboard height if visible.
  double get keyboardHeight => MediaQuery.of(this).viewInsets.bottom;

  /// Whether the keyboard is currently visible.
  bool get isKeyboardVisible => MediaQuery.of(this).viewInsets.bottom > 0;

  /// Whether the device is in landscape orientation.
  bool get isLandscape => screenWidth > screenHeight;

  /// Whether the device is a tablet (width >= 600dp).
  bool get isTablet => screenWidth >= 600;

  /// Whether the device is a phone (width < 600dp).
  bool get isPhone => screenWidth < 600;

  /// Returns the bottom safe area inset.
  double get bottomPadding => padding.bottom;

  /// Returns the top safe area inset (status bar).
  double get topPadding => padding.top;

  /// Shows a SnackBar with the given message.
  void showSnackBar(String message, {Duration? duration}) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: duration ?? const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  /// Shows an error SnackBar.
  void showErrorSnackBar(String message) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.danger,
        duration: const Duration(seconds: 4),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  /// Shows a success SnackBar.
  void showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.success,
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  /// Hides the current keyboard.
  void hideKeyboard() {
    FocusScope.of(this).unfocus();
  }

  /// Pops the current route if possible.
  void pop<T extends Object?>([T? result]) {
    Navigator.of(this).pop<T>(result);
  }

  /// Whether the current route can be popped.
  bool get canPop => Navigator.of(this).canPop();
}

// ═══════════════════════════════════════════════════════════════════
// LIST EXTENSIONS
// ═══════════════════════════════════════════════════════════════════

extension ListExtensions<T> on List<T> {
  /// Returns a new list with duplicates removed, preserving order.
  List<T> get unique {
    final seen = <T>{};
    return where(seen.add).toList();
  }

  ///Chunks the list into sublists of [size] length.
  List<List<T>> chunk(int size) {
    final chunks = <List<T>>[];
    for (var i = 0; i < length; i += size) {
      final end = i + size > length ? length : i + size;
      chunks.add(sublist(i, end));
    }
    return chunks;
  }

  /// Returns the first element that satisfies [test], or null if none found.
  T? firstWhereOrNull(bool Function(T element) test) {
    for (final element in this) {
      if (test(element)) return element;
    }
    return null;
  }

  /// Safely returns the element at [index], or null if out of bounds.
  T? getOrNull(int index) {
    if (index < 0 || index >= length) return null;
    return this[index];
  }
}

// ═══════════════════════════════════════════════════════════════════
// DURATION EXTENSIONS
// ═══════════════════════════════════════════════════════════════════

extension DurationExtensions on Duration {
  /// Formats the duration as 'HH:mm:ss'.
  String get formatHms {
    final hours = inHours.toString().padLeft(2, '0');
    final minutes = (inMinutes % 60).toString().padLeft(2, '0');
    final seconds = (inSeconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds';
  }

  /// Formats the duration as a human-readable string.
  /// e.g., '2 hours 30 minutes', '45 seconds'
  String get formatReadable {
    if (inDays > 0) {
      return '$inDays ${inDays == 1 ? 'day' : 'days'}';
    } else if (inHours > 0) {
      final hours = inHours;
      final minutes = inMinutes % 60;
      if (minutes > 0) {
        return '$hours ${hours == 1 ? 'hour' : 'hours'} $minutes ${minutes == 1 ? 'minute' : 'minutes'}';
      }
      return '$hours ${hours == 1 ? 'hour' : 'hours'}';
    } else if (inMinutes > 0) {
      return '$inMinutes ${inMinutes == 1 ? 'minute' : 'minutes'}';
    } else {
      return '$inSeconds ${inSeconds == 1 ? 'second' : 'seconds'}';
    }
  }
}
