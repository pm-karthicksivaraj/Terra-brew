import 'package:flutter/material.dart';

/// Form validators matching the Zod validation schemas used on the web app.
///
/// Each validator returns null for valid input, or an error message string
/// for invalid input. This follows the Flutter form validation convention.

class Validators {
  Validators._();

  // ── Email ───────────────────────────────────────────────────────

  /// Validates an email address.
  ///
  /// Rules:
  /// - Required (cannot be empty)
  /// - Must be a valid email format
  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Email is required';
    }

    final emailRegex = RegExp(
      r'^[a-zA-Z0-9.!#$%&*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$',
    );

    if (!emailRegex.hasMatch(value.trim())) {
      return 'Please enter a valid email address';
    }

    return null;
  }

  // ── Password ────────────────────────────────────────────────────

  /// Validates a password against the following rules:
  /// - Minimum 8 characters
  /// - At least one uppercase letter
  /// - At least one lowercase letter
  /// - At least one digit
  /// - At least one special character (!@#$%^&*(),.?":{}|<>)
  static String? password(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }

    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (!RegExp(r'[A-Z]').hasMatch(value)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!RegExp(r'[a-z]').hasMatch(value)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!RegExp(r'[0-9]').hasMatch(value)) {
      return 'Password must contain at least one digit';
    }

    if (!RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(value)) {
      return 'Password must contain at least one special character';
    }

    return null;
  }

  /// Validates a password confirmation field.
  /// Must match the original password.
  static String? confirmPassword(String? value, String originalPassword) {
    if (value == null || value.isEmpty) {
      return 'Please confirm your password';
    }

    if (value != originalPassword) {
      return 'Passwords do not match';
    }

    return null;
  }

  // ── Phone ───────────────────────────────────────────────────────

  /// Validates a phone number.
  ///
  /// Rules:
  /// - Required (cannot be empty)
  /// - Must be a valid phone number format (international or local)
  /// - Supports + prefix for international numbers
  /// - Allows spaces, hyphens, and parentheses in formatting
  static String? phone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Phone number is required';
    }

    // Remove formatting characters for validation
    final cleaned = value.replaceAll(RegExp(r'[\s\-()]'), '');

    // Check if it starts with + (international format)
    if (cleaned.startsWith('+')) {
      final digits = cleaned.substring(1);
      if (!RegExp(r'^[1-9]\d{6,14}$').hasMatch(digits)) {
        return 'Please enter a valid international phone number';
      }
    } else {
      // Local format: at least 7 digits
      if (!RegExp(r'^[0-9]{7,15}$').hasMatch(cleaned)) {
        return 'Please enter a valid phone number';
      }
    }

    return null;
  }

  // ── Required Field ──────────────────────────────────────────────

  /// Validates that a field is not empty.
  ///
  /// [fieldName] is used in the error message (e.g., 'Name is required').
  static String? required(String? value, [String fieldName = 'This field']) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }
    return null;
  }

  /// Validates that a numeric field is provided and valid.
  static String? requiredNumber(String? value, [String fieldName = 'This field']) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }

    if (double.tryParse(value.trim()) == null) {
      return '$fieldName must be a valid number';
    }

    return null;
  }

  /// Validates that an integer field is provided and valid.
  static String? requiredInteger(String? value, [String fieldName = 'This field']) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }

    if (int.tryParse(value.trim()) == null) {
      return '$fieldName must be a valid integer';
    }

    return null;
  }

  // ── GPS Coordinates ─────────────────────────────────────────────

  /// Validates a latitude value.
  ///
  /// Range: -90 to 90
  static String? latitude(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Latitude is required';
    }

    final lat = double.tryParse(value.trim());
    if (lat == null) {
      return 'Latitude must be a valid number';
    }

    if (lat < -90 || lat > 90) {
      return 'Latitude must be between -90 and 90';
    }

    return null;
  }

  /// Validates a longitude value.
  ///
  /// Range: -180 to 180
  static String? longitude(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Longitude is required';
    }

    final lng = double.tryParse(value.trim());
    if (lng == null) {
      return 'Longitude must be a valid number';
    }

    if (lng < -180 || lng > 180) {
      return 'Longitude must be between -180 and 180';
    }

    return null;
  }

  /// Validates both latitude and longitude as a pair.
  static String? gpsCoordinates(String? latValue, String? lngValue) {
    final latError = latitude(latValue);
    if (latError != null) return latError;

    final lngError = longitude(lngValue);
    if (lngError != null) return lngError;

    return null;
  }

  // ── String Length ───────────────────────────────────────────────

  /// Validates minimum string length.
  static String? minLength(String? value, int min, [String fieldName = 'This field']) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }

    if (value.trim().length < min) {
      return '$fieldName must be at least $min characters';
    }

    return null;
  }

  /// Validates maximum string length.
  static String? maxLength(String? value, int max, [String fieldName = 'This field']) {
    if (value != null && value.length > max) {
      return '$fieldName must be at most $max characters';
    }

    return null;
  }

  /// Validates that a string's length is within a range.
  static String? lengthRange(
    String? value,
    int min,
    int max, [
    String fieldName = 'This field',
  ]) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }

    if (value.trim().length < min) {
      return '$fieldName must be at least $min characters';
    }

    if (value.trim().length > max) {
      return '$fieldName must be at most $max characters';
    }

    return null;
  }

  // ── Numeric Range ───────────────────────────────────────────────

  /// Validates that a number is within a specified range.
  static String? numericRange(
    String? value,
    double min,
    double max, [
    String fieldName = 'This field',
  ]) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }

    final num = double.tryParse(value.trim());
    if (num == null) {
      return '$fieldName must be a valid number';
    }

    if (num < min || num > max) {
      return '$fieldName must be between $min and $max';
    }

    return null;
  }

  // ── URL ─────────────────────────────────────────────────────────

  /// Validates a URL.
  static String? url(String? value, [String fieldName = 'URL']) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }

    final uri = Uri.tryParse(value.trim());
    if (uri == null || !uri.hasAbsolutePath || uri.scheme.isEmpty) {
      return 'Please enter a valid URL';
    }

    if (!['http', 'https'].contains(uri.scheme)) {
      return 'URL must start with http:// or https://';
    }

    return null;
  }

  // ── Composite Validators ────────────────────────────────────────

  /// Combines multiple validators, returning the first error found.
  static String? compose(String? value, List<FormFieldValidator<String>> validators) {
    for (final validator in validators) {
      final error = validator(value);
      if (error != null) return error;
    }
    return null;
  }

  /// Creates an optional validator that only validates if the field is non-empty.
  /// Useful for fields that are not required but should be validated if filled.
  static FormFieldValidator<String> optional(FormFieldValidator<String> validator) {
    return (String? value) {
      if (value == null || value.trim().isEmpty) return null;
      return validator(value);
    };
  }

  // ── TerraBrew-Specific Validators ───────────────────────────────

  /// Validates a farm/lot area in hectares.
  static String? area(String? value, [String fieldName = 'Area']) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }

    final area = double.tryParse(value.trim());
    if (area == null) {
      return '$fieldName must be a valid number';
    }

    if (area <= 0) {
      return '$fieldName must be greater than 0';
    }

    if (area > 100000) {
      return '$fieldName seems too large (max 100,000 ha)';
    }

    return null;
  }

  /// Validates an altitude in meters.
  static String? altitude(String? value, [String fieldName = 'Altitude']) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }

    final alt = double.tryParse(value.trim());
    if (alt == null) {
      return '$fieldName must be a valid number';
    }

    if (alt < 0 || alt > 9000) {
      return '$fieldName must be between 0 and 9,000 meters';
    }

    return null;
  }

  /// Validates a coffee weight/volume quantity.
  static String? quantity(String? value, [String fieldName = 'Quantity']) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }

    final qty = double.tryParse(value.trim());
    if (qty == null) {
      return '$fieldName must be a valid number';
    }

    if (qty <= 0) {
      return '$fieldName must be greater than 0';
    }

    return null;
  }

  /// Validates a price/currency amount.
  static String? price(String? value, [String fieldName = 'Price']) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }

    final price = double.tryParse(value.trim());
    if (price == null) {
      return '$fieldName must be a valid number';
    }

    if (price < 0) {
      return '$fieldName cannot be negative';
    }

    return null;
  }
}
