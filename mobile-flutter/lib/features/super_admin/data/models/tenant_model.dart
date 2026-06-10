enum EntityType {
  farm,
  cooperative,
  exporter,
  importer,
  roaster,
  trader,
}

enum SubscriptionPlan {
  starter,
  professional,
  enterprise,
}

enum SubscriptionStatus {
  active,
  trial,
  suspended,
  cancelled,
  expired,
}

class TenantModel {
  final String id;
  final String slug;
  final String name;
  final String? legalName;
  final EntityType entityType;
  final String? country;
  final SubscriptionPlan plan;
  final SubscriptionStatus subscriptionStatus;
  final bool eudrCompliant;
  final int? userCount;
  final int? userLimit;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const TenantModel({
    required this.id,
    required this.slug,
    required this.name,
    this.legalName,
    required this.entityType,
    this.country,
    required this.plan,
    required this.subscriptionStatus,
    required this.eudrCompliant,
    this.userCount,
    this.userLimit,
    this.createdAt,
    this.updatedAt,
  });

  factory TenantModel.fromJson(Map<String, dynamic> json) {
    return TenantModel(
      id: json['id'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      name: json['name'] as String? ?? '',
      legalName: json['legalName'] as String?,
      entityType: _parseEntityType(json['entityType'] as String?),
      country: json['country'] as String?,
      plan: _parsePlan(json['plan'] as String?),
      subscriptionStatus:
          _parseSubscriptionStatus(json['subscriptionStatus'] as String?),
      eudrCompliant: json['eudrCompliant'] as bool? ?? false,
      userCount: (json['userCount'] as num?)?.toInt(),
      userLimit: (json['userLimit'] as num?)?.toInt(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'slug': slug,
        'name': name,
        'legalName': legalName,
        'entityType': entityType.name,
        'country': country,
        'plan': plan.name,
        'subscriptionStatus': subscriptionStatus.name,
        'eudrCompliant': eudrCompliant,
        'userCount': userCount,
        'userLimit': userLimit,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  static EntityType _parseEntityType(String? value) {
    switch (value?.toLowerCase()) {
      case 'farm':
        return EntityType.farm;
      case 'cooperative':
        return EntityType.cooperative;
      case 'exporter':
        return EntityType.exporter;
      case 'importer':
        return EntityType.importer;
      case 'roaster':
        return EntityType.roaster;
      case 'trader':
        return EntityType.trader;
      default:
        return EntityType.farm;
    }
  }

  static SubscriptionPlan _parsePlan(String? value) {
    switch (value?.toLowerCase()) {
      case 'starter':
        return SubscriptionPlan.starter;
      case 'professional':
        return SubscriptionPlan.professional;
      case 'enterprise':
        return SubscriptionPlan.enterprise;
      default:
        return SubscriptionPlan.starter;
    }
  }

  static SubscriptionStatus _parseSubscriptionStatus(String? value) {
    switch (value?.toLowerCase()) {
      case 'active':
        return SubscriptionStatus.active;
      case 'trial':
        return SubscriptionStatus.trial;
      case 'suspended':
        return SubscriptionStatus.suspended;
      case 'cancelled':
        return SubscriptionStatus.cancelled;
      case 'expired':
        return SubscriptionStatus.expired;
      default:
        return SubscriptionStatus.trial;
    }
  }

  String get entityTypeLabel {
    switch (entityType) {
      case EntityType.farm:
        return 'Farm';
      case EntityType.cooperative:
        return 'Cooperative';
      case EntityType.exporter:
        return 'Exporter';
      case EntityType.importer:
        return 'Importer';
      case EntityType.roaster:
        return 'Roaster';
      case EntityType.trader:
        return 'Trader';
    }
  }

  String get planLabel {
    switch (plan) {
      case SubscriptionPlan.starter:
        return 'Starter';
      case SubscriptionPlan.professional:
        return 'Professional';
      case SubscriptionPlan.enterprise:
        return 'Enterprise';
    }
  }

  String get statusLabel {
    switch (subscriptionStatus) {
      case SubscriptionStatus.active:
        return 'Active';
      case SubscriptionStatus.trial:
        return 'Trial';
      case SubscriptionStatus.suspended:
        return 'Suspended';
      case SubscriptionStatus.cancelled:
        return 'Cancelled';
      case SubscriptionStatus.expired:
        return 'Expired';
    }
  }

  bool get isActive =>
      subscriptionStatus == SubscriptionStatus.active ||
      subscriptionStatus == SubscriptionStatus.trial;

  bool get isAtUserLimit =>
      userCount != null && userLimit != null && userCount! >= userLimit!;
}
