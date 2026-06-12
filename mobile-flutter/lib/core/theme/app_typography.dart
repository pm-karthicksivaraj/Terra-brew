import 'package:flutter/material.dart';

/// Typography scale for the TerraBrew Coffee application.
///
/// Matches the web app's design system with 17px base font size
/// and 1.7 line height. Uses SpaceMono font family for headings
/// and system default for body text for optimal readability.
class AppTypography {
  AppTypography._();

  /// Font family for headings and monospace elements.
  static const String headingFamily = 'SpaceMono';

  /// Font family for body text (system default for best readability).
  static const String bodyFamily = 'Roboto';

  /// Base font size matching the web app (17px).
  static const double baseFontSize = 17.0;

  /// Line height multiplier matching the web app (1.7).
  static const double lineHeight = 1.7;

  /// Letter spacing for headings.
  static const double headingLetterSpacing = -0.02;

  /// Letter spacing for body text.
  static const double bodyLetterSpacing = 0.0;

  /// Font weights used across the app.
  static const FontWeight light = FontWeight.w300;
  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semiBold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;

  // ── Display Styles ──────────────────────────────────────────────

  /// Large display style for hero sections and splash screens.
  static const TextStyle displayLarge = TextStyle(
    fontFamily: headingFamily,
    fontSize: 40.0,
    fontWeight: bold,
    height: 1.2,
    letterSpacing: -0.04,
  );

  /// Medium display style for page headers.
  static const TextStyle displayMedium = TextStyle(
    fontFamily: headingFamily,
    fontSize: 32.0,
    fontWeight: bold,
    height: 1.25,
    letterSpacing: headingLetterSpacing,
  );

  /// Small display style for section headers.
  static const TextStyle displaySmall = TextStyle(
    fontFamily: headingFamily,
    fontSize: 28.0,
    fontWeight: bold,
    height: 1.3,
    letterSpacing: headingLetterSpacing,
  );

  // ── Headline Styles ─────────────────────────────────────────────

  /// Large headline for major content sections.
  static const TextStyle headlineLarge = TextStyle(
    fontFamily: headingFamily,
    fontSize: 24.0,
    fontWeight: semiBold,
    height: 1.35,
    letterSpacing: headingLetterSpacing,
  );

  /// Medium headline for content sections.
  static const TextStyle headlineMedium = TextStyle(
    fontFamily: headingFamily,
    fontSize: 22.0,
    fontWeight: semiBold,
    height: 1.4,
    letterSpacing: headingLetterSpacing,
  );

  /// Small headline for card headers.
  static const TextStyle headlineSmall = TextStyle(
    fontFamily: headingFamily,
    fontSize: 20.0,
    fontWeight: semiBold,
    height: 1.4,
    letterSpacing: headingLetterSpacing,
  );

  // ── Title Styles ────────────────────────────────────────────────

  /// Large title for list headers.
  static const TextStyle titleLarge = TextStyle(
    fontFamily: headingFamily,
    fontSize: 18.0,
    fontWeight: medium,
    height: lineHeight,
    letterSpacing: headingLetterSpacing,
  );

  /// Medium title for card titles.
  static const TextStyle titleMedium = TextStyle(
    fontFamily: headingFamily,
    fontSize: 16.0,
    fontWeight: medium,
    height: lineHeight,
    letterSpacing: headingLetterSpacing,
  );

  /// Small title for list item titles.
  static const TextStyle titleSmall = TextStyle(
    fontFamily: headingFamily,
    fontSize: 14.0,
    fontWeight: medium,
    height: 1.6,
    letterSpacing: headingLetterSpacing,
  );

  // ── Body Styles ─────────────────────────────────────────────────

  /// Large body text for primary content.
  static const TextStyle bodyLarge = TextStyle(
    fontFamily: bodyFamily,
    fontSize: baseFontSize,
    fontWeight: regular,
    height: lineHeight,
    letterSpacing: bodyLetterSpacing,
  );

  /// Medium body text for standard content.
  static const TextStyle bodyMedium = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 15.0,
    fontWeight: regular,
    height: lineHeight,
    letterSpacing: bodyLetterSpacing,
  );

  /// Small body text for secondary content.
  static const TextStyle bodySmall = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 13.0,
    fontWeight: regular,
    height: 1.6,
    letterSpacing: bodyLetterSpacing,
  );

  // ── Label Styles ────────────────────────────────────────────────

  /// Large label for form field labels.
  static const TextStyle labelLarge = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 15.0,
    fontWeight: medium,
    height: 1.5,
    letterSpacing: 0.01,
  );

  /// Medium label for chips and tags.
  static const TextStyle labelMedium = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 13.0,
    fontWeight: medium,
    height: 1.5,
    letterSpacing: 0.02,
  );

  /// Small label for caption text.
  static const TextStyle labelSmall = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 11.0,
    fontWeight: medium,
    height: 1.4,
    letterSpacing: 0.03,
  );

  // ── Caption & Overline ──────────────────────────────────────────

  /// Caption for image descriptions and timestamps.
  static const TextStyle caption = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 12.0,
    fontWeight: regular,
    height: 1.4,
    letterSpacing: 0.01,
  );

  /// Overline for category headers and section dividers.
  static const TextStyle overline = TextStyle(
    fontFamily: headingFamily,
    fontSize: 11.0,
    fontWeight: semiBold,
    height: 1.5,
    letterSpacing: 0.06,
  );

  // ── Special Styles ──────────────────────────────────────────────

  /// Monospace style for codes, IDs, and technical values.
  static const TextStyle mono = TextStyle(
    fontFamily: headingFamily,
    fontSize: 14.0,
    fontWeight: regular,
    height: 1.6,
    letterSpacing: 0.0,
  );

  /// Button text style.
  static const TextStyle button = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 15.0,
    fontWeight: semiBold,
    height: 1.3,
    letterSpacing: 0.02,
  );

  /// Builds a complete TextTheme from the defined styles.
  static TextTheme buildTextTheme() {
    return const TextTheme(
      displayLarge: displayLarge,
      displayMedium: displayMedium,
      displaySmall: displaySmall,
      headlineLarge: headlineLarge,
      headlineMedium: headlineMedium,
      headlineSmall: headlineSmall,
      titleLarge: titleLarge,
      titleMedium: titleMedium,
      titleSmall: titleSmall,
      bodyLarge: bodyLarge,
      bodyMedium: bodyMedium,
      bodySmall: bodySmall,
      labelLarge: labelLarge,
      labelMedium: labelMedium,
      labelSmall: labelSmall,
    );
  }

  /// Applies a color to a text style, returning a new style.
  static TextStyle withColor(TextStyle style, Color color) {
    return style.copyWith(color: color);
  }
}
