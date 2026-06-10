import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../core/theme/app_theme.dart';
import '../../domain/providers/auth_provider.dart';
import '../widgets/auth_text_field.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _tenantSlugController = TextEditingController();

  final _emailFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();
  final _tenantSlugFocusNode = FocusNode();

  bool _isPlatformAdmin = false;
  bool _rememberMe = false;
  bool _isLoading = false;
  String? _errorMessage;

  late AnimationController _logoAnimationController;
  late Animation<double> _logoFadeAnimation;
  late Animation<Offset> _logoSlideAnimation;

  @override
  void initState() {
    super.initState();
    _logoAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _logoFadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoAnimationController,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
    );

    _logoSlideAnimation = Tween<Offset>(
      begin: const Offset(0, -0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _logoAnimationController,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
    );

    _logoAnimationController.forward();
    _loadRememberMe();
  }

  Future<void> _loadRememberMe() async {
    final repository = ref.read(authRepositoryProvider);
    final data = await repository.loadRememberMe();
    if (mounted) {
      setState(() {
        _rememberMe = data.remember;
        _emailController.text = data.email;
        _tenantSlugController.text = data.tenantSlug;
      });
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _tenantSlugController.dispose();
    _emailFocusNode.dispose();
    _passwordFocusNode.dispose();
    _tenantSlugFocusNode.dispose();
    _logoAnimationController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    if (_isPlatformAdmin) {
      ref.read(authStateProvider.notifier).platformLogin(
            email: _emailController.text.trim(),
            password: _passwordController.text,
          );
    } else {
      ref.read(authStateProvider.notifier).login(
            email: _emailController.text.trim(),
            password: _passwordController.text,
            tenantSlug: _tenantSlugController.text.trim(),
          );
    }

    // Save remember me preferences
    final repository = ref.read(authRepositoryProvider);
    repository.saveRememberMe(
      remember: _rememberMe,
      email: _rememberMe ? _emailController.text.trim() : null,
      tenantSlug: _rememberMe ? _tenantSlugController.text.trim() : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authStateProvider, (previous, next) {
      if (next is AuthAuthenticated) {
        context.go('/dashboard');
      } else if (next is AuthUnauthenticated && next.error != null) {
        setState(() {
          _isLoading = false;
          _errorMessage = next.error;
        });
      } else if (next is AuthUnauthenticated) {
        setState(() {
          _isLoading = false;
        });
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 32),

                  // Logo and branding
                  SlideTransition(
                    position: _logoSlideAnimation,
                    child: FadeTransition(
                      opacity: _logoFadeAnimation,
                      child: _buildBranding(),
                    ),
                  ),

                  const SizedBox(height: 36),

                  // Login form card
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      boxShadow: [
                        BoxShadow(
                          color:
                              AppColors.primary.withValues(alpha: 0.08),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Welcome text
                            Text(
                              'Welcome Back',
                              style: TextStyle(
                                fontFamily: AppTypography.headingFamily,
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _isPlatformAdmin
                                  ? 'Sign in as Platform Admin'
                                  : 'Sign in to your workspace',
                              style: TextStyle(
                                fontFamily: AppTypography.headingFamily,
                                fontSize: 12,
                                color: AppColors.textHint,
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Email field
                            AuthTextField(
                              label: 'EMAIL',
                              hint: 'you@example.com',
                              controller: _emailController,
                              focusNode: _emailFocusNode,
                              prefixIcon: const Icon(Icons.email_outlined),
                              keyboardType: TextInputType.emailAddress,
                              textInputAction: TextInputAction.next,
                              onFieldSubmitted: (_) {
                                _emailFocusNode.unfocus();
                                FocusScope.of(context).requestFocus(
                                  _isPlatformAdmin
                                      ? _passwordFocusNode
                                      : _tenantSlugFocusNode,
                                );
                              },
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Email is required';
                                }
                                if (!value.contains('@')) {
                                  return 'Enter a valid email';
                                }
                                return null;
                              },
                            ),

                            const SizedBox(height: 16),

                            // Tenant slug field (hidden for platform admin)
                            if (!_isPlatformAdmin) ...[
                              AuthTextField(
                                label: 'TENANT SLUG',
                                hint: 'your-organization',
                                controller: _tenantSlugController,
                                focusNode: _tenantSlugFocusNode,
                                prefixIcon:
                                    const Icon(Icons.business_outlined),
                                keyboardType: TextInputType.text,
                                textInputAction: TextInputAction.next,
                                onFieldSubmitted: (_) {
                                  _tenantSlugFocusNode.unfocus();
                                  FocusScope.of(context)
                                      .requestFocus(_passwordFocusNode);
                                },
                                validator: (value) {
                                  if (value == null || value.trim().isEmpty) {
                                    return 'Tenant slug is required';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16),
                            ],

                            // Password field
                            AuthTextField(
                              label: 'PASSWORD',
                              hint: 'Enter your password',
                              controller: _passwordController,
                              focusNode: _passwordFocusNode,
                              prefixIcon: const Icon(Icons.lock_outline),
                              isPassword: true,
                              obscureText: true,
                              textInputAction: TextInputAction.done,
                              onFieldSubmitted: (_) => _handleLogin(),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Password is required';
                                }
                                if (value.length < 6) {
                                  return 'Password must be at least 6 characters';
                                }
                                return null;
                              },
                            ),

                            const SizedBox(height: 16),

                            // Remember me & Forgot password row
                            Row(
                              children: [
                                SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: Checkbox(
                                    value: _rememberMe,
                                    onChanged: (value) {
                                      setState(() {
                                        _rememberMe = value ?? false;
                                      });
                                    },
                                    activeColor: AppColors.primary,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    side: const BorderSide(
                                      color: AppColors.border,
                                      width: 1.5,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _rememberMe = !_rememberMe;
                                    });
                                  },
                                  child: Text(
                                    'Remember me',
                                    style: TextStyle(
                                      fontFamily:
                                          AppTypography.headingFamily,
                                      fontSize: 11,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ),
                                const Spacer(),
                                GestureDetector(
                                  onTap: () {
                                    // TODO: Forgot password
                                  },
                                  child: Text(
                                    'Forgot password?',
                                    style: TextStyle(
                                      fontFamily:
                                          AppTypography.headingFamily,
                                      fontSize: 11,
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 20),

                            // Error message
                            if (_errorMessage != null) ...[
                              _buildErrorMessage(_errorMessage!),
                              const SizedBox(height: 16),
                            ],

                            // Login button
                            _isLoading
                                ? _buildLoadingButton()
                                : _buildLoginButton(),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Platform admin toggle
                  _buildPlatformAdminToggle(),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBranding() {
    return Column(
      children: [
        // Coffee cup icon
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.3),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: const Center(
            child: Icon(
              Icons.coffee_rounded,
              color: AppColors.gold,
              size: 36,
            ),
          ),
        ),
        const SizedBox(height: 16),
        // App name
        Text(
          'TerraBrew',
          style: TextStyle(
            fontFamily: AppTypography.headingFamily,
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 4),
        // Tagline
        Text(
          'COFFEE',
          style: TextStyle(
            fontFamily: AppTypography.headingFamily,
            fontSize: 12,
            color: AppColors.gold,
            letterSpacing: 6,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'EUDR Compliance & Traceability',
          style: TextStyle(
            fontFamily: AppTypography.headingFamily,
            fontSize: 10,
            color: AppColors.textHint,
          ),
        ),
      ],
    );
  }

  Widget _buildLoginButton() {
    return SizedBox(
      height: 52,
      child: ElevatedButton(
        onPressed: _handleLogin,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.textOnPrimary,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          textStyle: TextStyle(
            fontFamily: AppTypography.headingFamily,
            fontSize: 14,
            fontWeight: FontWeight.w700,
            letterSpacing: 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_isPlatformAdmin ? 'PLATFORM LOGIN' : 'SIGN IN'),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward, size: 18),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingButton() {
    return SizedBox(
      height: 52,
      child: Shimmer.fromColors(
        baseColor: AppColors.primary,
        highlightColor: AppColors.primaryLight,
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: const Center(
            child: SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildErrorMessage(String message) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.dangerLight,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(
          color: AppColors.danger.withValues(alpha: 0.2),
        ),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.error_outline,
            color: AppColors.danger,
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontFamily: AppTypography.headingFamily,
                fontSize: 11,
                color: AppColors.danger,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlatformAdminToggle() {
    return GestureDetector(
      onTap: () {
        setState(() {
          _isPlatformAdmin = !_isPlatformAdmin;
          _errorMessage = null;
        });
        ref.read(authStateProvider.notifier).clearError();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: _isPlatformAdmin
              ? AppColors.primary.withValues(alpha: 0.06)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(
            color: _isPlatformAdmin
                ? AppColors.primary.withValues(alpha: 0.2)
                : AppColors.border,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.admin_panel_settings_outlined,
              size: 16,
              color: _isPlatformAdmin
                  ? AppColors.primary
                  : AppColors.textHint,
            ),
            const SizedBox(width: 8),
            Text(
              'Platform Super Admin Login',
              style: TextStyle(
                fontFamily: AppTypography.headingFamily,
                fontSize: 11,
                color: _isPlatformAdmin
                    ? AppColors.primary
                    : AppColors.textHint,
                fontWeight:
                    _isPlatformAdmin ? FontWeight.w700 : FontWeight.w400,
              ),
            ),
            const Spacer(),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 36,
              height: 20,
              decoration: BoxDecoration(
                color: _isPlatformAdmin
                    ? AppColors.primary
                    : AppColors.border,
                borderRadius: BorderRadius.circular(10),
              ),
              child: AnimatedAlign(
                duration: const Duration(milliseconds: 200),
                alignment: _isPlatformAdmin
                    ? Alignment.centerRight
                    : Alignment.centerLeft,
                child: Container(
                  width: 16,
                  height: 16,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.15),
                        blurRadius: 2,
                        offset: const Offset(0, 1),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
