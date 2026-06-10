import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Card variant
enum AppCardVariant {
  elevated,
  flat,
}

/// Custom TerraBrew card widget
class AppCard extends StatefulWidget {
  final AppCardVariant variant;
  final Widget? header;
  final Widget? body;
  final Widget? footer;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? color;
  final double? borderRadius;

  const AppCard({
    super.key,
    this.variant = AppCardVariant.elevated,
    this.header,
    this.body,
    this.footer,
    this.onTap,
    this.padding,
    this.margin,
    this.color,
    this.borderRadius,
  });

  @override
  State<AppCard> createState() => _AppCardState();
}

class _AppCardState extends State<AppCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final borderRadius = widget.borderRadius ?? AppRadius.md;

    return GestureDetector(
      onTapDown: widget.onTap != null ? (_) => setState(() => _isPressed = true) : null,
      onTapUp: widget.onTap != null ? (_) => setState(() => _isPressed = false) : null,
      onTapCancel: widget.onTap != null ? () => setState(() => _isPressed = false) : null,
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: AppDuration.fast,
        margin: widget.margin ??
            const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.sm,
            ),
        padding: widget.padding ?? const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: widget.color ?? AppColors.background,
          borderRadius: BorderRadius.circular(borderRadius),
          border: Border.all(
            color: _isPressed
                ? AppColors.primary
                : widget.variant == AppCardVariant.elevated
                    ? AppColors.border
                    : Colors.transparent,
            width: _isPressed ? 1.5 : 0.5,
          ),
          boxShadow: widget.variant == AppCardVariant.elevated
              ? [
                  BoxShadow(
                    color: _isPressed ? AppColors.primary.withOpacity(0.1) : AppColors.overlay,
                    blurRadius: _isPressed ? 8 : 4,
                    offset: Offset(0, _isPressed ? 2 : 1),
                  ),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (widget.header != null) ...[
              DefaultTextStyle(
                style: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: AppFontSize.md,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
                child: widget.header!,
              ),
              if (widget.body != null || widget.footer != null)
                const Divider(height: AppSpacing.xl),
            ],
            if (widget.body != null)
              DefaultTextStyle(
                style: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: AppFontSize.base,
                  color: AppColors.textSecondary,
                ),
                child: widget.body!,
              ),
            if (widget.footer != null) ...[
              if (widget.header != null || widget.body != null)
                const Divider(height: AppSpacing.xl),
              DefaultTextStyle(
                style: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: AppFontSize.sm,
                  color: AppColors.textSecondary,
                ),
                child: widget.footer!,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
