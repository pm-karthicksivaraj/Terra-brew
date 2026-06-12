import 'package:flutter/material.dart';
import '../../data/models/eudr_compliance_model.dart';
import '../../../../core/theme/app_colors.dart';

class ComplianceStatusBadge extends StatelessWidget {
  final EudrStatus status;
  final double? fontSize;
  final bool showIcon;

  const ComplianceStatusBadge({
    super.key,
    required this.status,
    this.fontSize,
    this.showIcon = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _backgroundColor.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: _backgroundColor.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(_icon, size: 12, color: _backgroundColor),
            const SizedBox(width: 4),
          ],
          Text(
            status.label,
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: fontSize ?? 10,
              fontWeight: FontWeight.w700,
              color: _textColor,
            ),
          ),
        ],
      ),
    );
  }

  Color get _backgroundColor {
    switch (status) {
      case EudrStatus.pending:
        return AppColors.pending;
      case EudrStatus.inReview:
        return AppColors.inReview;
      case EudrStatus.compliant:
        return AppColors.compliant;
      case EudrStatus.nonCompliant:
        return AppColors.nonCompliant;
      case EudrStatus.expired:
        return AppColors.expired;
    }
  }

  Color get _textColor {
    switch (status) {
      case EudrStatus.pending:
        return const Color(0xFF997A00);
      case EudrStatus.inReview:
        return const Color(0xFF0077A3);
      case EudrStatus.compliant:
        return const Color(0xFF4D7A15);
      case EudrStatus.nonCompliant:
        return const Color(0xFF991F1F);
      case EudrStatus.expired:
        return const Color(0xFF8A7D6F);
    }
  }

  IconData get _icon {
    switch (status) {
      case EudrStatus.pending:
        return Icons.schedule;
      case EudrStatus.inReview:
        return Icons.visibility;
      case EudrStatus.compliant:
        return Icons.check_circle;
      case EudrStatus.nonCompliant:
        return Icons.cancel;
      case EudrStatus.expired:
        return Icons.event_busy;
    }
  }
}

class ComplianceStatusBadgeLarge extends StatelessWidget {
  final EudrStatus status;

  const ComplianceStatusBadgeLarge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: _backgroundColor.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: _backgroundColor.withValues(alpha: 0.3),
          width: 1.5,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_icon, size: 20, color: _backgroundColor),
          const SizedBox(width: 8),
          Text(
            status.label,
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: _textColor,
            ),
          ),
        ],
      ),
    );
  }

  Color get _backgroundColor {
    switch (status) {
      case EudrStatus.pending:
        return AppColors.pending;
      case EudrStatus.inReview:
        return AppColors.inReview;
      case EudrStatus.compliant:
        return AppColors.compliant;
      case EudrStatus.nonCompliant:
        return AppColors.nonCompliant;
      case EudrStatus.expired:
        return AppColors.expired;
    }
  }

  Color get _textColor {
    switch (status) {
      case EudrStatus.pending:
        return const Color(0xFF997A00);
      case EudrStatus.inReview:
        return const Color(0xFF0077A3);
      case EudrStatus.compliant:
        return const Color(0xFF4D7A15);
      case EudrStatus.nonCompliant:
        return const Color(0xFF991F1F);
      case EudrStatus.expired:
        return const Color(0xFF8A7D6F);
    }
  }

  IconData get _icon {
    switch (status) {
      case EudrStatus.pending:
        return Icons.schedule;
      case EudrStatus.inReview:
        return Icons.visibility;
      case EudrStatus.compliant:
        return Icons.check_circle;
      case EudrStatus.nonCompliant:
        return Icons.cancel;
      case EudrStatus.expired:
        return Icons.event_busy;
    }
  }
}
