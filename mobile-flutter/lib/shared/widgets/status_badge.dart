import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Badge size
enum StatusBadgeSize {
  small,
  medium,
  large,
}

/// Generic status badge with configurable colors
class StatusBadge extends StatelessWidget {
  final String label;
  final Color? backgroundColor;
  final Color? textColor;
  final StatusBadgeSize size;
  final IconData? icon;
  final bool outlined;

  /// Convenience constructors for common statuses
  const StatusBadge({
    super.key,
    required this.label,
    this.backgroundColor,
    this.textColor,
    this.size = StatusBadgeSize.medium,
    this.icon,
    this.outlined = false,
  });

  const StatusBadge.success({
    super.key,
    required this.label,
    this.size = StatusBadgeSize.medium,
    this.icon,
    this.outlined = false,
  })  : backgroundColor = AppColors.success,
        textColor = AppColors.textOnPrimary;

  const StatusBadge.warning({
    super.key,
    required this.label,
    this.size = StatusBadgeSize.medium,
    this.icon,
    this.outlined = false,
  })  : backgroundColor = AppColors.warning,
        textColor = AppColors.textOnPrimary;

  const StatusBadge.danger({
    super.key,
    required this.label,
    this.size = StatusBadgeSize.medium,
    this.icon,
    this.outlined = false,
  })  : backgroundColor = AppColors.danger,
        textColor = AppColors.textOnPrimary;

  const StatusBadge.info({
    super.key,
    required this.label,
    this.size = StatusBadgeSize.medium,
    this.icon,
    this.outlined = false,
  })  : backgroundColor = AppColors.info,
        textColor = AppColors.textOnPrimary;

  const StatusBadge.primary({
    super.key,
    required this.label,
    this.size = StatusBadgeSize.medium,
    this.icon,
    this.outlined = false,
  })  : backgroundColor = AppColors.primary,
        textColor = AppColors.textOnPrimary;

  const StatusBadge.gold({
    super.key,
    required this.label,
    this.size = StatusBadgeSize.medium,
    this.icon,
    this.outlined = false,
  })  : backgroundColor = AppColors.gold,
        textColor = AppColors.textPrimary;

  EdgeInsetsGeometry _padding() {
    switch (size) {
      case StatusBadgeSize.small:
        return const EdgeInsets.symmetric(horizontal: 6, vertical: 2);
      case StatusBadgeSize.medium:
        return const EdgeInsets.symmetric(horizontal: 10, vertical: 4);
      case StatusBadgeSize.large:
        return const EdgeInsets.symmetric(horizontal: 14, vertical: 6);
    }
  }

  double _fontSize() {
    switch (size) {
      case StatusBadgeSize.small:
        return 9;
      case StatusBadgeSize.medium:
        return AppFontSize.sm;
      case StatusBadgeSize.large:
        return AppFontSize.base;
    }
  }

  double _iconSize() {
    switch (size) {
      case StatusBadgeSize.small:
        return 10;
      case StatusBadgeSize.medium:
        return 14;
      case StatusBadgeSize.large:
        return 18;
    }
  }

  double _borderRadius() {
    switch (size) {
      case StatusBadgeSize.small:
        return 4;
      case StatusBadgeSize.medium:
        return AppRadius.sm;
      case StatusBadgeSize.large:
        return AppRadius.md;
    }
  }

  /// Resolve color from status string
  static StatusBadge fromStatus(String status, {StatusBadgeSize size = StatusBadgeSize.medium, IconData? icon}) {
    final lower = status.toLowerCase();
    if (lower.contains('compliant') || lower.contains('verified') || lower.contains('approved') || lower.contains('active') || lower.contains('success') || lower.contains('completed') || lower.contains('delivered')) {
      return StatusBadge.success(label: status, size: size, icon: icon);
    }
    if (lower.contains('pending') || lower.contains('review') || lower.contains('warning') || lower.contains('in progress') || lower.contains('processing')) {
      return StatusBadge.warning(label: status, size: size, icon: icon);
    }
    if (lower.contains('rejected') || lower.contains('failed') || lower.contains('error') || lower.contains('expired') || lower.contains('non-compliant') || lower.contains('overdue')) {
      return StatusBadge.danger(label: status, size: size, icon: icon);
    }
    if (lower.contains('draft') || lower.contains('new') || lower.contains('info')) {
      return StatusBadge.info(label: status, size: size, icon: icon);
    }
    return StatusBadge.primary(label: status, size: size, icon: icon);
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = backgroundColor ?? AppColors.primary;
    final fgColor = textColor ?? AppColors.textOnPrimary;

    return Container(
      padding: _padding(),
      decoration: BoxDecoration(
        color: outlined ? Colors.transparent : bgColor,
        borderRadius: BorderRadius.circular(_borderRadius()),
        border: outlined
            ? Border.all(color: bgColor, width: 1)
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: _iconSize(), color: outlined ? bgColor : fgColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: _fontSize(),
              fontWeight: FontWeight.w700,
              color: outlined ? bgColor : fgColor,
            ),
          ),
        ],
      ),
    );
  }
}
