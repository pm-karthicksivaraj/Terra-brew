import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';

enum StatTrend { up, down, neutral }

class StatCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final StatTrend trend;
  final String? trendValue;
  final VoidCallback? onTap;
  final Color? accentColor;

  const StatCard({
    super.key,
    required this.icon,
    required this.title,
    required this.value,
    this.trend = StatTrend.neutral,
    this.trendValue,
    this.onTap,
    this.accentColor,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveAccent = accentColor ?? AppColors.primary;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(AppRadius.md),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: Stack(
            children: [
              // Accent bar at top
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Container(
                  height: 3,
                  color: effectiveAccent,
                ),
              ),

              // Content
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Icon and trend
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color:
                                effectiveAccent.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            icon,
                            color: effectiveAccent,
                            size: 18,
                          ),
                        ),
                        if (trendValue != null) _buildTrendBadge(),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Value
                    Text(
                      value,
                      style: TextStyle(
                        fontFamily: AppTypography.headingFamily,
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),

                    // Title
                    Text(
                      title,
                      style: TextStyle(
                        fontFamily: AppTypography.headingFamily,
                        fontSize: 10,
                        color: AppColors.textHint,
                        letterSpacing: 0.5,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTrendBadge() {
    Color trendColor;
    IconData trendIcon;

    switch (trend) {
      case StatTrend.up:
        trendColor = AppColors.success;
        trendIcon = Icons.trending_up;
        break;
      case StatTrend.down:
        trendColor = AppColors.danger;
        trendIcon = Icons.trending_down;
        break;
      case StatTrend.neutral:
        trendColor = AppColors.textHint;
        trendIcon = Icons.trending_flat;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: trendColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(trendIcon, color: trendColor, size: 12),
          const SizedBox(width: 2),
          Text(
            trendValue!,
            style: TextStyle(
              fontFamily: AppTypography.headingFamily,
              fontSize: 9,
              color: trendColor,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
