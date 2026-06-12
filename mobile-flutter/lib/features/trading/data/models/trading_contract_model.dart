enum ContractType { spot, forward, term }

enum ContractStatus {
  draft,
  pending,
  active,
  completed,
  cancelled,
  expired,
}

class TradingContractModel {
  final String id;
  final String tenantId;
  final String? buyerId;
  final String contractNumber;
  final ContractType contractType;
  final double quantityKg;
  final double pricePerKg;
  final double totalValue;
  final ContractStatus status;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const TradingContractModel({
    required this.id,
    required this.tenantId,
    this.buyerId,
    required this.contractNumber,
    required this.contractType,
    required this.quantityKg,
    required this.pricePerKg,
    required this.totalValue,
    required this.status,
    this.createdAt,
    this.updatedAt,
  });

  factory TradingContractModel.fromJson(Map<String, dynamic> json) {
    return TradingContractModel(
      id: json['id'] as String? ?? '',
      tenantId: json['tenantId'] as String? ?? '',
      buyerId: json['buyerId'] as String?,
      contractNumber: json['contractNumber'] as String? ?? '',
      contractType: _parseContractType(json['contractType'] as String?),
      quantityKg: (json['quantityKg'] as num?)?.toDouble() ?? 0,
      pricePerKg: (json['pricePerKg'] as num?)?.toDouble() ?? 0,
      totalValue: (json['totalValue'] as num?)?.toDouble() ?? 0,
      status: _parseContractStatus(json['status'] as String?),
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
        'buyerId': buyerId,
        'contractNumber': contractNumber,
        'contractType': contractType.name,
        'quantityKg': quantityKg,
        'pricePerKg': pricePerKg,
        'totalValue': totalValue,
        'status': status.name,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  static ContractType _parseContractType(String? value) {
    switch (value?.toLowerCase()) {
      case 'spot':
        return ContractType.spot;
      case 'forward':
        return ContractType.forward;
      case 'term':
        return ContractType.term;
      default:
        return ContractType.spot;
    }
  }

  static ContractStatus _parseContractStatus(String? value) {
    switch (value?.toLowerCase()) {
      case 'draft':
        return ContractStatus.draft;
      case 'pending':
        return ContractStatus.pending;
      case 'active':
        return ContractStatus.active;
      case 'completed':
        return ContractStatus.completed;
      case 'cancelled':
        return ContractStatus.cancelled;
      case 'expired':
        return ContractStatus.expired;
      default:
        return ContractStatus.draft;
    }
  }

  String get contractTypeLabel {
    switch (contractType) {
      case ContractType.spot:
        return 'Spot';
      case ContractType.forward:
        return 'Forward';
      case ContractType.term:
        return 'Term';
    }
  }

  String get statusLabel {
    switch (status) {
      case ContractStatus.draft:
        return 'Draft';
      case ContractStatus.pending:
        return 'Pending';
      case ContractStatus.active:
        return 'Active';
      case ContractStatus.completed:
        return 'Completed';
      case ContractStatus.cancelled:
        return 'Cancelled';
      case ContractStatus.expired:
        return 'Expired';
    }
  }

  String get formattedValue =>
      '\$${totalValue.toStringAsFixed(2).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (match) => ',')}';

  String get formattedQuantity =>
      '${quantityKg.toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (match) => ',')} kg';

  String get formattedPrice => '\$${pricePerKg.toStringAsFixed(2)}/kg';
}
