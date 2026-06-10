import 'package:freezed_annotation/freezed_annotation.dart';

part 'eudr_compliance_model.freezed.dart';
part 'eudr_compliance_model.g.dart';

enum EudrStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('in_review')
  inReview,
  @JsonValue('compliant')
  compliant,
  @JsonValue('non_compliant')
  nonCompliant,
  @JsonValue('expired')
  expired,
}

extension EudrStatusLabel on EudrStatus {
  String get label {
    switch (this) {
      case EudrStatus.pending:
        return 'Pending';
      case EudrStatus.inReview:
        return 'In Review';
      case EudrStatus.compliant:
        return 'Compliant';
      case EudrStatus.nonCompliant:
        return 'Non-Compliant';
      case EudrStatus.expired:
        return 'Expired';
    }
  }
}

enum RiskLevel {
  @JsonValue('low')
  low,
  @JsonValue('medium')
  medium,
  @JsonValue('high')
  high,
  @JsonValue('critical')
  critical,
}

extension RiskLevelLabel on RiskLevel {
  String get label {
    switch (this) {
      case RiskLevel.low:
        return 'Low';
      case RiskLevel.medium:
        return 'Medium';
      case RiskLevel.high:
        return 'High';
      case RiskLevel.critical:
        return 'Critical';
    }
  }
}

@freezed
class EudrComplianceModel with _$EudrComplianceModel {
  const factory EudrComplianceModel({
    required String id,
    @Default('') String tenantId,
    @Default('') String batchId,
    @Default('') String farmerId,
    @Default('') String farmLandId,
    @Default(EudrStatus.pending) EudrStatus status,
    @Default(RiskLevel.low) RiskLevel riskLevel,
    @Default(0.0) double deforestationRiskScore,
    @Default('') String dueDiligenceStatement,
    @Default('') String tracesCertificateRef,
    @Default('') String complianceId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _EudrComplianceModel;

  const EudrComplianceModel._();

  factory EudrComplianceModel.fromJson(Map<String, dynamic> json) =>
      _$EudrComplianceModelFromJson(json);

  String get statusLabel => status.label;
  String get riskLevelLabel => riskLevel.label;
  double get riskScorePercentage => (deforestationRiskScore / 100).clamp(0.0, 1.0);
}

@freezed
class EudrReadinessReport with _$EudrReadinessReport {
  const factory EudrReadinessReport({
    @Default(0) int totalRecords,
    @Default(0) int compliantCount,
    @Default(0) int pendingCount,
    @Default(0) int inReviewCount,
    @Default(0) int nonCompliantCount,
    @Default(0) int expiredCount,
    @Default(0.0) double complianceRate,
    @Default(0.0) double averageRiskScore,
  }) = _EudrReadinessReport;

  const EudrReadinessReport._();

  factory EudrReadinessReport.fromJson(Map<String, dynamic> json) =>
      _$EudrReadinessReportFromJson(json);

  double get pendingRate => totalRecords > 0 ? pendingCount / totalRecords : 0;
  double get compliancePercentage => (complianceRate * 100).clamp(0.0, 100.0);
  double get pendingPercentage => (pendingRate * 100).clamp(0.0, 100.0);
}
