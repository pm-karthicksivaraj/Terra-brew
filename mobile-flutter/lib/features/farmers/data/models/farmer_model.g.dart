// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'farmer_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$FarmerModelImpl _$$FarmerModelImplFromJson(Map<String, dynamic> json) =>
    _$FarmerModelImpl(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String? ?? '',
      farmerCode: json['farmerCode'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      contactNumber: json['contactNumber'] as String? ?? '',
      isCertified: json['isCertified'] as bool? ?? false,
      gender: json['gender'] as String? ?? '',
      dob: json['dob'] as String?,
      country: json['country'] as String? ?? '',
      province: json['province'] as String? ?? '',
      district: json['district'] as String? ?? '',
      commune: json['commune'] as String? ?? '',
      village: json['village'] as String? ?? '',
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      creditScore: (json['creditScore'] as num?)?.toInt() ?? 0,
      bankName: json['bankName'] as String? ?? '',
      accountNumber: json['accountNumber'] as String? ?? '',
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$FarmerModelImplToJson(_$FarmerModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tenantId': instance.tenantId,
      'farmerCode': instance.farmerCode,
      'fullName': instance.fullName,
      'contactNumber': instance.contactNumber,
      'isCertified': instance.isCertified,
      'gender': instance.gender,
      'dob': instance.dob,
      'country': instance.country,
      'province': instance.province,
      'district': instance.district,
      'commune': instance.commune,
      'village': instance.village,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'creditScore': instance.creditScore,
      'bankName': instance.bankName,
      'accountNumber': instance.accountNumber,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };
