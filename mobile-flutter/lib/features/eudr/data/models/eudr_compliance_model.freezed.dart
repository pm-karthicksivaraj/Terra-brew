// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'eudr_compliance_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

EudrComplianceModel _$EudrComplianceModelFromJson(Map<String, dynamic> json) {
  return _EudrComplianceModel.fromJson(json);
}

/// @nodoc
mixin _$EudrComplianceModel {
  String get id => throw _privateConstructorUsedError;
  String get tenantId => throw _privateConstructorUsedError;
  String get batchId => throw _privateConstructorUsedError;
  String get farmerId => throw _privateConstructorUsedError;
  String get farmLandId => throw _privateConstructorUsedError;
  EudrStatus get status => throw _privateConstructorUsedError;
  RiskLevel get riskLevel => throw _privateConstructorUsedError;
  double get deforestationRiskScore => throw _privateConstructorUsedError;
  String get dueDiligenceStatement => throw _privateConstructorUsedError;
  String get tracesCertificateRef => throw _privateConstructorUsedError;
  String get complianceId => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this EudrComplianceModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of EudrComplianceModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $EudrComplianceModelCopyWith<EudrComplianceModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $EudrComplianceModelCopyWith<$Res> {
  factory $EudrComplianceModelCopyWith(
    EudrComplianceModel value,
    $Res Function(EudrComplianceModel) then,
  ) = _$EudrComplianceModelCopyWithImpl<$Res, EudrComplianceModel>;
  @useResult
  $Res call({
    String id,
    String tenantId,
    String batchId,
    String farmerId,
    String farmLandId,
    EudrStatus status,
    RiskLevel riskLevel,
    double deforestationRiskScore,
    String dueDiligenceStatement,
    String tracesCertificateRef,
    String complianceId,
    DateTime? createdAt,
    DateTime? updatedAt,
  });
}

/// @nodoc
class _$EudrComplianceModelCopyWithImpl<$Res, $Val extends EudrComplianceModel>
    implements $EudrComplianceModelCopyWith<$Res> {
  _$EudrComplianceModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of EudrComplianceModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? batchId = null,
    Object? farmerId = null,
    Object? farmLandId = null,
    Object? status = null,
    Object? riskLevel = null,
    Object? deforestationRiskScore = null,
    Object? dueDiligenceStatement = null,
    Object? tracesCertificateRef = null,
    Object? complianceId = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            tenantId: null == tenantId
                ? _value.tenantId
                : tenantId // ignore: cast_nullable_to_non_nullable
                      as String,
            batchId: null == batchId
                ? _value.batchId
                : batchId // ignore: cast_nullable_to_non_nullable
                      as String,
            farmerId: null == farmerId
                ? _value.farmerId
                : farmerId // ignore: cast_nullable_to_non_nullable
                      as String,
            farmLandId: null == farmLandId
                ? _value.farmLandId
                : farmLandId // ignore: cast_nullable_to_non_nullable
                      as String,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as EudrStatus,
            riskLevel: null == riskLevel
                ? _value.riskLevel
                : riskLevel // ignore: cast_nullable_to_non_nullable
                      as RiskLevel,
            deforestationRiskScore: null == deforestationRiskScore
                ? _value.deforestationRiskScore
                : deforestationRiskScore // ignore: cast_nullable_to_non_nullable
                      as double,
            dueDiligenceStatement: null == dueDiligenceStatement
                ? _value.dueDiligenceStatement
                : dueDiligenceStatement // ignore: cast_nullable_to_non_nullable
                      as String,
            tracesCertificateRef: null == tracesCertificateRef
                ? _value.tracesCertificateRef
                : tracesCertificateRef // ignore: cast_nullable_to_non_nullable
                      as String,
            complianceId: null == complianceId
                ? _value.complianceId
                : complianceId // ignore: cast_nullable_to_non_nullable
                      as String,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$EudrComplianceModelImplCopyWith<$Res>
    implements $EudrComplianceModelCopyWith<$Res> {
  factory _$$EudrComplianceModelImplCopyWith(
    _$EudrComplianceModelImpl value,
    $Res Function(_$EudrComplianceModelImpl) then,
  ) = __$$EudrComplianceModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String tenantId,
    String batchId,
    String farmerId,
    String farmLandId,
    EudrStatus status,
    RiskLevel riskLevel,
    double deforestationRiskScore,
    String dueDiligenceStatement,
    String tracesCertificateRef,
    String complianceId,
    DateTime? createdAt,
    DateTime? updatedAt,
  });
}

