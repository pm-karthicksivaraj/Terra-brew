import 'package:badges/badges.dart' as badges;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_theme.dart';

/// Notification count provider (global)
final notificationCountProvider = StateProvider<int>((ref) => 0);

/// Notification bell with badge count
class NotificationBell extends ConsumerWidget {
  final VoidCallback? onTap;
  final Color? iconColor;
  final double iconSize;

  const NotificationBell({
    super.key,
    this.onTap,
    this.iconColor,
    this.iconSize = 24,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(notificationCountProvider);

    return GestureDetector(
      onTap: onTap ??
          () {
            // Default: navigate to notifications
          },
      child: badges.Badge(
        position: badges.BadgePosition.topEnd(top: -2, end: -4),
        showBadge: count > 0,
        badgeContent: Text(
          count > 99 ? '99+' : '$count',
          style: const TextStyle(
            fontFamily: 'SpaceMono',
            fontSize: 9,
            color: AppColors.textOnPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        badgeStyle: badges.BadgeStyle(
          badgeColor: AppColors.danger,
          padding: const EdgeInsets.all(4),
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
        child: Icon(
          Icons.notifications_outlined,
          color: iconColor ?? AppColors.textSecondary,
          size: iconSize,
        ),
      ),
    );
  }
}
