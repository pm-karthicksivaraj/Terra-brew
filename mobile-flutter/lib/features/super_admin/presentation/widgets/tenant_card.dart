import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/tenant_model.dart';

class TenantCard extends StatelessWidget {
  final TenantModel tenant;
  final VoidCallback? onTap;

  const TenantCard({
    super.key,
    required this.tenant,
    this.onTap,
  });

  Color get _planColor {
    switch (tenant.plan) {
      case SubscriptionPlan.starter:
        return AppColors.textSecondary;
      case SubscriptionPlan.professional:
        return AppColors.info;
      case SubscriptionPlan.enterprise:
        return AppColors.gold;
    }
  }

  Color get _statusColor {
    switch (tenant.subscriptionStatus) {
      case SubscriptionStatus.active:
        return AppColors.success;
      case SubscriptionStatus.trial:
        return AppColors.info;
      case SubscriptionStatus.suspended:
        return AppColors.warning;
      case SubscriptionStatus.cancelled:
        return AppColors.danger;
      case SubscriptionStatus.expired:
        return AppColors.textTertiary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: AppColors.borderLight),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              // Avatar
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    tenant.name.substring(0, 1).toUpperCase(),
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tenant.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Text(
                          tenant.slug,
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textTertiary,
                          ),
                        ),
                        if (tenant.country != null) ...[
                          const SizedBox(width: 8),
                          Icon(Icons.location_on_outlined,
                              size: 11, color: AppColors.textTertiary),
                          const SizedBox(width: 2),
                          Text(
                            tenant.country!,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textTertiary,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // Plan badge
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: _planColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      tenant.planLabel,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: _planColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Status indicator
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _statusColor,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        tenant.statusLabel,
                        style: TextStyle(
                          fontSize: 10,
                          color: _statusColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  // EUDR compliance
                  if (tenant.eudrCompliant) ...[
                    const SizedBox(height: 3),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified,
                            size: 10, color: AppColors.success),
                        const SizedBox(width: 2),
                        Text(
                          'EUDR',
                          style: TextStyle(
                            fontSize: 9,
                            color: AppColors.success,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