/// @nodoc
class __$$EudrComplianceModelImplCopyWithImpl<$Res>
    extends _$EudrComplianceModelCopyWithImpl<$Res, _$EudrComplianceModelImpl>
    implements _$$EudrComplianceModelImplCopyWith<$Res> {
  __$$EudrComplianceModelImplCopyWithImpl(
    _$EudrComplianceModelImpl _value,
    $Res Function(_$EudrComplianceModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of EudrComplianceModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? batchId = null,
    Object? farmerId = null,
    Object? farmLandId = null,
    Object? status = null,
    Object? riskLevel = null,
    Object? deforestationRiskScore = null,
    Object? dueDiligenceStatement = null,
    Object? tracesCertificateRef = null,
    Object? complianceId = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(
      _$EudrComplianceModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        tenantId: null == tenantId
            ? _value.tenantId
            : tenantId // ignore: cast_nullable_to_non_nullable
                  as String,
        batchId: null == batchId
            ? _value.batchId
            : batchId // ignore: cast_nullable_to_non_nullable
                  as String,
        farmerId: null == farmerId
            ? _value.farmerId
            : farmerId // ignore: cast_nullable_to_non_nullable
                  as String,
        farmLandId: null == farmLandId
            ? _value.farmLandId
            : farmLandId // ignore: cast_nullable_to_non_nullable
                  as String,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as EudrStatus,
        riskLevel: null == riskLevel
            ? _value.riskLevel
            : riskLevel // ignore: cast_nullable_to_non_nullable
                  as RiskLevel,
        deforestationRiskScore: null == deforestationRiskScore
            ? _value.deforestationRiskScore
            : deforestationRiskScore // ignore: cast_nullable_to_non_nullable
                  as double,
        dueDiligenceStatement: null == dueDiligenceStatement
            ? _value.dueDiligenceStatement
            : dueDiligenceStatement // ignore: cast_nullable_to_non_nullable
                  as String,
        tracesCertificateRef: null == tracesCertificateRef
            ? _value.tracesCertificateRef
            : tracesCertificateRef // ignore: cast_nullable_to_non_nullable
                  as String,
        complianceId: null == complianceId
            ? _value.complianceId
            : complianceId // ignore: cast_nullable_to_non_nullable
                  as String,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$EudrComplianceModelImpl extends _EudrComplianceModel {
  const _$EudrComplianceModelImpl({
    required this.id,
    this.tenantId = '',
    this.batchId = '',
    this.farmerId = '',
    this.farmLandId = '',
    this.status = EudrStatus.pending,
    this.riskLevel = RiskLevel.low,
    this.deforestationRiskScore = 0.0,
    this.dueDiligenceStatement = '',
    this.tracesCertificateRef = '',
    this.complianceId = '',
    this.createdAt,
    this.updatedAt,
  }) : super._();

  factory _$EudrComplianceModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$EudrComplianceModelImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey()
  final String tenantId;
  @override
  @JsonKey()
  final String batchId;
  @override
  @JsonKey()
  final String farmerId;
  @override
  @JsonKey()
  final String farmLandId;
  @override
  @JsonKey()
  final EudrStatus status;
  @override
  @JsonKey()
  final RiskLevel riskLevel;
  @override
  @JsonKey()
  final double deforestationRiskScore;
  @override
  @JsonKey()
  final String dueDiligenceStatement;
  @override
  @JsonKey()
  final String tracesCertificateRef;
  @override
  @JsonKey()
  final String complianceId;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;

  @override
  String toString() {
    return 'EudrComplianceModel(id: $id, tenantId: $tenantId, batchId: $batchId, farmerId: $farmerId, farmLandId: $farmLandId, status: $status, riskLevel: $riskLevel, deforestationRiskScore: $deforestationRiskScore, dueDiligenceStatement: $dueDiligenceStatement, tracesCertificateRef: $tracesCertificateRef, complianceId: $complianceId, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$EudrComplianceModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tenantId, tenantId) ||
                other.tenantId == tenantId) &&
            (identical(other.batchId, batchId) || other.batchId == batchId) &&
            (identical(other.farmerId, farmerId) ||
                other.farmerId == farmerId) &&
            (identical(other.farmLandId, farmLandId) ||
                other.farmLandId == farmLandId) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.riskLevel, riskLevel) ||
                other.riskLevel == riskLevel) &&
            (identical(other.deforestationRiskScore, deforestationRiskScore) ||
                other.deforestationRiskScore == deforestationRiskScore) &&
            (identical(other.dueDiligenceStatement, dueDiligenceStatement) ||
                other.dueDiligenceStatement == dueDiligenceStatement) &&
            (identical(other.tracesCertificateRef, tracesCertificateRef) ||
                other.tracesCertificateRef == tracesCertificateRef) &&
            (identical(other.complianceId, complianceId) ||
                other.complianceId == complianceId) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    tenantId,
    batchId,
    farmerId,
    farmLandId,
    status,
    riskLevel,
    deforestationRiskScore,
    dueDiligenceStatement,
    tracesCertificateRef,
    complianceId,
    createdAt,
    updatedAt,
  );

  /// Create a copy of EudrComplianceModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$EudrComplianceModelImplCopyWith<_$EudrComplianceModelImpl> get copyWith =>
      __$$EudrComplianceModelImplCopyWithImpl<_$EudrComplianceModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$EudrComplianceModelImplToJson(this);
  }
}

