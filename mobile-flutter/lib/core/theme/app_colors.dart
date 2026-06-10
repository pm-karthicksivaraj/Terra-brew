import 'package:flutter/material.dart';

/// Centralized color palette for the TerraBrew Coffee application.
///
/// All colors match the web app design system exactly.
/// Use these constants throughout the app for visual consistency.
class AppColors {
  AppColors._();

  // ── Primary (Coffee Brown) ──────────────────────────────────────
  static const Color primary = Color(0xFF6D2932);
  static const Color primaryDark = Color(0xFF5A2230);
  static const Color primaryLight = Color(0xFF8B3A47);

  // ── Backgrounds ─────────────────────────────────────────────────
  static const Color background = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFFF5F0EB); // coffee-100
  static const Color surfaceVariant = Color(0xFFE8DDD2); // coffee-200

  // ── Muted ───────────────────────────────────────────────────────
  static const Color muted = Color(0xFFC7B7A3); // taupe
  static const Color mutedLight = Color(0xFFE0D5CC);
  static const Color mutedForeground = Color(0xFF6B5B4F);

  // ── Text ────────────────────────────────────────────────────────
  static const Color textPrimary = Color(0xFF1A0D10);
  static const Color textSecondary = Color(0xFF6B5B4F);
  static const Color textTertiary = Color(0xFF9B8B8E);
  static const Color textHint = Color(0xFF9B8B8E);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // ── Accent / Gold ───────────────────────────────────────────────
  static const Color gold = Color(0xFFFFC627);
  static const Color goldLight = Color(0xFFFFD966);
  static const Color goldDark = Color(0xFFE5AC00);

  // ── Status Colors ───────────────────────────────────────────────
  static const Color success = Color(0xFF78BE20);
  static const Color successLight = Color(0xFFE5F5D0);
  static const Color info = Color(0xFF00A3E0);
  static const Color infoLight = Color(0xFFE0F4FC);
  static const Color warning = Color(0xFFFF7F32);
  static const Color warningLight = Color(0xFFFFE8D9);
  static const Color danger = Color(0xFFCC2F2F);
  static const Color dangerLight = Color(0xFFFCE4E4);

  // ── EUDR Status Colors ──────────────────────────────────────────
  static const Color pending = Color(0xFFFFC627);
  static const Color inReview = Color(0xFF00A3E0);
  static const Color compliant = Color(0xFF78BE20);
  static const Color nonCompliant = Color(0xFFCC2F2F);
  static const Color expired = Color(0xFFC7B7A3);

  // ── Risk Level Colors ───────────────────────────────────────────
  static const Color riskLow = Color(0xFF78BE20);
  static const Color riskMedium = Color(0xFFFFC627);
  static const Color riskHigh = Color(0xFFFF7F32);
  static const Color riskCritical = Color(0xFFCC2F2F);

  // ── Sidebar ─────────────────────────────────────────────────────
  static const Color sidebar = Color(0xFF6D2932);
  static const Color sidebarText = Color(0xFFFFFFFF);
  static const Color sidebarHover = Color(0xFF8B3A47);
  static const Color sidebarActive = Color(0xFFFFC627);

  // ── Borders & Dividers ──────────────────────────────────────────
  static const Color border = Color(0xFFE0D5CC);
  static const Color borderLight = Color(0xFFF0E8E0);
  static const Color borderFocus = Color(0xFF6D2932);
  static const Color divider = Color(0xFFF0E8E0);

  // ── Disabled / Muted Text ───────────────────────────────────────
  static const Color textDisabled = Color(0xFFB0A39A);

  // ── Overlay & Shadows ───────────────────────────────────────────
  static const Color overlay = Color(0x33000000);
  static const Color overlayDark = Color(0x66000000);
  static const Color shadow = Color(0x1A000000);
  static const Color shadowDark = Color(0x33000000);

  // ── Shimmer ─────────────────────────────────────────────────────
  static const Color shimmerBase = Color(0xFFE8DDD2);
  static const Color shimmerHighlight = Color(0xFFF5F0EB);

  // ── Dark Theme ──────────────────────────────────────────────────
  static const Color darkBackground = Color(0xFF121212);
  static const Color darkSurface = Color(0xFF1E1E1E);
  static const Color darkSurfaceVariant = Color(0xFF2A2A2A);
  static const Color darkTextPrimary = Color(0xFFF5F0EB);
  static const Color darkTextSecondary = Color(0xFFC7B7A3);
  static const Color darkBorder = Color(0xFF3A3A3A);
  static const Color darkDivider = Color(0xFF2A2A2A);

  // ── Helper Methods ──────────────────────────────────────────────

  /// Returns the appropriate text color for a given background color
  /// using the WCAG contrast ratio algorithm.
  static Color textColorForBackground(Color background) {
    final luminance = background.computeLuminance();
    return luminance > 0.5 ? textPrimary : textOnPrimary;
  }

  /// Returns a status color based on a status string.
  static Color statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
      case 'compliant':
      case 'approved':
      case 'verified':
      case 'completed':
        return success;
      case 'pending':
      case 'draft':
        return pending;
      case 'in_review':
      case 'review':
      case 'processing':
        return inReview;
      case 'warning':
      case 'at_risk':
      case 'expiring':
        return warning;
      case 'danger':
      case 'non_compliant':
      case 'rejected':
      case 'failed':
      case 'overdue':
        return danger;
      case 'expired':
      case 'inactive':
        return expired;
      default:
        return muted;
    }
  }

  /// Returns a risk level color based on risk score (0-100).
  static Color riskColor(double score) {
    if (score <= 25) return riskLow;
    if (score <= 50) return riskMedium;
    if (score <= 75) return riskHigh;
    return riskCritical;
  }
}
