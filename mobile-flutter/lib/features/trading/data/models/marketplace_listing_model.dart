enum ListingStatus {
  draft,
  published,
  reserved,
  sold,
  expired,
  closed,
}

class MarketplaceListingModel {
  final String id;
  final String tenantId;
  final String? farmerId;
  final String title;
  final String coffeeType;
  final double quantityKg;
  final double pricePerKg;
  final ListingStatus listingStatus;
  final double? cupScore;
  final List<String> certifications;
  final String? origin;
  final String? process;
  final String? variety;
  final String? altitude;
  final String? description;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const MarketplaceListingModel({
    required this.id,
    required this.tenantId,
    this.farmerId,
    required this.title,
    required this.coffeeType,
    required this.quantityKg,
    required this.pricePerKg,
    required this.listingStatus,
    this.cupScore,
    this.certifications = const [],
    this.origin,
    this.process,
    this.variety,
    this.altitude,
    this.description,
    this.createdAt,
    this.updatedAt,
  });

  factory MarketplaceListingModel.fromJson(Map<String, dynamic> json) {
    return MarketplaceListingModel(
      id: json['id'] as String? ?? '',
      tenantId: json['tenantId'] as String? ?? '',
      farmerId: json['farmerId'] as String?,
      title: json['title'] as String? ?? '',
      coffeeType: json['coffeeType'] as String? ?? '',
      quantityKg: (json['quantityKg'] as num?)?.toDouble() ?? 0,
      pricePerKg: (json['pricePerKg'] as num?)?.toDouble() ?? 0,
      listingStatus: _parseListingStatus(json['listingStatus'] as String?),
      cupScore: (json['cupScore'] as num?)?.toDouble(),
      certifications: (json['certifications'] as List?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      origin: json['origin'] as String?,
      process: json['process'] as String?,
      variety: json['variety'] as String?,
      altitude: json['altitude'] as String?,
      description: json['description'] as String?,
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
        'tenantId': tenantId,
        'farmerId': farmerId,
        'title': title,
        'coffeeType': coffeeType,
        'quantityKg': quantityKg,
        'pricePerKg': pricePerKg,
        'listingStatus': listingStatus.name,
        'cupScore': cupScore,
        'certifications': certifications,
        'origin': origin,
        'process': process,
        'variety': variety,
        'altitude': altitude,
        'description': description,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  static ListingStatus _parseListingStatus(String? value) {
    switch (value?.toLowerCase()) {
      case 'draft':
        return ListingStatus.draft;
      case 'published':
        return ListingStatus.published;
      case 'reserved':
        return ListingStatus.reserved;
      case 'sold':
        return ListingStatus.sold;
      case 'expired':
        return ListingStatus.expired;
      case 'closed':
        return ListingStatus.closed;
      default:
        return ListingStatus.draft;
    }
  }

  String get statusLabel {
    switch (listingStatus) {
      case ListingStatus.draft:
        return 'Draft';
      case ListingStatus.published:
        return 'Published';
      case ListingStatus.reserved:
        return 'Reserved';
      case ListingStatus.sold:
        return 'Sold';
      case ListingStatus.expired:
        return 'Expired';
      case ListingStatus.closed:
        return 'Closed';
    }
  }

  String get formattedPrice => '\$${pricePerKg.toStringAsFixed(2)}/kg';

  String get formattedQuantity =>
      '${quantityKg.toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (match) => ',')} kg';

  String get formattedCupScore {
    if (cupScore == null) return 'N/A';
    return cupScore!.toStringAsFixed(1);
  }

  String get cupScoreGrade {
    if (cupScore == null) return '';
    if (cupScore! >= 90) return 'Outstanding';
    if (cupScore! >= 85) return 'Excellent';
    if (cupScore! >= 80) return 'Very Good';
    if (cupScore! >= 75) return 'Good';
    if (cupScore! >= 70) return 'Fair';
    return 'Below Standard';
  }
}
