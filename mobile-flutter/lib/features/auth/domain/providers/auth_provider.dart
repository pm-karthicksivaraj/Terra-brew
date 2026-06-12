import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/user_model.dart';
import '../../data/repositories/auth_repository.dart';

// Auth state sealed class
sealed class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthAuthenticated extends AuthState {
  final UserModel user;
  const AuthAuthenticated(this.user);
}

class AuthUnauthenticated extends AuthState {
  final String? error;
  const AuthUnauthenticated({this.error});
}

// Auth StateNotifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;

  AuthNotifier(this._authRepository) : super(const AuthInitial());

  /// Check stored auth and auto-login
  Future<void> checkAuth() async {
    state = const AuthLoading();
    try {
      final isAuth = await _authRepository.isAuthenticated();
      if (isAuth) {
        final user = await _authRepository.getCurrentUser();
        if (user != null) {
          state = AuthAuthenticated(user);
        } else {
          state = const AuthUnauthenticated();
        }
      } else {
        state = const AuthUnauthenticated();
      }
    } catch (e) {
      state = const AuthUnauthenticated();
    }
  }

  /// Login with email-first (auto-discovers tenant)
  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = const AuthLoading();
    try {
      final response = await _authRepository.login(
        email: email,
        password: password,
      );
      state = AuthAuthenticated(response.user);
    } on TenantSelectionRequiredException catch (e) {
      // User belongs to multiple tenants - for now, auto-select the first one
      if (e.tenants.isNotEmpty) {
        final selected = e.tenants.first;
        try {
          final response = await _authRepository.selectTenant(
            email: email,
            password: password,
            tenantId: selected.tenantId,
          );
          state = AuthAuthenticated(response.user);
        } on AuthException catch (authError) {
          state = AuthUnauthenticated(error: authError.message);
        }
      } else {
        state = const AuthUnauthenticated(error: 'No tenants available.');
      }
    } on AuthException catch (e) {
      state = AuthUnauthenticated(error: e.message);
    } catch (e) {
      state = const AuthUnauthenticated(error: 'An unexpected error occurred.');
    }
  }

  /// Platform admin login
  Future<void> platformLogin({
    required String email,
    required String password,
  }) async {
    state = const AuthLoading();
    try {
      final response = await _authRepository.platformLogin(
        email: email,
        password: password,
      );
      state = AuthAuthenticated(response.user);
    } on AuthException catch (e) {
      state = AuthUnauthenticated(error: e.message);
    } catch (e) {
      state = const AuthUnauthenticated(error: 'An unexpected error occurred.');
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      await _authRepository.logout();
    } catch (_) {}
    state = const AuthUnauthenticated();
  }

  /// Clear error
  void clearError() {
    if (state is AuthUnauthenticated) {
      state = const AuthUnauthenticated();
    }
  }
}

// Providers
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

final authStateProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return AuthNotifier(repository);
});

final currentUserProvider = Provider<UserModel?>((ref) {
  final authState = ref.watch(authStateProvider);
  if (authState is AuthAuthenticated) {
    return authState.user;
  }
  return null;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState is AuthAuthenticated;
});
