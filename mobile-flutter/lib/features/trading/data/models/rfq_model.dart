enum RFQStatus {
  open,
  inReview,
  accepted,
  rejected,
  expired,
  cancelled,
  closed,
}

class RFQModel {
  final String id;
  final String tenantId;
  final String rfqId;
  final String title;
  final String commodity;
  final double quantityKg;
  final double? targetPricePerKg;
  final String? incoterms;
  final RFQStatus status;
  final String? deliveryCountry;
  final DateTime? deadline;
  final String? description;
  final int? responseCount;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const RFQModel({
    required this.id,
    required this.tenantId,
    required this.rfqId,
    required this.title,
    required this.commodity,
    required this.quantityKg,
    this.targetPricePerKg,
    this.incoterms,
    required this.status,
    this.deliveryCountry,
    this.deadline,
    this.description,
    this.responseCount,
    this.createdAt,
    this.updatedAt,
  });

  factory RFQModel.fromJson(Map<String, dynamic> json) {
    return RFQModel(
      id: json['id'] as String? ?? '',
      tenantId: json['tenantId'] as String? ?? '',
      rfqId: json['rfqId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      commodity: json['commodity'] as String? ?? '',
      quantityKg: (json['quantityKg'] as num?)?.toDouble() ?? 0,
      targetPricePerKg: (json['targetPricePerKg'] as num?)?.toDouble(),
      incoterms: json['incoterms'] as String?,
      status: _parseRFQStatus(json['status'] as String?),
      deliveryCountry: json['deliveryCountry'] as String?,
      deadline: json['deadline'] != null
          ? DateTime.tryParse(json['deadline'].toString())
          : null,
      description: json['description'] as String?,
      responseCount: (json['responseCount'] as num?)?.toInt(),
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
        'rfqId': rfqId,
        'title': title,
        'commodity': commodity,
        'quantityKg': quantityKg,
        'targetPricePerKg': targetPricePerKg,
        'incoterms': incoterms,
        'status': status.name,
        'deliveryCountry': deliveryCountry,
        'deadline': deadline?.toIso8601String(),
        'description': description,
        'responseCount': responseCount,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  static RFQStatus _parseRFQStatus(String? value) {
    switch (value?.toLowerCase()) {
      case 'open':
        return RFQStatus.open;
      case 'in_review':
        return RFQStatus.inReview;
      case 'accepted':
        return RFQStatus.accepted;
      case 'rejected':
        return RFQStatus.rejected;
      case 'expired':
        return RFQStatus.expired;
      case 'cancelled':
        return RFQStatus.cancelled;
      case 'closed':
        return RFQStatus.closed;
      default:
        return RFQStatus.open;
    }
  }

  String get statusLabel {
    switch (status) {
      case RFQStatus.open:
        return 'Open';
      case RFQStatus.inReview:
        return 'In Review';
      case RFQStatus.accepted:
        return 'Accepted';
      case RFQStatus.rejected:
        return 'Rejected';
      case RFQStatus.expired:
        return 'Expired';
      case RFQStatus.cancelled:
        return 'Cancelled';
      case RFQStatus.closed:
        return 'Closed';
    }
  }

  String get formattedQuantity =>
      '${quantityKg.toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (match) => ',')} kg';

  String get formattedTargetPrice {
    if (targetPricePerKg == null) return 'Negotiable';
    return '\$${targetPricePerKg!.toStringAsFixed(2)}/kg';
  }

  bool get isDeadlineSoon {
    if (deadline == null) return false;
    final diff = deadline!.difference(DateTime.now());
    return diff.inDays <= 3 && diff.inDays >= 0;
  }

  bool get isExpired {
    if (deadline == null) return false;
    return deadline!.isBefore(DateTime.now());
  }
}
