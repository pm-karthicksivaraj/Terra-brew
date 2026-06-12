// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'farmland_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$FarmLandModelImpl _$$FarmLandModelImplFromJson(Map<String, dynamic> json) =>
    _$FarmLandModelImpl(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String? ?? '',
      farmerId: json['farmerId'] as String? ?? '',
      farmName: json['farmName'] as String? ?? '',
      plotBlockId: json['plotBlockId'] as String? ?? '',
      totalLandHolding: (json['totalLandHolding'] as num?)?.toDouble() ?? 0.0,
      altitude: (json['altitude'] as num?)?.toDouble() ?? 0.0,
      soilType: json['soilType'] as String? ?? '',
      noOfTrees: (json['noOfTrees'] as num?)?.toInt() ?? 0,
      polygonGeoJson: json['polygonGeoJson'] as String? ?? '',
      boundaryArea: (json['boundaryArea'] as num?)?.toDouble() ?? 0.0,
      geoCenterLat: (json['geoCenterLat'] as num?)?.toDouble(),
      geoCenterLng: (json['geoCenterLng'] as num?)?.toDouble(),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$FarmLandModelImplToJson(_$FarmLandModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tenantId': instance.tenantId,
      'farmerId': instance.farmerId,
      'farmName': instance.farmName,
      'plotBlockId': instance.plotBlockId,
      'totalLandHolding': instance.totalLandHolding,
      'altitude': instance.altitude,
      'soilType': instance.soilType,
      'noOfTrees': instance.noOfTrees,
      'polygonGeoJson': instance.polygonGeoJson,
      'boundaryArea': instance.boundaryArea,
      'geoCenterLat': instance.geoCenterLat,
      'geoCenterLng': instance.geoCenterLng,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };
