import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/network/api_interceptor.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_colors.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/domain/providers/auth_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
    ),
  );

  runApp(const ProviderScope(child: TerraBrewApp()));
}

class TerraBrewApp extends ConsumerStatefulWidget {
  const TerraBrewApp({super.key});

  @override
  ConsumerState<TerraBrewApp> createState() => _TerraBrewAppState();
}

class _TerraBrewAppState extends ConsumerState<TerraBrewApp> {
  final _rootNavigatorKey = GlobalKey<NavigatorState>();

  @override
  void initState() {
    super.initState();
    // Wire up the auth failure callback so that when a token refresh
    // fails (expired session), the user is redirected to login.
    ApiInterceptor.onAuthFailure = () {
      // Clear the features auth state which propagates to core provider
      ref.read(authStateProvider.notifier).logout();
      // Navigate to login using the root navigator
      final context = _rootNavigatorKey.currentContext;
      if (context != null && context.mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil('/login', (_) => false);
      }
    };
  }

  @override
  void dispose() {
    ApiInterceptor.onAuthFailure = null;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'TerraBrew Coffee',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: TextScaler.noScaling,
          ),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
