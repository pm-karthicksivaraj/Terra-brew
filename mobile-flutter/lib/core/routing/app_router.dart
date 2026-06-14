import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/domain/providers/auth_provider.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/carbon/presentation/screens/carbon_tracking_screen.dart';
import '../../features/dashboard/presentation/screens/dashboard_screen.dart';
import '../../features/eudr/presentation/screens/eudr_detail_screen.dart';
import '../../features/eudr/presentation/screens/eudr_list_screen.dart';
import '../../features/eudr/presentation/screens/eudr_wizard_screen.dart';
import '../../features/farmers/presentation/screens/farmer_detail_screen.dart';
import '../../features/farmers/presentation/screens/farmer_form_screen.dart';
import '../../features/farmers/presentation/screens/farmers_list_screen.dart';
import '../../features/farmlands/presentation/screens/farmland_detail_screen.dart';
import '../../features/farmlands/presentation/screens/farmland_form_screen.dart';
import '../../features/farmlands/presentation/screens/farmlands_list_screen.dart';
import '../../features/map/presentation/screens/map_screen.dart';
import '../../features/qr_verify/presentation/screens/qr_result_screen.dart';
import '../../features/qr_verify/presentation/screens/qr_scan_screen.dart';
import '../../features/shipments/presentation/screens/shipment_detail_screen.dart';
import '../../features/shipments/presentation/screens/shipments_list_screen.dart';
import '../../features/super_admin/presentation/screens/price_tickers_screen.dart';
import '../../features/super_admin/presentation/screens/super_admin_dashboard_screen.dart';
import '../../features/super_admin/presentation/screens/tenant_detail_screen.dart';
import '../../features/super_admin/presentation/screens/tenants_list_screen.dart';
import '../../features/trading/presentation/screens/buyers_list_screen.dart';
import '../../features/trading/presentation/screens/trading_desk_screen.dart';
import '../../features/trust_score/presentation/screens/trust_score_screen.dart';
import '../../shared/layouts/main_layout.dart';
import '../providers/auth_provider.dart';
import 'route_guards.dart';

