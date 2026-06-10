import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;

import '../../../../core/theme/app_theme.dart';

enum ActivityStatus { success, warning, error, info, pending }

class RecentActivityItem extends StatelessWidget {
  final IconData icon;
  final String description;
  final DateTime timestamp;
  final ActivityStatus status;
  final VoidCallback? onTap;

  const RecentActivityItem({
    super.key,
    required this.icon,
    required this.description,
    required this.timestamp,
    this.status = ActivityStatus.info,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        margin: const EdgeInsets.only(bottom: 6),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(
            color: AppColors.border.withValues(alpha: 0.5),
          ),
        ),
        child: Row(
          children: [
            // Activity type icon with status color
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: _statusColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                icon,
                color: _statusColor,
                size: 16,
              ),
            ),

            const SizedBox(width: 12),

            // Description and time
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    description,
                    style: TextStyle(
                      fontFamily: AppTypography.headingFamily,
                      fontSize: 11,
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    timeago.format(timestamp),
                    style: TextStyle(
                      fontFamily: AppTypography.headingFamily,
                      fontSize: 9,
                      color: AppColors.textHint,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 8),

            // Status indicator dot
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: _statusColor,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color get _statusColor {
    switch (status) {
      case ActivityStatus.success:
        return AppColors.success;
      case ActivityStatus.warning:
        return AppColors.warning;
      case ActivityStatus.error:
        return AppColors.danger;
      case ActivityStatus.info:
        return AppColors.primary;
      case ActivityStatus.pending:
        return AppColors.textHint;
    }
  }
}
