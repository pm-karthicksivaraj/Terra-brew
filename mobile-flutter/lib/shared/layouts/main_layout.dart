import 'package:badges/badges.dart' as badges;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_theme.dart';
import '../widgets/notification_bell.dart';

/// Bottom navigation tab definition
class NavTab {
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String route;
  final String requiredPermission;
  final int? badgeCount;

  const NavTab({
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.route,
    required this.requiredPermission,
    this.badgeCount,
  });
}

/// Tab visibility provider - filters tabs by user RBAC
final visibleTabsProvider = Provider<List<NavTab>>((ref) {
  final auth = ref.watch(authProvider);
  final allTabs = [
    NavTab(
      label: 'Home',
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
      route: '/dashboard',
      requiredPermission: 'dashboard',
      badgeCount: 0,
    ),
    NavTab(
      label: 'EUDR',
      icon: Icons.eco_outlined,
      activeIcon: Icons.eco_rounded,
      route: '/eudr',
      requiredPermission: 'eudr-compliance',
      badgeCount: 3,
    ),
    NavTab(
      label: 'Map',
      icon: Icons.map_outlined,
      activeIcon: Icons.map_rounded,
      route: '/map',
      requiredPermission: 'farmlands',
      badgeCount: 0,
    ),
    NavTab(
      label: 'Trade',
      icon: Icons.trending_up_outlined,
      activeIcon: Icons.trending_up_rounded,
      route: '/trading',
      requiredPermission: 'trading-desk',
      badgeCount: 5,
    ),
    NavTab(
      label: 'Profile',
      icon: Icons.person_outline_rounded,
      activeIcon: Icons.person_rounded,
      route: '/profile',
      requiredPermission: 'dashboard',
      badgeCount: 2,
    ),
  ];

  return allTabs.where((tab) {
    // Super admin sees all tabs
    if (auth.isSuperAdmin) return true;
    return auth.hasPermission(tab.requiredPermission);
  }).toList();
});

/// Main layout with bottom navigation shell
class MainLayout extends ConsumerStatefulWidget {
  final Widget child;
  final int currentIndex;

  const MainLayout({
    super.key,
    required this.child,
    required this.currentIndex,
  });

  @override
  ConsumerState<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends ConsumerState<MainLayout>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: AppDuration.normal,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant MainLayout oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentIndex != widget.currentIndex) {
      _animationController.reset();
      _animationController.forward();
    }
  }

  @override
  Widget build(BuildContext context) {
    final visibleTabs = ref.watch(visibleTabsProvider);
    final notifCount = ref.watch(notificationCountProvider);

    // Map currentIndex to the visible tabs
    final effectiveIndex = widget.currentIndex.clamp(0, visibleTabs.length - 1);

    return Scaffold(
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: widget.child,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.background,
          boxShadow: [
            BoxShadow(
              color: AppColors.overlay,
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: AppSpacing.xs,
            ),
            child: BottomNavigationBar(
              currentIndex: effectiveIndex,
              onTap: (index) {
                if (index != effectiveIndex && index < visibleTabs.length) {
                  context.go(visibleTabs[index].route);
                }
              },
              items: visibleTabs.map((tab) {
                final badgeCount = tab.label == 'Profile' ? notifCount : tab.badgeCount ?? 0;
                return BottomNavigationBarItem(
                  icon: _TabIcon(
                    icon: tab.icon,
                    badgeCount: badgeCount,
                  ),
                  activeIcon: _TabIcon(
                    icon: tab.activeIcon,
                    badgeCount: badgeCount,
                    isActive: true,
                  ),
                  label: tab.label,
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

/// Animated tab icon with badge
class _TabIcon extends StatelessWidget {
  final IconData icon;
  final int badgeCount;
  final bool isActive;

  const _TabIcon({
    required this.icon,
    this.badgeCount = 0,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    final iconWidget = Icon(
      icon,
      size: 24,
      color: isActive ? AppColors.primary : AppColors.muted,
    );

    if (badgeCount > 0) {
      return badges.Badge(
        position: badges.BadgePosition.topEnd(top: -4, end: -6),
        badgeContent: Text(
          badgeCount > 99 ? '99+' : '$badgeCount',
          style: const TextStyle(
            fontFamily: 'SpaceMono',
            fontSize: 9,
            color: AppColors.textOnPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        badgeStyle: badges.BadgeStyle(
          badgeColor: AppColors.danger,
          padding: const EdgeInsets.all(3),
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
        child: iconWidget,
      );
    }

    return iconWidget;
  }
}
