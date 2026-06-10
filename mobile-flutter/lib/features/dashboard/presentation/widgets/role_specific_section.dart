import 'package:flutter/material.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../auth/data/models/user_model.dart';
import 'recent_activity_item.dart';
import 'stat_card.dart' show StatTrend;

class RoleSpecificSection extends StatelessWidget {
  final UserModel user;
  final Widget child;

  const RoleSpecificSection({
    super.key,
    required this.user,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return child;
  }

  /// Build role-specific content based on user role
  static Widget buildForRole({
    required UserModel user,
    required Map<UserRole, Widget> builders,
    Widget? fallback,
  }) {
    final role = UserRole.fromString(user.role);
    return builders[role] ?? fallback ?? const SizedBox.shrink();
  }

  /// Check if user has any of the given roles
  static bool hasRole(UserModel user, List<UserRole> roles) {
    final role = UserRole.fromString(user.role);
    return roles.contains(role);
  }

  /// Build role-specific quick actions
  static List<QuickActionData> getQuickActions(UserModel user) {
    final role = UserRole.fromString(user.role);

    switch (role) {
      case UserRole.superAdmin:
        return [
          QuickActionData(icon: Icons.business, label: 'Tenants'),
          QuickActionData(icon: Icons.people, label: 'Users'),
          QuickActionData(icon: Icons.analytics, label: 'Analytics'),
          QuickActionData(icon: Icons.settings, label: 'Settings'),
        ];
      case UserRole.tenantAdmin:
        return [
          QuickActionData(icon: Icons.people, label: 'Users'),
          QuickActionData(icon: Icons.agriculture, label: 'Farmers'),
          QuickActionData(icon: Icons.map, label: 'Farmlands'),
          QuickActionData(icon: Icons.verified, label: 'EUDR'),
          QuickActionData(icon: Icons.bar_chart, label: 'Reports'),
          QuickActionData(icon: Icons.inventory, label: 'Inventory'),
        ];
      case UserRole.operationsManager:
        return [
          QuickActionData(icon: Icons.agriculture, label: 'Farms'),
          QuickActionData(
              icon: Icons.precision_manufacturing, label: 'Processing'),
          QuickActionData(icon: Icons.local_shipping, label: 'Shipments'),
          QuickActionData(icon: Icons.task, label: 'Tasks'),
        ];
      case UserRole.fieldOfficer:
        return [
          QuickActionData(icon: Icons.person_add, label: 'Register'),
          QuickActionData(icon: Icons.edit_note, label: 'Field Data'),
          QuickActionData(icon: Icons.qr_code_scanner, label: 'Scan QR'),
          QuickActionData(icon: Icons.map, label: 'Visit Map'),
        ];
      case UserRole.qualityController:
        return [
          QuickActionData(icon: Icons.fact_check, label: 'Inspections'),
          QuickActionData(icon: Icons.verified, label: 'EUDR Check'),
          QuickActionData(icon: Icons.science, label: 'Lab Results'),
          QuickActionData(icon: Icons.assignment, label: 'Certificates'),
        ];
      case UserRole.trader:
        return [
          QuickActionData(icon: Icons.storefront, label: 'Marketplace'),
          QuickActionData(icon: Icons.swap_horiz, label: 'Trade Desk'),
          QuickActionData(icon: Icons.receipt_long, label: 'Contracts'),
          QuickActionData(icon: Icons.trending_up, label: 'Prices'),
        ];
      case UserRole.financeManager:
        return [
          QuickActionData(icon: Icons.payment, label: 'Billing'),
          QuickActionData(icon: Icons.account_balance, label: 'Accounts'),
          QuickActionData(icon: Icons.receipt, label: 'Invoices'),
          QuickActionData(icon: Icons.assessment, label: 'Reports'),
        ];
      case UserRole.buyer:
        return [
          QuickActionData(icon: Icons.storefront, label: 'Marketplace'),
          QuickActionData(icon: Icons.shopping_cart, label: 'Orders'),
          QuickActionData(icon: Icons.receipt_long, label: 'Contracts'),
          QuickActionData(icon: Icons.local_shipping, label: 'Shipments'),
        ];
      case UserRole.viewer:
        return [
          QuickActionData(icon: Icons.dashboard, label: 'Overview'),
          QuickActionData(icon: Icons.map, label: 'Map View'),
          QuickActionData(icon: Icons.bar_chart, label: 'Reports'),
        ];
    }
  }

  /// Build role-specific stat cards
  static List<StatCardData> getStatCards(UserModel user) {
    final role = UserRole.fromString(user.role);

    switch (role) {
      case UserRole.superAdmin:
        return [
          StatCardData(
              icon: Icons.business,
              title: 'TENANTS',
              value: '24',
              trend: StatTrend.up,
              trendValue: '+3'),
          StatCardData(
              icon: Icons.people,
              title: 'TOTAL USERS',
              value: '1,847',
              trend: StatTrend.up,
              trendValue: '+12%'),
          StatCardData(
              icon: Icons.agriculture,
              title: 'FARMERS',
              value: '12.4K',
              trend: StatTrend.up,
              trendValue: '+8%'),
          StatCardData(
              icon: Icons.verified,
              title: 'EUDR COMPLIANCE',
              value: '87%',
              trend: StatTrend.up,
              trendValue: '+2%'),
        ];
      case UserRole.tenantAdmin:
        return [
          StatCardData(
              icon: Icons.people,
              title: 'FARMERS',
              value: '342',
              trend: StatTrend.up,
              trendValue: '+15'),
          StatCardData(
              icon: Icons.map,
              title: 'FARMLANDS',
              value: '891',
              trend: StatTrend.up,
              trendValue: '+24'),
          StatCardData(
              icon: Icons.verified,
              title: 'EUDR COMPLIANCE',
              value: '92%',
              trend: StatTrend.up,
              trendValue: '+3%'),
          StatCardData(
              icon: Icons.star,
              title: 'TRUST SCORE',
              value: '4.8',
              trend: StatTrend.up,
              trendValue: '+0.2'),
        ];
      case UserRole.operationsManager:
        return [
          StatCardData(
              icon: Icons.agriculture,
              title: 'ACTIVE FARMS',
              value: '156',
              trend: StatTrend.up,
              trendValue: '+8'),
          StatCardData(
              icon: Icons.precision_manufacturing,
              title: 'PROCESSING',
              value: '23',
              trend: StatTrend.neutral,
              trendValue: '0'),
          StatCardData(
              icon: Icons.local_shipping,
              title: 'IN TRANSIT',
              value: '41',
              trend: StatTrend.up,
              trendValue: '+5'),
          StatCardData(
              icon: Icons.task,
              title: 'PENDING TASKS',
              value: '18',
              trend: StatTrend.down,
              trendValue: '-3'),
        ];
      case UserRole.fieldOfficer:
        return [
          StatCardData(
              icon: Icons.person_add,
              title: 'REGISTERED',
              value: '67',
              trend: StatTrend.up,
              trendValue: '+12'),
          StatCardData(
              icon: Icons.map,
              title: 'FARMLANDS',
              value: '134',
              trend: StatTrend.up,
              trendValue: '+8'),
          StatCardData(
              icon: Icons.edit_note,
              title: 'FIELD REPORTS',
              value: '89',
              trend: StatTrend.up,
              trendValue: '+15'),
          StatCardData(
              icon: Icons.check_circle,
              title: 'COMPLETED',
              value: '54',
              trend: StatTrend.up,
              trendValue: '+7'),
        ];
      case UserRole.qualityController:
        return [
          StatCardData(
              icon: Icons.fact_check,
              title: 'INSPECTIONS',
              value: '28',
              trend: StatTrend.up,
              trendValue: '+4'),
          StatCardData(
              icon: Icons.verified,
              title: 'EUDR COMPLIANT',
              value: '94%',
              trend: StatTrend.up,
              trendValue: '+1%'),
          StatCardData(
              icon: Icons.science,
              title: 'LAB PENDING',
              value: '7',
              trend: StatTrend.down,
              trendValue: '-2'),
          StatCardData(
              icon: Icons.assignment,
              title: 'CERTIFICATES',
              value: '156',
              trend: StatTrend.up,
              trendValue: '+8'),
        ];
      case UserRole.trader:
        return [
          StatCardData(
              icon: Icons.swap_horiz,
              title: 'ACTIVE TRADES',
              value: '12',
              trend: StatTrend.up,
              trendValue: '+3'),
          StatCardData(
              icon: Icons.trending_up,
              title: 'COFFEE PRICE',
              value: '\$4.23',
              trend: StatTrend.up,
              trendValue: '+2.1%'),
          StatCardData(
              icon: Icons.receipt_long,
              title: 'CONTRACTS',
              value: '34',
              trend: StatTrend.up,
              trendValue: '+5'),
          StatCardData(
              icon: Icons.local_shipping,
              title: 'IN TRANSIT',
              value: '8',
              trend: StatTrend.neutral,
              trendValue: '0'),
        ];
      case UserRole.financeManager:
        return [
          StatCardData(
              icon: Icons.payment,
              title: 'REVENUE',
              value: '\$284K',
              trend: StatTrend.up,
              trendValue: '+14%'),
          StatCardData(
              icon: Icons.receipt,
              title: 'INVOICES',
              value: '47',
              trend: StatTrend.up,
              trendValue: '+8'),
          StatCardData(
              icon: Icons.account_balance,
              title: 'OUTSTANDING',
              value: '\$52K',
              trend: StatTrend.down,
              trendValue: '-6%'),
          StatCardData(
              icon: Icons.assessment,
              title: 'MARGIN',
              value: '18.3%',
              trend: StatTrend.up,
              trendValue: '+1.2%'),
        ];
      case UserRole.buyer:
        return [
          StatCardData(
              icon: Icons.shopping_cart,
              title: 'ORDERS',
              value: '8',
              trend: StatTrend.up,
              trendValue: '+2'),
          StatCardData(
              icon: Icons.local_shipping,
              title: 'IN TRANSIT',
              value: '3',
              trend: StatTrend.neutral,
              trendValue: '0'),
          StatCardData(
              icon: Icons.receipt_long,
              title: 'CONTRACTS',
              value: '12',
              trend: StatTrend.up,
              trendValue: '+1'),
          StatCardData(
              icon: Icons.star,
              title: 'TRUST SCORE',
              value: '4.6',
              trend: StatTrend.up,
              trendValue: '+0.1'),
        ];
      case UserRole.viewer:
        return [
          StatCardData(
              icon: Icons.people,
              title: 'FARMERS',
              value: '342',
              trend: StatTrend.up,
              trendValue: '+15'),
          StatCardData(
              icon: Icons.map,
              title: 'FARMLANDS',
              value: '891',
              trend: StatTrend.up,
              trendValue: '+24'),
          StatCardData(
              icon: Icons.verified,
              title: 'EUDR COMPLIANCE',
              value: '92%',
              trend: StatTrend.up,
              trendValue: '+3%'),
        ];
    }
  }

  /// Build role-specific recent activities
  static List<ActivityData> getRecentActivities(UserModel user) {
    final role = UserRole.fromString(user.role);
    final now = DateTime.now();

    switch (role) {
      case UserRole.superAdmin:
        return [
          ActivityData(
              icon: Icons.business,
              description: 'New tenant "Highland Coffee" registered',
              timestamp: now.subtract(const Duration(minutes: 12)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.people,
              description: 'User john@coffee.co added to platform',
              timestamp: now.subtract(const Duration(hours: 1)),
              status: ActivityStatus.info),
          ActivityData(
              icon: Icons.warning,
              description: 'Tenant "BeanCo" subscription expiring',
              timestamp: now.subtract(const Duration(hours: 3)),
              status: ActivityStatus.warning),
          ActivityData(
              icon: Icons.analytics,
              description: 'Monthly platform report generated',
              timestamp: now.subtract(const Duration(hours: 6)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.security,
              description: 'Security audit completed successfully',
              timestamp: now.subtract(const Duration(days: 1)),
              status: ActivityStatus.success),
        ];
      case UserRole.tenantAdmin:
        return [
          ActivityData(
              icon: Icons.person_add,
              description: 'Farmer Jane Wanjiku registered',
              timestamp: now.subtract(const Duration(minutes: 25)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.verified,
              description: 'EUDR batch #1847 compliance verified',
              timestamp: now.subtract(const Duration(hours: 1)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.map,
              description: 'New farmland mapped in Nyeri region',
              timestamp: now.subtract(const Duration(hours: 2)),
              status: ActivityStatus.info),
          ActivityData(
              icon: Icons.warning,
              description: '3 farmers pending document verification',
              timestamp: now.subtract(const Duration(hours: 5)),
              status: ActivityStatus.warning),
          ActivityData(
              icon: Icons.people,
              description: 'New field officer added: Peter Mwangi',
              timestamp: now.subtract(const Duration(days: 1)),
              status: ActivityStatus.info),
        ];
      case UserRole.operationsManager:
        return [
          ActivityData(
              icon: Icons.precision_manufacturing,
              description: 'Batch #92 processing completed',
              timestamp: now.subtract(const Duration(minutes: 45)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.local_shipping,
              description: 'Shipment SH-4521 dispatched',
              timestamp: now.subtract(const Duration(hours: 1)),
              status: ActivityStatus.info),
          ActivityData(
              icon: Icons.agriculture,
              description: 'Farm inspection scheduled for tomorrow',
              timestamp: now.subtract(const Duration(hours: 3)),
              status: ActivityStatus.pending),
          ActivityData(
              icon: Icons.task,
              description: 'Quality check task assigned to Grace',
              timestamp: now.subtract(const Duration(hours: 5)),
              status: ActivityStatus.info),
        ];
      case UserRole.fieldOfficer:
        return [
          ActivityData(
              icon: Icons.person_add,
              description: 'Farmer Samuel Ochieng registered',
              timestamp: now.subtract(const Duration(minutes: 30)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.edit_note,
              description: 'Field data submitted for plot #247',
              timestamp: now.subtract(const Duration(hours: 1)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.qr_code_scanner,
              description: 'QR scan: Farmland NY-089 verified',
              timestamp: now.subtract(const Duration(hours: 2)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.map,
              description: '3 farm visits completed today',
              timestamp: now.subtract(const Duration(hours: 4)),
              status: ActivityStatus.info),
        ];
      case UserRole.qualityController:
        return [
          ActivityData(
              icon: Icons.fact_check,
              description: 'Inspection #QC-412 completed',
              timestamp: now.subtract(const Duration(minutes: 20)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.verified,
              description: 'EUDR compliance batch #1847 approved',
              timestamp: now.subtract(const Duration(hours: 1)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.science,
              description: 'Lab results pending for sample #892',
              timestamp: now.subtract(const Duration(hours: 3)),
              status: ActivityStatus.pending),
          ActivityData(
              icon: Icons.warning,
              description: 'Non-compliance alert: Farm KR-045',
              timestamp: now.subtract(const Duration(hours: 5)),
              status: ActivityStatus.warning),
        ];
      case UserRole.trader:
        return [
          ActivityData(
              icon: Icons.swap_horiz,
              description: 'Trade executed: 500 bags AA grade',
              timestamp: now.subtract(const Duration(minutes: 15)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.trending_up,
              description: 'Coffee price up 2.1% this week',
              timestamp: now.subtract(const Duration(hours: 1)),
              status: ActivityStatus.info),
          ActivityData(
              icon: Icons.receipt_long,
              description: 'Contract #CT-892 signed',
              timestamp: now.subtract(const Duration(hours: 3)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.local_shipping,
              description: 'Shipment #SH-4521 in transit',
              timestamp: now.subtract(const Duration(hours: 5)),
              status: ActivityStatus.info),
        ];
      case UserRole.financeManager:
        return [
          ActivityData(
              icon: Icons.payment,
              description: 'Payment received: \$12,400 from BuyerCo',
              timestamp: now.subtract(const Duration(minutes: 40)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.receipt,
              description: 'Invoice #INV-2847 generated',
              timestamp: now.subtract(const Duration(hours: 1)),
              status: ActivityStatus.info),
          ActivityData(
              icon: Icons.warning,
              description: 'Overdue payment: \$8,200 from TradeHub',
              timestamp: now.subtract(const Duration(hours: 4)),
              status: ActivityStatus.warning),
          ActivityData(
              icon: Icons.assessment,
              description: 'Q4 financial report ready',
              timestamp: now.subtract(const Duration(days: 1)),
              status: ActivityStatus.success),
        ];
      case UserRole.buyer:
        return [
          ActivityData(
              icon: Icons.shopping_cart,
              description: 'Order #ORD-523 placed',
              timestamp: now.subtract(const Duration(minutes: 55)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.local_shipping,
              description: 'Shipment #SH-3291 dispatched',
              timestamp: now.subtract(const Duration(hours: 2)),
              status: ActivityStatus.info),
          ActivityData(
              icon: Icons.receipt_long,
              description: 'Contract renewal available',
              timestamp: now.subtract(const Duration(hours: 6)),
              status: ActivityStatus.pending),
          ActivityData(
              icon: Icons.verified,
              description: 'EUDR certificate verified for lot #72',
              timestamp: now.subtract(const Duration(days: 1)),
              status: ActivityStatus.success),
        ];
      case UserRole.viewer:
        return [
          ActivityData(
              icon: Icons.dashboard,
              description: 'Dashboard data refreshed',
              timestamp: now.subtract(const Duration(minutes: 10)),
              status: ActivityStatus.info),
          ActivityData(
              icon: Icons.verified,
              description: 'EUDR compliance report updated',
              timestamp: now.subtract(const Duration(hours: 2)),
              status: ActivityStatus.success),
          ActivityData(
              icon: Icons.map,
              description: 'Farm map data synchronized',
              timestamp: now.subtract(const Duration(hours: 6)),
              status: ActivityStatus.info),
        ];
    }
  }
}

// Data classes for type-safe widget configuration
class QuickActionData {
  final IconData icon;
  final String label;

  const QuickActionData({required this.icon, required this.label});
}

class StatCardData {
  final IconData icon;
  final String title;
  final String value;
  final StatTrend trend;
  final String? trendValue;

  const StatCardData({
    required this.icon,
    required this.title,
    required this.value,
    this.trend = StatTrend.neutral,
    this.trendValue,
  });
}

class ActivityData {
  final IconData icon;
  final String description;
  final DateTime timestamp;
  final ActivityStatus status;

  const ActivityData({
    required this.icon,
    required this.description,
    required this.timestamp,
    this.status = ActivityStatus.info,
  });
}
