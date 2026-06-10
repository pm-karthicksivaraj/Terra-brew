import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import 'app_button.dart';
import 'app_chip.dart';

/// Filter option model
class FilterOption {
  final String id;
  final String label;
  final AppChipColor? chipColor;

  const FilterOption({
    required this.id,
    required this.label,
    this.chipColor,
  });
}

/// Filter group model
class FilterGroup {
  final String title;
  final List<FilterOption> options;
  final bool multiSelect;

  const FilterGroup({
    required this.title,
    required this.options,
    this.multiSelect = true,
  });
}

/// Date range model
class DateRange {
  final DateTime? start;
  final DateTime? end;

  const DateRange({this.start, this.end});
}

/// Filter bottom sheet with dynamic filter options
class FilterBottomSheet extends StatefulWidget {
  final List<FilterGroup> filterGroups;
  final Map<String, Set<String>> selectedFilters;
  final DateRange? dateRange;
  final ValueChanged<Map<String, Set<String>>> onApply;
  final VoidCallback? onReset;
  final bool showDateRange;

  const FilterBottomSheet({
    super.key,
    required this.filterGroups,
    this.selectedFilters = const {},
    this.dateRange,
    required this.onApply,
    this.onReset,
    this.showDateRange = true,
  });

  /// Show filter bottom sheet
  static Future<void> show({
    required BuildContext context,
    required List<FilterGroup> filterGroups,
    Map<String, Set<String>> selectedFilters = const {},
    DateRange? dateRange,
    required ValueChanged<Map<String, Set<String>>> onApply,
    VoidCallback? onReset,
    bool showDateRange = true,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        builder: (context, scrollController) => FilterBottomSheet(
          filterGroups: filterGroups,
          selectedFilters: selectedFilters,
          dateRange: dateRange,
          onApply: onApply,
          onReset: onReset,
          showDateRange: showDateRange,
        ),
      ),
    );
  }

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  late Map<String, Set<String>> _selectedFilters;
  DateTime? _startDate;
  DateTime? _endDate;

  @override
  void initState() {
    super.initState();
    _selectedFilters = Map.fromEntries(
      widget.selectedFilters.entries.map(
        (e) => MapEntry(e.key, Set<String>.from(e.value)),
      ),
    );
    _startDate = widget.dateRange?.start;
    _endDate = widget.dateRange?.end;
  }

  void _toggleFilter(String groupTitle, String optionId) {
    setState(() {
      final group = widget.filterGroups.firstWhere((g) => g.title == groupTitle);
      final current = _selectedFilters[groupTitle] ?? {};

      if (current.contains(optionId)) {
        current.remove(optionId);
      } else {
        if (!group.multiSelect) {
          current.clear();
        }
        current.add(optionId);
      }

      _selectedFilters[groupTitle] = current;
    });
  }

  Future<void> _selectDateRange() async {
    final range = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
      initialDateRange: _startDate != null && _endDate != null
          ? DateTimeRange(start: _startDate!, end: _endDate!)
          : null,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: AppColors.textOnPrimary,
              surface: AppColors.surface,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );

    if (range != null) {
      setState(() {
        _startDate = range.start;
        _endDate = range.end;
      });
    }
  }

  void _reset() {
    setState(() {
      _selectedFilters.clear();
      _startDate = null;
      _endDate = null;
    });
    widget.onReset?.call();
  }

  void _apply() {
    widget.onApply(_selectedFilters);
    Navigator.of(context).pop();
  }

  int get _activeFilterCount {
    int count = 0;
    for (final filters in _selectedFilters.values) {
      count += filters.length;
    }
    if (_startDate != null && _endDate != null) count++;
    return count;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppRadius.xl),
        ),
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.muted,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Row(
              children: [
                const Text(
                  'Filters',
                  style: TextStyle(
                    fontFamily: 'SpaceMono',
                    fontSize: AppFontSize.lg,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                if (_activeFilterCount > 0)
                  TextButton(
                    onPressed: _reset,
                    child: const Text(
                      'Reset All',
                      style: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: AppFontSize.sm,
                        color: AppColors.danger,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          // Filter content
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              children: [
                // Date range
                if (widget.showDateRange) ...[
                  const Text(
                    'Date Range',
                    style: TextStyle(
                      fontFamily: 'SpaceMono',
                      fontSize: AppFontSize.base,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  GestureDetector(
                    onTap: _selectDateRange,
                    child: Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.date_range_rounded,
                            color: AppColors.primary,
                            size: 20,
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Text(
                            _startDate != null && _endDate != null
                                ? '${_formatDate(_startDate!)} - ${_formatDate(_endDate!)}'
                                : 'Select date range',
                            style: TextStyle(
                              fontFamily: 'SpaceMono',
                              fontSize: AppFontSize.base,
                              color: _startDate != null
                                  ? AppColors.textPrimary
                                  : AppColors.textDisabled,
                            ),
                          ),
                          const Spacer(),
                          const Icon(
                            Icons.chevron_right_rounded,
                            color: AppColors.muted,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                ],
                // Filter groups
                ...widget.filterGroups.map((group) => _buildFilterGroup(group)),
              ],
            ),
          ),
          // Bottom actions
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: 'Reset',
                      variant: AppButtonVariant.secondary,
                      onPressed: _reset,
                      fullWidth: true,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: AppButton(
                      label: 'Apply${_activeFilterCount > 0 ? ' ($_activeFilterCount)' : ''}',
                      variant: AppButtonVariant.primary,
                      onPressed: _apply,
                      fullWidth: true,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterGroup(FilterGroup group) {
    final selected = _selectedFilters[group.title] ?? {};

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            group.title,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.base,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: group.options.map((option) {
              final isSelected = selected.contains(option.id);
              return AppChip(
                label: option.label,
                selected: isSelected,
                color: option.chipColor ?? AppChipColor.primary,
                showCheckmark: true,
                onSelected: () => _toggleFilter(group.title, option.id),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}
