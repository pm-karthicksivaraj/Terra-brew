// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'eudr_compliance_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$EudrComplianceModelImpl _$$EudrComplianceModelImplFromJson(
  Map<String, dynamic> json,
) => _$EudrComplianceModelImpl(
  id: json['id'] as String,
  tenantId: json['tenantId'] as String? ?? '',
  batchId: json['batchId'] as String? ?? '',
  farmerId: json['farmerId'] as String? ?? '',
  farmLandId: json['farmLandId'] as String? ?? '',
  status:
      $enumDecodeNullable(_$EudrStatusEnumMap, json['status']) ??
      EudrStatus.pending,
  riskLevel:
      $enumDecodeNullable(_$RiskLevelEnumMap, json['riskLevel']) ??
      RiskLevel.low,
  deforestationRiskScore:
      (json['deforestationRiskScore'] as num?)?.toDouble() ?? 0.0,
  dueDiligenceStatement: json['dueDiligenceStatement'] as String? ?? '',
  tracesCertificateRef: json['tracesCertificateRef'] as String? ?? '',
  complianceId: json['complianceId'] as String? ?? '',
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$$EudrComplianceModelImplToJson(
  _$EudrComplianceModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'tenantId': instance.tenantId,
  'batchId': instance.batchId,
  'farmerId': instance.farmerId,
  'farmLandId': instance.farmLandId,
  'status': _$EudrStatusEnumMap[instance.status]!,
  'riskLevel': _$RiskLevelEnumMap[instance.riskLevel]!,
  'deforestationRiskScore': instance.deforestationRiskScore,
  'dueDiligenceStatement': instance.dueDiligenceStatement,
  'tracesCertificateRef': instance.tracesCertificateRef,
  'complianceId': instance.complianceId,
  'createdAt': instance.createdAt?.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
};

const _$EudrStatusEnumMap = {
  EudrStatus.pending: 'pending',
  EudrStatus.inReview: 'in_review',
  EudrStatus.compliant: 'compliant',
  EudrStatus.nonCompliant: 'non_compliant',
  EudrStatus.expired: 'expired',
};

const _$RiskLevelEnumMap = {
  RiskLevel.low: 'low',
  RiskLevel.medium: 'medium',
  RiskLevel.high: 'high',
  RiskLevel.critical: 'critical',
};

_$EudrReadinessReportImpl _$$EudrReadinessReportImplFromJson(
  Map<String, dynamic> json,
) => _$EudrReadinessReportImpl(
  totalRecords: (json['totalRecords'] as num?)?.toInt() ?? 0,
  compliantCount: (json['compliantCount'] as num?)?.toInt() ?? 0,
  pendingCount: (json['pendingCount'] as num?)?.toInt() ?? 0,
  inReviewCount: (json['inReviewCount'] as num?)?.toInt() ?? 0,
  nonCompliantCount: (json['nonCompliantCount'] as num?)?.toInt() ?? 0,
  expiredCount: (json['expiredCount'] as num?)?.toInt() ?? 0,
  complianceRate: (json['complianceRate'] as num?)?.toDouble() ?? 0.0,
  averageRiskScore: (json['averageRiskScore'] as num?)?.toDouble() ?? 0.0,
);

Map<String, dynamic> _$$EudrReadinessReportImplToJson(
  _$EudrReadinessReportImpl instance,
) => <String, dynamic>{
  'totalRecords': instance.totalRecords,
  'compliantCount': instance.compliantCount,
  'pendingCount': instance.pendingCount,
  'inReviewCount': instance.inReviewCount,
  'nonCompliantCount': instance.nonCompliantCount,
  'expiredCount': instance.expiredCount,
  'complianceRate': instance.complianceRate,
  'averageRiskScore': instance.averageRiskScore,
};