abstract class _EudrComplianceModel extends EudrComplianceModel {
  const factory _EudrComplianceModel({
    required final String id,
    final String tenantId,
    final String batchId,
    final String farmerId,
    final String farmLandId,
    final EudrStatus status,
    final RiskLevel riskLevel,
    final double deforestationRiskScore,
    final String dueDiligenceStatement,
    final String tracesCertificateRef,
    final String complianceId,
    final DateTime? createdAt,
    final DateTime? updatedAt,
  }) = _$EudrComplianceModelImpl;
  const _EudrComplianceModel._() : super._();

  factory _EudrComplianceModel.fromJson(Map<String, dynamic> json) =
      _$EudrComplianceModelImpl.fromJson;

  @override
  String get id;
  @override
  String get tenantId;
  @override
  String get batchId;
  @override
  String get farmerId;
  @override
  String get farmLandId;
  @override
  EudrStatus get status;
  @override
  RiskLevel get riskLevel;
  @override
  double get deforestationRiskScore;
  @override
  String get dueDiligenceStatement;
  @override
  String get tracesCertificateRef;
  @override
  String get complianceId;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;

  /// Create a copy of EudrComplianceModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$EudrComplianceModelImplCopyWith<_$EudrComplianceModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

EudrReadinessReport _$EudrReadinessReportFromJson(Map<String, dynamic> json) {
  return _EudrReadinessReport.fromJson(json);
}

/// @nodoc
mixin _$EudrReadinessReport {
  int get totalRecords => throw _privateConstructorUsedError;
  int get compliantCount => throw _privateConstructorUsedError;
  int get pendingCount => throw _privateConstructorUsedError;
  int get inReviewCount => throw _privateConstructorUsedError;
  int get nonCompliantCount => throw _privateConstructorUsedError;
  int get expiredCount => throw _privateConstructorUsedError;
  double get complianceRate => throw _privateConstructorUsedError;
  double get averageRiskScore => throw _privateConstructorUsedError;

  /// Serializes this EudrReadinessReport to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of EudrReadinessReport
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $EudrReadinessReportCopyWith<EudrReadinessReport> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $EudrReadinessReportCopyWith<$Res> {
  factory $EudrReadinessReportCopyWith(
    EudrReadinessReport value,
    $Res Function(EudrReadinessReport) then,
  ) = _$EudrReadinessReportCopyWithImpl<$Res, EudrReadinessReport>;
  @useResult
  $Res call({
    int totalRecords,
    int compliantCount,
    int pendingCount,
    int inReviewCount,
    int nonCompliantCount,
    int expiredCount,
    double complianceRate,
    double averageRiskScore,
  });
}

/// @nodoc
class _$EudrReadinessReportCopyWithImpl<$Res, $Val extends EudrReadinessReport>
    implements $EudrReadinessReportCopyWith<$Res> {
  _$EudrReadinessReportCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of EudrReadinessReport
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalRecords = null,
    Object? compliantCount = null,
    Object? pendingCount = null,
    Object? inReviewCount = null,
    Object? nonCompliantCount = null,
    Object? expiredCount = null,
    Object? complianceRate = null,
    Object? averageRiskScore = null,
  }) {
    return _then(
      _value.copyWith(
            totalRecords: null == totalRecords
                ? _value.totalRecords
                : totalRecords // ignore: cast_nullable_to_non_nullable
                      as int,
            compliantCount: null == compliantCount
                ? _value.compliantCount
                : compliantCount // ignore: cast_nullable_to_non_nullable
                      as int,
            pendingCount: null == pendingCount
                ? _value.pendingCount
                : pendingCount // ignore: cast_nullable_to_non_nullable
                      as int,
            inReviewCount: null == inReviewCount
                ? _value.inReviewCount
                : inReviewCount // ignore: cast_nullable_to_non_nullable
                      as int,
            nonCompliantCount: null == nonCompliantCount
                ? _value.nonCompliantCount
                : nonCompliantCount // ignore: cast_nullable_to_non_nullable
                      as int,
            expiredCount: null == expiredCount
                ? _value.expiredCount
                : expiredCount // ignore: cast_nullable_to_non_nullable
                      as int,
            complianceRate: null == complianceRate
                ? _value.complianceRate
                : complianceRate // ignore: cast_nullable_to_non_nullable
                      as double,
            averageRiskScore: null == averageRiskScore
                ? _value.averageRiskScore
                : averageRiskScore // ignore: cast_nullable_to_non_nullable
                      as double,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$EudrReadinessReportImplCopyWith<$Res>
    implements $EudrReadinessReportCopyWith<$Res> {
  factory _$$EudrReadinessReportImplCopyWith(
    _$EudrReadinessReportImpl value,
    $Res Function(_$EudrReadinessReportImpl) then,
  ) = __$$EudrReadinessReportImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int totalRecords,
    int compliantCount,
    int pendingCount,
    int inReviewCount,
    int nonCompliantCount,
    int expiredCount,
    double complianceRate,
    double averageRiskScore,
  });
}

/// @nodoc
class __$$EudrReadinessReportImplCopyWithImpl<$Res>
    extends _$EudrReadinessReportCopyWithImpl<$Res, _$EudrReadinessReportImpl>
    implements _$$EudrReadinessReportImplCopyWith<$Res> {
  __$$EudrReadinessReportImplCopyWithImpl(
    _$EudrReadinessReportImpl _value,
    $Res Function(_$EudrReadinessReportImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of EudrReadinessReport
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalRecords = null,
    Object? compliantCount = null,
    Object? pendingCount = null,
    Object? inReviewCount = null,
    Object? nonCompliantCount = null,
    Object? expiredCount = null,
    Object? complianceRate = null,
    Object? averageRiskScore = null,
  }) {
    return _then(
      _$EudrReadinessReportImpl(
        totalRecords: null == totalRecords
            ? _value.totalRecords
            : totalRecords // ignore: cast_nullable_to_non_nullable
                  as int,
        compliantCount: null == compliantCount
            ? _value.compliantCount
            : compliantCount // ignore: cast_nullable_to_non_nullable
                  as int,
        pendingCount: null == pendingCount
            ? _value.pendingCount
            : pendingCount // ignore: cast_nullable_to_non_nullable
                  as int,
        inReviewCount: null == inReviewCount
            ? _value.inReviewCount
            : inReviewCount // ignore: cast_nullable_to_non_nullable
                  as int,
        nonCompliantCount: null == nonCompliantCount
            ? _value.nonCompliantCount
            : nonCompliantCount // ignore: cast_nullable_to_non_nullable
                  as int,
        expiredCount: null == expiredCount
            ? _value.expiredCount
            : expiredCount // ignore: cast_nullable_to_non_nullable
                  as int,
        complianceRate: null == complianceRate
            ? _value.complianceRate
            : complianceRate // ignore: cast_nullable_to_non_nullable
                  as double,
        averageRiskScore: null == averageRiskScore
            ? _value.averageRiskScore
            : averageRiskScore // ignore: cast_nullable_to_non_nullable
                  as double,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$EudrReadinessReportImpl extends _EudrReadinessReport {
  const _$EudrReadinessReportImpl({
    this.totalRecords = 0,
    this.compliantCount = 0,
    this.pendingCount = 0,
    this.inReviewCount = 0,
    this.nonCompliantCount = 0,
    this.expiredCount = 0,
    this.complianceRate = 0.0,
    this.averageRiskScore = 0.0,
  }) : super._();

  factory _$EudrReadinessReportImpl.fromJson(Map<String, dynamic> json) =>
      _$$EudrReadinessReportImplFromJson(json);

  @override
  @JsonKey()
  final int totalRecords;
  @override
  @JsonKey()
  final int compliantCount;
  @override
  @JsonKey()
  final int pendingCount;
  @override
  @JsonKey()
  final int inReviewCount;
  @override
  @JsonKey()
  final int nonCompliantCount;
  @override
  @JsonKey()
  final int expiredCount;
  @override
  @JsonKey()
  final double complianceRate;
  @override
  @JsonKey()
  final double averageRiskScore;

  @override
  String toString() {
    return 'EudrReadinessReport(totalRecords: $totalRecords, compliantCount: $compliantCount, pendingCount: $pendingCount, inReviewCount: $inReviewCount, nonCompliantCount: $nonCompliantCount, expiredCount: $expiredCount, complianceRate: $complianceRate, averageRiskScore: $averageRiskScore)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$EudrReadinessReportImpl &&
            (identical(other.totalRecords, totalRecords) ||
                other.totalRecords == totalRecords) &&
            (identical(other.compliantCount, compliantCount) ||
                other.compliantCount == compliantCount) &&
            (identical(other.pendingCount, pendingCount) ||
                other.pendingCount == pendingCount) &&
            (identical(other.inReviewCount, inReviewCount) ||
                other.inReviewCount == inReviewCount) &&
            (identical(other.nonCompliantCount, nonCompliantCount) ||
                other.nonCompliantCount == nonCompliantCount) &&
            (identical(other.expiredCount, expiredCount) ||
                other.expiredCount == expiredCount) &&
            (identical(other.complianceRate, complianceRate) ||
                other.complianceRate == complianceRate) &&
            (identical(other.averageRiskScore, averageRiskScore) ||
                other.averageRiskScore == averageRiskScore));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    totalRecords,
    compliantCount,
    pendingCount,
    inReviewCount,
    nonCompliantCount,
    expiredCount,
    complianceRate,
    averageRiskScore,
  );

  /// Create a copy of EudrReadinessReport
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$EudrReadinessReportImplCopyWith<_$EudrReadinessReportImpl> get copyWith =>
      __$$EudrReadinessReportImplCopyWithImpl<_$EudrReadinessReportImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$EudrReadinessReportImplToJson(this);
  }
}

abstract class _EudrReadinessReport extends EudrReadinessReport {
  const factory _EudrReadinessReport({
    final int totalRecords,
    final int compliantCount,
    final int pendingCount,
    final int inReviewCount,
    final int nonCompliantCount,
    final int expiredCount,
    final double complianceRate,
    final double averageRiskScore,
  }) = _$EudrReadinessReportImpl;
  const _EudrReadinessReport._() : super._();

  factory _EudrReadinessReport.fromJson(Map<String, dynamic> json) =
      _$EudrReadinessReportImpl.fromJson;

  @override
  int get totalRecords;
  @override
  int get compliantCount;
  @override
  int get pendingCount;
  @override
  int get inReviewCount;
  @override
  int get nonCompliantCount;
  @override
  int get expiredCount;
  @override
  double get complianceRate;
  @override
  double get averageRiskScore;

  /// Create a copy of EudrReadinessReport
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$EudrReadinessReportImplCopyWith<_$EudrReadinessReportImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
