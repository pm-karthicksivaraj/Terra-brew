import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Reusable scaffold with app bar, FAB, loading overlay support
class AppScaffold extends StatefulWidget {
  final String? title;
  final bool showBackButton;
  final List<Widget>? actions;
  final Widget? leading;
  final Widget body;
  final Widget? floatingActionButton;
  final FloatingActionButtonLocation? fabLocation;
  final bool isLoading;
  final Color? backgroundColor;
  final Widget? bottomNavigationBar;
  final Widget? drawer;
  final bool resizeToAvoidBottomInset;

  const AppScaffold({
    super.key,
    this.title,
    this.showBackButton = false,
    this.actions,
    this.leading,
    required this.body,
    this.floatingActionButton,
    this.fabLocation,
    this.isLoading = false,
    this.backgroundColor,
    this.bottomNavigationBar,
    this.drawer,
    this.resizeToAvoidBottomInset = true,
  });

  @override
  State<AppScaffold> createState() => _AppScaffoldState();
}

class _AppScaffoldState extends State<AppScaffold> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: widget.backgroundColor ?? AppColors.background,
      resizeToAvoidBottomInset: widget.resizeToAvoidBottomInset,
      appBar: widget.title != null
          ? AppBar(
              title: Text(widget.title!),
              leading: widget.leading ??
                  (widget.showBackButton
                      ? IconButton(
                          icon: const Icon(Icons.arrow_back_ios_new_rounded),
                          onPressed: () => Navigator.of(context).pop(),
                        )
                      : null),
              actions: widget.actions,
            )
          : null,
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.sm,
            ),
            child: widget.body,
          ),
          if (widget.isLoading) const _LoadingOverlay(),
        ],
      ),
      floatingActionButton: widget.floatingActionButton,
      floatingActionButtonLocation: widget.fabLocation,
      bottomNavigationBar: widget.bottomNavigationBar,
      drawer: widget.drawer,
    );
  }
}

/// Semi-transparent loading overlay
class _LoadingOverlay extends StatelessWidget {
  const _LoadingOverlay();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.overlay,
      child: Center(
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.xl),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(
                color: AppColors.primary,
                strokeWidth: 3,
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                'Loading...',
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: AppFontSize.base,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
