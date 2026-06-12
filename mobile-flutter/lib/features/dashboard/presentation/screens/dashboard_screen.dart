import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../auth/data/models/user_model.dart';
import '../../../auth/domain/providers/auth_provider.dart';
import '../widgets/quick_action_button.dart';
import '../widgets/recent_activity_item.dart';
import '../widgets/role_specific_section.dart';
import '../widgets/stat_card.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  bool _isRefreshing = false;

  Future<void> _handleRefresh() async {
    setState(() => _isRefreshing = true);
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() => _isRefreshing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final user = authState is AuthAuthenticated ? authState.user : null;

    if (user == null) {
      return const Scaffold(
        body: Center(child: Text('Not authenticated')),
      );
    }

    final role = UserRole.fromString(user.role);
    final statCards = RoleSpecificSection.getStatCards(user);
    final quickActions = RoleSpecificSection.getQuickActions(user);
    final activities = RoleSpecificSection.getRecentActivities(user);

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _handleRefresh,
          color: AppColors.primary,
          backgroundColor: AppColors.background,
          displacement: 40,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              // Top bar
              SliverToBoxAdapter(
                child: _buildTopBar(user, role),
              ),

              // Stat cards
              SliverToBoxAdapter(
                child: _buildStatCardsSection(statCards),
              ),

              // Quick actions
              SliverToBoxAdapter(
                child: _buildQuickActionsSection(quickActions),
              ),

              // Role-specific section
              SliverToBoxAdapter(
                child: _buildRoleSpecificSection(user, role),
              ),

              // Recent activity
              SliverToBoxAdapter(
                child: _buildRecentActivitySection(activities),
              ),

              // Bottom padding
              const SliverToBoxAdapter(
                child: SizedBox(height: 32),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar(UserModel user, UserRole role) {
    return Container(
      color: AppColors.primary,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      child: Column(
        children: [
          // Top row: greeting + actions
          Row(
            children: [
              // Avatar
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.background.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                    style: TextStyle(
                      fontFamily: AppTypography.headingFamily,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textOnPrimary,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Greeting
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _getGreeting(),
                      style: TextStyle(
                        fontFamily: AppTypography.headingFamily,
                        fontSize: 11,
                        color:
                            AppColors.textOnPrimary.withValues(alpha: 0.7),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      user.name,
                      style: TextStyle(
                        fontFamily: AppTypography.headingFamily,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textOnPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              // Notifications bell
              GestureDetector(
                onTap: () {
                  // TODO: Navigate to notifications
                },
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.background.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Stack(
                    children: [
                      Center(
                        child: Icon(
                          Icons.notifications_outlined,
                          color: AppColors.textOnPrimary,
                          size: 22,
                        ),
                      ),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: AppColors.gold,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppColors.primary,
                              width: 2,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 8),

              // Logout
              GestureDetector(
                onTap: () {
                  _showLogoutDialog();
                },
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.background.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: Icon(
                      Icons.logout,
                      color: AppColors.textOnPrimary,
                      size: 20,
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Tenant badge
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.background.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: AppColors.background.withValues(alpha: 0.15),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.business,
                  color: AppColors.gold,
                  size: 14,
                ),
                const SizedBox(width: 6),
                Text(
                  user.tenantName,
                  style: TextStyle(
                    fontFamily: AppTypography.headingFamily,
                    fontSize: 11,
                    color: AppColors.textOnPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.gold.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    role.displayName,
                    style: TextStyle(
                      fontFamily: AppTypography.headingFamily,
                      fontSize: 8,
                      color: AppColors.gold,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCardsSection(List<StatCardData> statCards) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Overview',
                style: TextStyle(
                  fontFamily: AppTypography.headingFamily,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              if (_isRefreshing)
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.primary,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.35,
            ),
            itemCount: statCards.length,
            itemBuilder: (context, index) {
              final stat = statCards[index];
              return StatCard(
                icon: stat.icon,
                title: stat.title,
                value: stat.value,
                trend: stat.trend,
                trendValue: stat.trendValue,
                onTap: () {
                  // TODO: Navigate to stat detail
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsSection(List<QuickActionData> actions) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Quick Actions',
            style: TextStyle(
              fontFamily: AppTypography.headingFamily,
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 76,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: actions.length,
              separatorBuilder: (_, _) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final action = actions[index];
                return SizedBox(
                  width: 88,
                  child: QuickActionButton(
                    icon: action.icon,
                    label: action.label,
                    onTap: () {
                      // TODO: Navigate to action screen
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleSpecificSection(UserModel user, UserRole role) {
    List<Widget> sections = [];

    if (role == UserRole.tenantAdmin || role == UserRole.superAdmin) {
      sections.add(_buildInfoCard(
        icon: Icons.admin_panel_settings,
        title: 'Admin Actions',
        color: AppColors.primary,
        items: [
          _InfoItem(
              label: 'User Management',
              subtitle: 'Manage team access & permissions'),
          _InfoItem(
              label: 'Tenant Settings',
              subtitle: 'Configure organization settings'),
          _InfoItem(
              label: 'EUDR Dashboard',
              subtitle: 'View compliance overview'),
        ],
      ));
    }

    if (role == UserRole.operationsManager) {
      sections.add(_buildInfoCard(
        icon: Icons.precision_manufacturing,
        title: 'Processing Pipeline',
        color: AppColors.success,
        items: [
          _InfoItem(
              label: 'Active Batches',
              subtitle: '23 batches in processing'),
          _InfoItem(
              label: 'Quality Queue',
              subtitle: '7 pending quality checks'),
          _InfoItem(
              label: 'Shipment Schedule',
              subtitle: '3 shipments this week'),
        ],
      ));
    }

    if (role == UserRole.fieldOfficer) {
      sections.add(_buildInfoCard(
        icon: Icons.explore,
        title: 'Field Operations',
        color: AppColors.info,
        items: [
          _InfoItem(
              label: 'Today\'s Visits',
              subtitle: '4 farm visits scheduled'),
          _InfoItem(
              label: 'Pending Registrations',
              subtitle: '6 farmers awaiting approval'),
          _InfoItem(
              label: 'Data Collection',
              subtitle: '12 forms to complete'),
        ],
      ));
    }

    if (role == UserRole.qualityController) {
      sections.add(_buildInfoCard(
        icon: Icons.verified_user,
        title: 'Compliance Center',
        color: const Color(0xFF6A1B9A),
        items: [
          _InfoItem(
              label: 'EUDR Compliance',
              subtitle: '94% overall compliance rate'),
          _InfoItem(
              label: 'Pending Inspections',
              subtitle: '7 scheduled this week'),
          _InfoItem(
              label: 'Lab Results',
              subtitle: '3 results pending review'),
        ],
      ));
    }

    if (role == UserRole.trader) {
      sections.add(_buildInfoCard(
        icon: Icons.trending_up,
        title: 'Trading Desk',
        color: AppColors.warning,
        items: [
          _InfoItem(
              label: 'Active Listings',
              subtitle: '18 coffee lots available'),
          _InfoItem(
              label: 'Price Alerts',
              subtitle: '2 new price alerts'),
          _InfoItem(
              label: 'Open Contracts',
              subtitle: '5 contracts in negotiation'),
        ],
      ));
    }

    if (role == UserRole.financeManager) {
      sections.add(_buildInfoCard(
        icon: Icons.account_balance,
        title: 'Financial Overview',
        color: const Color(0xFF00695C),
        items: [
          _InfoItem(
              label: 'Revenue This Month',
              subtitle: '\$284,000 (+14% MoM)'),
          _InfoItem(
              label: 'Pending Invoices',
              subtitle: '12 invoices totaling \$52K'),
          _InfoItem(
              label: 'Payment Processing',
              subtitle: '3 payments in transit'),
        ],
      ));
    }

    if (role == UserRole.buyer) {
      sections.add(_buildInfoCard(
        icon: Icons.storefront,
        title: 'Marketplace',
        color: AppColors.info,
        items: [
          _InfoItem(
              label: 'Available Lots',
              subtitle: '34 coffee lots listed'),
          _InfoItem(
              label: 'My Orders',
              subtitle: '8 active orders'),
          _InfoItem(
              label: 'EUDR Verified',
              subtitle: 'All lots compliance checked'),
        ],
      ));
    }

    if (sections.isEmpty) {
      sections.add(_buildInfoCard(
        icon: Icons.dashboard,
        title: 'Overview',
        color: AppColors.primary,
        items: [
          _InfoItem(
              label: 'Dashboard',
              subtitle: 'View platform statistics'),
          _InfoItem(
              label: 'Reports',
              subtitle: 'Access available reports'),
        ],
      ));
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: sections,
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required Color color,
    required List<_InfoItem> items,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppRadius.md),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: color.withValues(alpha: 0.06),
              child: Row(
                children: [
                  Icon(icon, color: color, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    title,
                    style: TextStyle(
                      fontFamily: AppTypography.headingFamily,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: color,
                    ),
                  ),
                ],
              ),
            ),

            // Items
            ...items.map((item) => _buildInfoItem(item)),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(_InfoItem item) {
    return InkWell(
      onTap: () {
        // TODO: Navigate to detail
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.label,
                    style: TextStyle(
                      fontFamily: AppTypography.headingFamily,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    item.subtitle,
                    style: TextStyle(
                      fontFamily: AppTypography.headingFamily,
                      fontSize: 10,
                      color: AppColors.textHint,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: AppColors.textHint,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivitySection(List<ActivityData> activities) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Activity',
                style: TextStyle(
                  fontFamily: AppTypography.headingFamily,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              GestureDetector(
                onTap: () {
                  // TODO: View all activity
                },
                child: Text(
                  'View All',
                  style: TextStyle(
                    fontFamily: AppTypography.headingFamily,
                    fontSize: 11,
                    color: AppColors.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...activities.map(
            (activity) => RecentActivityItem(
              icon: activity.icon,
              description: activity.description,
              timestamp: activity.timestamp,
              status: _mapActivityStatus(activity.status),
              onTap: () {
                // TODO: Navigate to activity detail
              },
            ),
          ),
        ],
      ),
    );
  }

  ActivityStatus _mapActivityStatus(ActivityStatus status) {
    return status; // Same enum type now since we import from same file
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        title: Text(
          'Sign Out',
          style: TextStyle(
            fontFamily: AppTypography.headingFamily,
            fontWeight: FontWeight.w700,
          ),
        ),
        content: Text(
          'Are you sure you want to sign out of TerraBrew Coffee?',
          style: TextStyle(
            fontFamily: AppTypography.headingFamily,
            fontSize: 13,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: TextStyle(
                fontFamily: AppTypography.headingFamily,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(authStateProvider.notifier).logout();
              context.go('/login');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: AppColors.textOnPrimary,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
            child: Text(
              'Sign Out',
              style: TextStyle(
                fontFamily: AppTypography.headingFamily,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Helper class for info items
class _InfoItem {
  final String label;
  final String subtitle;

  const _InfoItem({required this.label, required this.subtitle});
}
