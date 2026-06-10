class UserModel {
  final String id;
  final String email;
  final String name;
  final String role;
  final String tenantId;
  final String tenantSlug;
  final String tenantName;
  final String entityType;
  final String currency;
  final String currencySymbol;
  final String language;

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.tenantId,
    required this.tenantSlug,
    required this.tenantName,
    this.entityType = '',
    this.currency = 'USD',
    this.currencySymbol = '\$',
    this.language = 'en',
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      name: json['name'] as String? ?? '',
      role: json['role'] as String? ?? 'viewer',
      tenantId: json['tenantId'] as String? ?? '',
      tenantSlug: json['tenantSlug'] as String? ?? '',
      tenantName: json['tenantName'] as String? ?? '',
      entityType: json['entityType'] as String? ?? '',
      currency: json['currency'] as String? ?? 'USD',
      currencySymbol: json['currencySymbol'] as String? ?? '\$',
      language: json['language'] as String? ?? 'en',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'tenantId': tenantId,
      'tenantSlug': tenantSlug,
      'tenantName': tenantName,
      'entityType': entityType,
      'currency': currency,
      'currencySymbol': currencySymbol,
      'language': language,
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    String? role,
    String? tenantId,
    String? tenantSlug,
    String? tenantName,
    String? entityType,
    String? currency,
    String? currencySymbol,
    String? language,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      role: role ?? this.role,
      tenantId: tenantId ?? this.tenantId,
      tenantSlug: tenantSlug ?? this.tenantSlug,
      tenantName: tenantName ?? this.tenantName,
      entityType: entityType ?? this.entityType,
      currency: currency ?? this.currency,
      currencySymbol: currencySymbol ?? this.currencySymbol,
      language: language ?? this.language,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserModel &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          email == other.email;

  @override
  int get hashCode => id.hashCode ^ email.hashCode;

  @override
  String toString() =>
      'UserModel(id: $id, email: $email, name: $name, role: $role)';
}
