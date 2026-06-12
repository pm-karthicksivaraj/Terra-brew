import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_theme.dart';

/// Text field variant
enum AppTextFieldVariant {
  standard,
  dropdown,
  datePicker,
  multiline,
}

/// Custom TerraBrew text field widget
class AppTextField extends StatefulWidget {
  final String? label;
  final String? hint;
  final String? errorText;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final TextInputType? keyboardType;
  final bool obscureText;
  final bool enabled;
  final bool readOnly;
  final int maxLines;
  final int? maxLength;
  final IconData? prefixIcon;
  final Widget? suffixIcon;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final void Function()? onTap;
  final VoidCallback? onEditingComplete;
  final AppTextFieldVariant variant;
  final List<DropdownMenuItem<String>>? dropdownItems;
  final String? dropdownValue;
  final void Function(String?)? onDropdownChanged;
  final DateTime? initialDate;
  final DateTime? firstDate;
  final DateTime? lastDate;
  final void Function(DateTime?)? onDateChanged;
  final TextInputAction? textInputAction;
  final TextCapitalization? textCapitalization;

  const AppTextField({
    super.key,
    this.label,
    this.hint,
    this.errorText,
    this.controller,
    this.focusNode,
    this.keyboardType,
    this.obscureText = false,
    this.enabled = true,
    this.readOnly = false,
    this.maxLines = 1,
    this.maxLength,
    this.prefixIcon,
    this.suffixIcon,
    this.validator,
    this.onChanged,
    this.onTap,
    this.onEditingComplete,
    this.variant = AppTextFieldVariant.standard,
    this.dropdownItems,
    this.dropdownValue,
    this.onDropdownChanged,
    this.initialDate,
    this.firstDate,
    this.lastDate,
    this.onDateChanged,
    this.textInputAction,
    this.textCapitalization,
  });

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  bool _isFocused = false;
  bool _obscureText = true;
  late FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_onFocusChange);
    _obscureText = widget.obscureText;
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  void _onFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: widget.initialDate ?? DateTime.now(),
      firstDate: widget.firstDate ?? DateTime(2000),
      lastDate: widget.lastDate ?? DateTime(2100),
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
    if (picked != null && widget.onDateChanged != null) {
      widget.onDateChanged!(picked);
      if (widget.controller != null) {
        widget.controller!.text = DateFormat('yyyy-MM-dd').format(picked);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    switch (widget.variant) {
      case AppTextFieldVariant.dropdown:
        return _buildDropdown();
      case AppTextFieldVariant.datePicker:
        return _buildDatePicker();
      case AppTextFieldVariant.multiline:
        return _buildTextField(maxLinesOverride: 4);
      case AppTextFieldVariant.standard:
        return _buildTextField();
    }
  }

  Widget _buildDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.base,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
        ],
        Container(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: _isFocused ? AppColors.primary : AppColors.border,
              width: _isFocused ? 1.5 : 1,
            ),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: widget.dropdownValue,
              items: widget.dropdownItems,
              onChanged: widget.enabled ? widget.onDropdownChanged : null,
              isExpanded: true,
              icon: const Icon(
                Icons.keyboard_arrow_down_rounded,
                color: AppColors.textSecondary,
              ),
              style: const TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: AppFontSize.base,
                color: AppColors.textPrimary,
              ),
              hint: widget.hint != null
                  ? Text(
                      widget.hint!,
                      style: const TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: AppFontSize.base,
                        color: AppColors.textDisabled,
                      ),
                    )
                  : null,
            ),
          ),
        ),
        if (widget.errorText != null) ...[
          const SizedBox(height: AppSpacing.xs),
          Text(
            widget.errorText!,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.sm,
              color: AppColors.danger,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildDatePicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.base,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
        ],
        GestureDetector(
          onTap: widget.enabled ? _selectDate : null,
          child: AbsorbPointer(
            child: _buildTextField(
              suffixIconOverride: const Icon(
                Icons.calendar_today_rounded,
                color: AppColors.textSecondary,
                size: 20,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({int? maxLinesOverride, Widget? suffixIconOverride}) {
    final effectiveMaxLines = maxLinesOverride ?? widget.maxLines;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null && widget.variant != AppTextFieldVariant.datePicker) ...[
          Text(
            widget.label!,
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.base,
              fontWeight: FontWeight.w600,
              color: _isFocused ? AppColors.primary : AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
        ],
        TextFormField(
          controller: widget.controller,
          focusNode: _focusNode,
          keyboardType: widget.keyboardType ??
              (widget.variant == AppTextFieldVariant.multiline
                  ? TextInputType.multiline
                  : null),
          obscureText: widget.obscureText ? _obscureText : false,
          enabled: widget.enabled,
          readOnly: widget.readOnly || widget.variant == AppTextFieldVariant.datePicker,
          maxLines: effectiveMaxLines,
          maxLength: widget.maxLength,
          validator: widget.validator,
          onChanged: widget.onChanged,
          onTap: widget.onTap,
          onEditingComplete: widget.onEditingComplete,
          textInputAction: widget.textInputAction,
          textCapitalization: widget.textCapitalization ?? TextCapitalization.none,
          style: const TextStyle(
            fontFamily: 'SpaceMono',
            fontSize: AppFontSize.base,
            color: AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            hintText: widget.hint,
            labelText: widget.variant == AppTextFieldVariant.datePicker ? widget.label : null,
            errorText: widget.errorText,
            prefixIcon: widget.prefixIcon != null
                ? Icon(widget.prefixIcon, color: AppColors.textSecondary, size: 20)
                : null,
            suffixIcon: suffixIconOverride ??
                widget.suffixIcon ??
                (widget.obscureText
                    ? GestureDetector(
                        onTap: () => setState(() => _obscureText = !_obscureText),
                        child: Icon(
                          _obscureText
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: AppColors.textSecondary,
                          size: 20,
                        ),
                      )
                    : null),
          ),
        ),
      ],
    );
  }
}
