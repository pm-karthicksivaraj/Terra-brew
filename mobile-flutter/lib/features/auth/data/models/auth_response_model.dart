import 'user_model.dart';

class AuthResponseModel {
  final String token;
  final String? refreshToken;
  final UserModel user;

  const AuthResponseModel({
    required this.token,
    this.refreshToken,
    required this.user,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    // Safely parse user object — the API wraps it under 'user'
    final userJson = json['user'];
    if (userJson == null || userJson is! Map<String, dynamic>) {
      throw FormatException(
        'Invalid auth response: missing user data. '
        'Response keys: ${json.keys.toList()}',
      );
    }

    final tokenValue = json['token'] as String? ?? '';
    if (tokenValue.isEmpty) {
      throw FormatException(
        'Invalid auth response: missing token. '
        'Response keys: ${json.keys.toList()}',
      );
    }

    return AuthResponseModel(
      token: tokenValue,
      refreshToken: json['refreshToken'] as String?,
      user: UserModel.fromJson(userJson),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'refreshToken': refreshToken,
      'user': user.toJson(),
    };
  }

  @override
  String toString() =>
      'AuthResponseModel(token: ${token.substring(0, 20)}..., refreshToken: ${refreshToken != null ? "present" : "null"}, user: $user)';
}
