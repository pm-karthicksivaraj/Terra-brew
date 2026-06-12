class CarbonTrackingModel {
  final String id;
  final String tenantId;
  final String? batchId;
  final String? farmerId;
  final String? farmLandId;
  final String? eudrComplianceId;
  final double scope1Emissions;
  final double scope2Emissions;
  final double scope3Emissions;
  final double totalEmissions;
  final double emissionsPerKg;
  final double carbonSequestered;
  final double netEmissions;
  final String? methodology;
  final DateTime? reportingPeriod;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const CarbonTrackingModel({
    required this.id,
    required this.tenantId,
    this.batchId,
    this.farmerId,
    this.farmLandId,
    this.eudrComplianceId,
    required this.scope1Emissions,
    required this.scope2Emissions,
    required this.scope3Emissions,
    required this.totalEmissions,
    required this.emissionsPerKg,
    required this.carbonSequestered,
    required this.netEmissions,
    this.methodology,
    this.reportingPeriod,
    this.createdAt,
    this.updatedAt,
  });

  factory CarbonTrackingModel.fromJson(Map<String, dynamic> json) {
    return CarbonTrackingModel(
      id: json['id'] as String? ?? '',
      tenantId: json['tenantId'] as String? ?? '',
      batchId: json['batchId'] as String?,
      farmerId: json['farmerId'] as String?,
      farmLandId: json['farmLandId'] as String?,
      eudrComplianceId: json['eudrComplianceId'] as String?,
      scope1Emissions: (json['scope1Emissions'] as num?)?.toDouble() ?? 0,
      scope2Emissions: (json['scope2Emissions'] as num?)?.toDouble() ?? 0,
      scope3Emissions: (json['scope3Emissions'] as num?)?.toDouble() ?? 0,
      totalEmissions: (json['totalEmissions'] as num?)?.toDouble() ?? 0,
      emissionsPerKg: (json['emissionsPerKg'] as num?)?.toDouble() ?? 0,
      carbonSequestered: (json['carbonSequestered'] as num?)?.toDouble() ?? 0,
      netEmissions: (json['netEmissions'] as num?)?.toDouble() ?? 0,
      methodology: json['methodology'] as String?,
      reportingPeriod: json['reportingPeriod'] != null
          ? DateTime.tryParse(json['reportingPeriod'].toString())
          : null,
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
        'batchId': batchId,
        'farmerId': farmerId,
        'farmLandId': farmLandId,
        'eudrComplianceId': eudrComplianceId,
        'scope1Emissions': scope1Emissions,
        'scope2Emissions': scope2Emissions,
        'scope3Emissions': scope3Emissions,
        'totalEmissions': totalEmissions,
        'emissionsPerKg': emissionsPerKg,
        'carbonSequestered': carbonSequestered,
        'netEmissions': netEmissions,
        'methodology': methodology,
        'reportingPeriod': reportingPeriod?.toIso8601String(),
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  String get formattedTotalEmissions =>
      '${totalEmissions.toStringAsFixed(1)} tCO₂e';

  String get formattedEmissionsPerKg =>
      '${emissionsPerKg.toStringAsFixed(2)} kg CO₂e/kg';

  String get formattedCarbonSequestered =>
      '${carbonSequestered.toStringAsFixed(1)} tCO₂e';

  String get formattedNetEmissions =>
      '${netEmissions.toStringAsFixed(1)} tCO₂e';

  double get scope1Percentage =>
      totalEmissions > 0 ? (scope1Emissions / totalEmissions) * 100 : 0;

  double get scope2Percentage =>
      totalEmissions > 0 ? (scope2Emissions / totalEmissions) * 100 : 0;

  double get scope3Percentage =>
      totalEmissions > 0 ? (scope3Emissions / totalEmissions) * 100 : 0;

  bool get isCarbonPositive => netEmissions < 0;

  double get sequestrationRatio =>
      totalEmissions > 0 ? carbonSequestered / totalEmissions : 0;
}