/// GoRouter provider
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      return handleRedirect(ref, state.matchedLocation);
    },
    routes: [
      // Splash
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Login
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),

      // Shell route with bottom navigation
      ShellRoute(
        builder: (context, state, child) {
          final path = state.matchedLocation;
          int tabIndex = 0;
          if (path.startsWith('/eudr')) tabIndex = 1;
          if (path.startsWith('/map')) tabIndex = 2;
          if (path.startsWith('/trading')) tabIndex = 3;
          if (path.startsWith('/profile')) tabIndex = 4;

          return MainLayout(
            currentIndex: tabIndex,
            child: child,
          );
        },
        routes: [
          // Tab 0: Home / Dashboard
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),

          // Tab 1: EUDR Compliance
          GoRoute(
            path: '/eudr',
            builder: (context, state) => const EudrListScreen(),
            routes: [
              GoRoute(
                path: 'new',
                builder: (context, state) => const EudrWizardScreen(),
              ),
              GoRoute(
                path: ':id',
                builder: (context, state) => EudrDetailScreen(
                  complianceId: state.pathParameters['id'] ?? '',
                ),
              ),
            ],
          ),

          // Tab 2: Map
          GoRoute(
            path: '/map',
            builder: (context, state) => const MapScreen(),
          ),

          // Tab 3: Trading
          GoRoute(
            path: '/trading',
            builder: (context, state) => const TradingDeskScreen(),
          ),

          // Tab 4: Profile / Settings
          GoRoute(
            path: '/profile',
            builder: (context, state) => const _ProfileScreen(),
          ),
        ],
      ),

      // Farmers routes
      GoRoute(
        path: '/farmers',
        builder: (context, state) => const FarmersListScreen(),
        routes: [
          GoRoute(
            path: 'new',
            builder: (context, state) => const FarmerFormScreen(),
          ),
          GoRoute(
            path: ':id',
            builder: (context, state) => FarmerDetailScreen(
              farmerId: state.pathParameters['id'] ?? '',
            ),
          ),
        ],
      ),

      // Farmlands routes
      GoRoute(
        path: '/farmlands',
        builder: (context, state) => const FarmLandsListScreen(),
        routes: [
          GoRoute(
            path: 'new',
            builder: (context, state) => const FarmLandFormScreen(),
          ),
          GoRoute(
            path: ':id',
            builder: (context, state) => FarmLandDetailScreen(
              farmlandId: state.pathParameters['id'] ?? '',
            ),
          ),
        ],
      ),

      // Shipments routes
      GoRoute(
        path: '/shipments',
        builder: (context, state) => const ShipmentsListScreen(),
        routes: [
          GoRoute(
            path: ':id',
            builder: (context, state) => ShipmentDetailScreen(
              shipmentId: state.pathParameters['id'] ?? '',
            ),
          ),
        ],
      ),

      // Buyers routes
      GoRoute(
        path: '/buyers',
        builder: (context, state) => const BuyersListScreen(),
      ),

      // Trust Score
      GoRoute(
        path: '/trust-score',
        builder: (context, state) => const TrustScoreScreen(),
      ),

      // Carbon Tracking
      GoRoute(
        path: '/carbon',
        builder: (context, state) => const CarbonTrackingScreen(),
      ),

      // QR Scan
      GoRoute(
        path: '/qr-scan',
        builder: (context, state) => const QrScanScreen(),
      ),

      // QR Result
      GoRoute(
        path: '/qr-result',
        builder: (context, state) => const QrResultScreen(),
      ),

      // Super Admin routes
      GoRoute(
        path: '/super-admin',
        builder: (context, state) => const SuperAdminDashboardScreen(),
        routes: [
          GoRoute(
            path: 'tenants',
            builder: (context, state) => const TenantsListScreen(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) => const TenantsListScreen(),
              ),
            ],
          ),
          GoRoute(
            path: 'price-tickers',
            builder: (context, state) => const PriceTickersScreen(),
          ),
        ],
      ),
    ],
  );
});

/// Simple profile screen
class _ProfileScreen extends ConsumerWidget {
  const _ProfileScreen();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile & Settings')),
      body: ListView(
        children: [
          const SizedBox(height: 16),
          Center(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 48,
                  backgroundColor: const Color(0xFF6D2932),
                  child: Text(
                    'TB',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'TerraBrew User',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1A0D10),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _ProfileTile(
            icon: Icons.person_outline,
            title: 'Account Settings',
            onTap: () {},
          ),
          _ProfileTile(
            icon: Icons.business_outlined,
            title: 'Organization',
            onTap: () {},
          ),
          _ProfileTile(
            icon: Icons.security_outlined,
            title: 'Security',
            onTap: () {},
          ),
          _ProfileTile(
            icon: Icons.notifications_outlined,
            title: 'Notifications',
            onTap: () {},
          ),
          _ProfileTile(
            icon: Icons.language_outlined,
            title: 'Language & Region',
            onTap: () {},
          ),
          _ProfileTile(
            icon: Icons.dark_mode_outlined,
            title: 'Appearance',
            onTap: () {},
          ),
          _ProfileTile(
            icon: Icons.help_outline,
            title: 'Help & Support',
            onTap: () {},
          ),
          _ProfileTile(
            icon: Icons.info_outline,
            title: 'About TerraBrew',
            onTap: () {},
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton.icon(
              onPressed: () async {
                // Actually log out: clear tokens and auth state
                await ref.read(authStateProvider.notifier).logout();
                if (context.mounted) {
                  context.go('/login');
                }
              },
              icon: const Icon(Icons.logout, color: Color(0xFFCC2F2F)),
              label: const Text(
                'Sign Out',
                style: TextStyle(color: Color(0xFFCC2F2F)),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFCC2F2F)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _ProfileTile({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFF6D2932)),
      title: Text(
        title,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
      ),
      trailing: const Icon(Icons.chevron_right, color: Color(0xFFC7B7A3)),
      onTap: onTap,
    );
  }
}
