import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Chip color variant
enum AppChipColor {
  primary,
  success,
  warning,
  danger,
  info,
  gold,
}

/// Custom TerraBrew chip widget - for filters & status display
class AppChip extends StatelessWidget {
  final String label;
  final bool selected;
  final AppChipColor color;
  final IconData? icon;
  final VoidCallback? onSelected;
  final bool showCheckmark;
  final bool disabled;

  const AppChip({
    super.key,
    required this.label,
    this.selected = false,
    this.color = AppChipColor.primary,
    this.icon,
    this.onSelected,
    this.showCheckmark = false,
    this.disabled = false,
  });

  Color _backgroundColor() {
    if (disabled) return AppColors.surfaceVariant;
    if (selected) return _primaryColor();
    return AppColors.surface;
  }

  Color _primaryColor() {
    switch (color) {
      case AppChipColor.primary:
        return AppColors.primary;
      case AppChipColor.success:
        return AppColors.success;
      case AppChipColor.warning:
        return AppColors.warning;
      case AppChipColor.danger:
        return AppColors.danger;
      case AppChipColor.info:
        return AppColors.info;
      case AppChipColor.gold:
        return AppColors.gold;
    }
  }

  Color _textColor() {
    if (disabled) return AppColors.textDisabled;
    if (selected) return AppColors.textOnPrimary;
    return AppColors.textSecondary;
  }

  Color _borderColor() {
    if (disabled) return AppColors.border;
    if (selected) return _primaryColor();
    return AppColors.border;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: disabled ? null : onSelected,
      child: AnimatedContainer(
        duration: AppDuration.fast,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: _backgroundColor(),
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: _borderColor(), width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (showCheckmark && selected) ...[
              Icon(
                Icons.check_rounded,
                size: 14,
                color: _textColor(),
              ),
              const SizedBox(width: AppSpacing.xs),
            ] else if (icon != null) ...[
              Icon(
                icon,
                size: 14,
                color: _textColor(),
              ),
              const SizedBox(width: AppSpacing.xs),
            ],
            Text(
              label,
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: AppFontSize.sm,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: _textColor(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
