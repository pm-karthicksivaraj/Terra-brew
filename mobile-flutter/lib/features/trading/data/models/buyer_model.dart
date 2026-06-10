enum BuyerType {
  roaster,
  importer,
  trader,
  distributor,
}

class BuyerModel {
  final String id;
  final String tenantId;
  final String buyerCode;
  final String companyName;
  final String? contactPerson;
  final String? email;
  final String? phone;
  final String? country;
  final BuyerType buyerType;
  final bool? euRegistration;
  final String? eoriNumber;
  final String? address;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const BuyerModel({
    required this.id,
    required this.tenantId,
    required this.buyerCode,
    required this.companyName,
    this.contactPerson,
    this.email,
    this.phone,
    this.country,
    required this.buyerType,
    this.euRegistration,
    this.eoriNumber,
    this.address,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  factory BuyerModel.fromJson(Map<String, dynamic> json) {
    return BuyerModel(
      id: json['id'] as String? ?? '',
      tenantId: json['tenantId'] as String? ?? '',
      buyerCode: json['buyerCode'] as String? ?? '',
      companyName: json['companyName'] as String? ?? '',
      contactPerson: json['contactPerson'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      country: json['country'] as String?,
      buyerType: _parseBuyerType(json['buyerType'] as String?),
      euRegistration: json['euRegistration'] as bool?,
      eoriNumber: json['eoriNumber'] as String?,
      address: json['address'] as String?,
      notes: json['notes'] as String?,
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
        'buyerCode': buyerCode,
        'companyName': companyName,
        'contactPerson': contactPerson,
        'email': email,
        'phone': phone,
        'country': country,
        'buyerType': buyerType.name,
        'euRegistration': euRegistration,
        'eoriNumber': eoriNumber,
        'address': address,
        'notes': notes,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  static BuyerType _parseBuyerType(String? value) {
    switch (value?.toLowerCase()) {
      case 'roaster':
        return BuyerType.roaster;
      case 'importer':
        return BuyerType.importer;
      case 'trader':
        return BuyerType.trader;
      case 'distributor':
        return BuyerType.distributor;
      default:
        return BuyerType.roaster;
    }
  }

  String get buyerTypeLabel {
    switch (buyerType) {
      case BuyerType.roaster:
        return 'Roaster';
      case BuyerType.importer:
        return 'Importer';
      case BuyerType.trader:
        return 'Trader';
      case BuyerType.distributor:
        return 'Distributor';
    }
  }

  bool get isEuRegistered => euRegistration ?? false;

  String get displayCountry => country ?? 'Unknown';
}
