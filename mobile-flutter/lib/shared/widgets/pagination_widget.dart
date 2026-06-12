import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Pagination state
class PaginationState<T> {
  final List<T> items;
  final bool isLoading;
  final bool hasMore;
  final String? error;
  final int currentPage;

  const PaginationState({
    this.items = const [],
    this.isLoading = false,
    this.hasMore = true,
    this.error,
    this.currentPage = 1,
  });

  PaginationState<T> copyWith({
    List<T>? items,
    bool? isLoading,
    bool? hasMore,
    String? error,
    int? currentPage,
  }) {
    return PaginationState<T>(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      hasMore: hasMore ?? this.hasMore,
      error: error ?? this.error,
      currentPage: currentPage ?? this.currentPage,
    );
  }
}

/// Infinite scroll pagination widget
class PaginationWidget<T> extends StatefulWidget {
  final List<T> items;
  final bool isLoading;
  final bool hasMore;
  final String? error;
  final Widget Function(BuildContext context, T item, int index) itemBuilder;
  final VoidCallback? onLoadMore;
  final VoidCallback? onRetry;
  final Widget? loadingIndicator;
  final ScrollController? scrollController;
  final EdgeInsetsGeometry? padding;
  final Widget Function(BuildContext context, int index)? separatorBuilder;
  final bool shrinkWrap;
  final ScrollPhysics? physics;

  const PaginationWidget({
    super.key,
    required this.items,
    this.isLoading = false,
    this.hasMore = true,
    this.error,
    required this.itemBuilder,
    this.onLoadMore,
    this.onRetry,
    this.loadingIndicator,
    this.scrollController,
    this.padding,
    this.separatorBuilder,
    this.shrinkWrap = false,
    this.physics,
  });

  @override
  State<PaginationWidget<T>> createState() => _PaginationWidgetState<T>();
}

class _PaginationWidgetState<T> extends State<PaginationWidget<T>> {
  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = widget.scrollController ?? ScrollController();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    if (widget.scrollController == null) {
      _scrollController.dispose();
    }
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;

    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;

    // Trigger load more when within 200px of bottom
    if (currentScroll >= maxScroll - 200 &&
        !widget.isLoading &&
        widget.hasMore &&
        widget.error == null) {
      widget.onLoadMore?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      padding: widget.padding ?? const EdgeInsets.only(bottom: 80),
      shrinkWrap: widget.shrinkWrap,
      physics: widget.physics,
      itemCount: widget.items.length + (_hasFooter ? 1 : 0),
      itemBuilder: (context, index) {
        if (index < widget.items.length) {
          return Column(
            children: [
              widget.itemBuilder(context, widget.items[index], index),
              if (widget.separatorBuilder != null)
                widget.separatorBuilder!(context, index),
            ],
          );
        }
        return _buildFooter();
      },
    );
  }

  bool get _hasFooter =>
      widget.isLoading || widget.error != null || !widget.hasMore;

  Widget _buildFooter() {
    if (widget.error != null) {
      return Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          children: [
            Text(
              widget.error!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: AppFontSize.sm,
                color: AppColors.danger,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            TextButton(
              onPressed: widget.onRetry,
              child: const Text(
                'Retry',
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: AppFontSize.sm,
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      );
    }

    if (widget.isLoading) {
      return widget.loadingIndicator ??
          Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Center(
              child: SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  color: AppColors.primary,
                  strokeWidth: 2,
                ),
              ),
            ),
          );
    }

    if (!widget.hasMore) {
      return Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Center(
          child: Text(
            'No more items',
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.sm,
              color: AppColors.muted,
            ),
          ),
        ),
      );
    }

    return const SizedBox.shrink();
  }
}
