import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Search bar with debounced callback, clear button, and optional filter
class SearchBarWidget extends StatefulWidget {
  final String? hint;
  final ValueChanged<String>? onSearch;
  final VoidCallback? onFilterTap;
  final bool showFilter;
  final Duration debounceDuration;

  const SearchBarWidget({
    super.key,
    this.hint,
    this.onSearch,
    this.onFilterTap,
    this.showFilter = false,
    this.debounceDuration = const Duration(milliseconds: 300),
  });

  @override
  State<SearchBarWidget> createState() => _SearchBarWidgetState();
}

class _SearchBarWidgetState extends State<SearchBarWidget> {
  final TextEditingController _controller = TextEditingController();
  Timer? _debounce;
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.removeListener(_onTextChanged);
    _controller.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    setState(() => _hasText = _controller.text.isNotEmpty);
    _debounce?.cancel();
    _debounce = Timer(widget.debounceDuration, () {
      widget.onSearch?.call(_controller.text);
    });
  }

  void _clearSearch() {
    _controller.clear();
    widget.onSearch?.call('');
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          const SizedBox(width: AppSpacing.md),
          Icon(
            Icons.search_rounded,
            color: AppColors.muted,
            size: 22,
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: TextField(
              controller: _controller,
              style: const TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: AppFontSize.base,
                color: AppColors.textPrimary,
              ),
              decoration: InputDecoration(
                hintText: widget.hint ?? 'Search...',
                hintStyle: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: AppFontSize.base,
                  color: AppColors.textDisabled,
                ),
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
              textInputAction: TextInputAction.search,
              onSubmitted: (value) => widget.onSearch?.call(value),
            ),
          ),
          if (_hasText)
            GestureDetector(
              onTap: _clearSearch,
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                child: Icon(
                  Icons.close_rounded,
                  color: AppColors.textSecondary,
                  size: 20,
                ),
              ),
            )
          else
            const SizedBox(width: AppSpacing.sm),
          if (widget.showFilter) ...[
            Container(
              width: 1,
              height: 24,
              color: AppColors.border,
            ),
            GestureDetector(
              onTap: widget.onFilterTap,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Icon(
                  Icons.tune_rounded,
                  color: AppColors.primary,
                  size: 22,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
