import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Button variant enum
enum AppButtonVariant {
  primary,
  secondary,
  ghost,
  danger,
}

/// Button size enum
enum AppButtonSize {
  small,
  medium,
  large,
}

/// Custom TerraBrew button widget
class AppButton extends StatefulWidget {
  final String label;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool fullWidth;
  final IconData? icon;
  final IconData? trailingIcon;
  final bool disabled;

  const AppButton({
    super.key,
    required this.label,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.medium,
    this.onPressed,
    this.isLoading = false,
    this.fullWidth = false,
    this.icon,
    this.trailingIcon,
    this.disabled = false,
  });

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: AppDuration.fast,
      lowerBound: 0.95,
      upperBound: 1.0,
    );
    _scaleAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );
    _controller.value = 1.0;
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails _) => _controller.reverse();
  void _onTapUp(TapUpDetails _) => _controller.forward();
  void _onTapCancel() => _controller.forward();

  EdgeInsetsGeometry _padding() {
    switch (widget.size) {
      case AppButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 8);
      case AppButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 20, vertical: 12);
      case AppButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 28, vertical: 16);
    }
  }

  double _fontSize() {
    switch (widget.size) {
      case AppButtonSize.small:
        return AppFontSize.sm;
      case AppButtonSize.medium:
        return AppFontSize.base;
      case AppButtonSize.large:
        return AppFontSize.md;
    }
  }

  double _iconSize() {
    switch (widget.size) {
      case AppButtonSize.small:
        return 16;
      case AppButtonSize.medium:
        return 20;
      case AppButtonSize.large:
        return 24;
    }
  }

  double _borderRadius() {
    switch (widget.size) {
      case AppButtonSize.small:
        return AppRadius.sm;
      case AppButtonSize.medium:
        return AppRadius.md;
      case AppButtonSize.large:
        return AppRadius.lg;
    }
  }

  Color _backgroundColor() {
    if (widget.disabled || widget.isLoading) return AppColors.muted;
    switch (widget.variant) {
      case AppButtonVariant.primary:
        return AppColors.primary;
      case AppButtonVariant.secondary:
        return AppColors.background;
      case AppButtonVariant.ghost:
        return Colors.transparent;
      case AppButtonVariant.danger:
        return AppColors.danger;
    }
  }

  Color _textColor() {
    if (widget.disabled || widget.isLoading) return AppColors.textDisabled;
    switch (widget.variant) {
      case AppButtonVariant.primary:
        return AppColors.textOnPrimary;
      case AppButtonVariant.secondary:
        return AppColors.primary;
      case AppButtonVariant.ghost:
        return AppColors.primary;
      case AppButtonVariant.danger:
        return AppColors.textOnPrimary;
    }
  }

  Color _borderColor() {
    if (widget.disabled || widget.isLoading) return AppColors.muted;
    switch (widget.variant) {
      case AppButtonVariant.primary:
        return AppColors.primary;
      case AppButtonVariant.secondary:
        return AppColors.primary;
      case AppButtonVariant.ghost:
        return Colors.transparent;
      case AppButtonVariant.danger:
        return AppColors.danger;
    }
  }

  double _borderWidth() {
    switch (widget.variant) {
      case AppButtonVariant.secondary:
        return 1.5;
      default:
        return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDisabled = widget.disabled || widget.isLoading;

    return ScaleTransition(
      scale: _scaleAnimation,
      child: GestureDetector(
        onTapDown: isDisabled ? null : _onTapDown,
        onTapUp: isDisabled ? null : _onTapUp,
        onTapCancel: isDisabled ? null : _onTapCancel,
        onTap: isDisabled ? null : widget.onPressed,
        child: AnimatedContainer(
          duration: AppDuration.fast,
          padding: _padding(),
          decoration: BoxDecoration(
            color: _backgroundColor(),
            borderRadius: BorderRadius.circular(_borderRadius()),
            border: Border.all(
              color: _borderColor(),
              width: _borderWidth(),
            ),
          ),
          constraints: widget.fullWidth
              ? const BoxConstraints(minWidth: double.infinity)
              : null,
          child: Row(
            mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (widget.isLoading)
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: SizedBox(
                    width: _iconSize(),
                    height: _iconSize(),
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(_textColor()),
                    ),
                  ),
                )
              else if (widget.icon != null)
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: Icon(widget.icon, size: _iconSize(), color: _textColor()),
                ),
              Text(
                widget.label,
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: _fontSize(),
                  fontWeight: FontWeight.w700,
                  color: _textColor(),
                ),
              ),
              if (!widget.isLoading && widget.trailingIcon != null)
                Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: Icon(widget.trailingIcon, size: _iconSize(), color: _textColor()),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
