// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'farmland_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

FarmLandModel _$FarmLandModelFromJson(Map<String, dynamic> json) {
  return _FarmLandModel.fromJson(json);
}

/// @nodoc
mixin _$FarmLandModel {
  String get id => throw _privateConstructorUsedError;
  String get tenantId => throw _privateConstructorUsedError;
  String get farmerId => throw _privateConstructorUsedError;
  String get farmName => throw _privateConstructorUsedError;
  String get plotBlockId => throw _privateConstructorUsedError;
  double get totalLandHolding => throw _privateConstructorUsedError;
  double get altitude => throw _privateConstructorUsedError;
  String get soilType => throw _privateConstructorUsedError;
  int get noOfTrees => throw _privateConstructorUsedError;
  String get polygonGeoJson => throw _privateConstructorUsedError;
  double get boundaryArea => throw _privateConstructorUsedError;
  double? get geoCenterLat => throw _privateConstructorUsedError;
  double? get geoCenterLng => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this FarmLandModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FarmLandModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FarmLandModelCopyWith<FarmLandModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FarmLandModelCopyWith<$Res> {
  factory $FarmLandModelCopyWith(
    FarmLandModel value,
    $Res Function(FarmLandModel) then,
  ) = _$FarmLandModelCopyWithImpl<$Res, FarmLandModel>;
  @useResult
  $Res call({
    String id,
    String tenantId,
    String farmerId,
    String farmName,
    String plotBlockId,
    double totalLandHolding,
    double altitude,
    String soilType,
    int noOfTrees,
    String polygonGeoJson,
    double boundaryArea,
    double? geoCenterLat,
    double? geoCenterLng,
    DateTime? createdAt,
    DateTime? updatedAt,
  });
}

/// @nodoc
class _$FarmLandModelCopyWithImpl<$Res, $Val extends FarmLandModel>
    implements $FarmLandModelCopyWith<$Res> {
  _$FarmLandModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FarmLandModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? farmerId = null,
    Object? farmName = null,
    Object? plotBlockId = null,
    Object? totalLandHolding = null,
    Object? altitude = null,
    Object? soilType = null,
    Object? noOfTrees = null,
    Object? polygonGeoJson = null,
    Object? boundaryArea = null,
    Object? geoCenterLat = freezed,
    Object? geoCenterLng = freezed,
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
            farmerId: null == farmerId
                ? _value.farmerId
                : farmerId // ignore: cast_nullable_to_non_nullable
                      as String,
            farmName: null == farmName
                ? _value.farmName
                : farmName // ignore: cast_nullable_to_non_nullable
                      as String,
            plotBlockId: null == plotBlockId
                ? _value.plotBlockId
                : plotBlockId // ignore: cast_nullable_to_non_nullable
                      as String,
            totalLandHolding: null == totalLandHolding
                ? _value.totalLandHolding
                : totalLandHolding // ignore: cast_nullable_to_non_nullable
                      as double,
            altitude: null == altitude
                ? _value.altitude
                : altitude // ignore: cast_nullable_to_non_nullable
                      as double,
            soilType: null == soilType
                ? _value.soilType
                : soilType // ignore: cast_nullable_to_non_nullable
                      as String,
            noOfTrees: null == noOfTrees
                ? _value.noOfTrees
                : noOfTrees // ignore: cast_nullable_to_non_nullable
                      as int,
            polygonGeoJson: null == polygonGeoJson
                ? _value.polygonGeoJson
                : polygonGeoJson // ignore: cast_nullable_to_non_nullable
                      as String,
            boundaryArea: null == boundaryArea
                ? _value.boundaryArea
                : boundaryArea // ignore: cast_nullable_to_non_nullable
                      as double,
            geoCenterLat: freezed == geoCenterLat
                ? _value.geoCenterLat
                : geoCenterLat // ignore: cast_nullable_to_non_nullable
                      as double?,
            geoCenterLng: freezed == geoCenterLng
                ? _value.geoCenterLng
                : geoCenterLng // ignore: cast_nullable_to_non_nullable
                      as double?,
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
abstract class _$$FarmLandModelImplCopyWith<$Res>
    implements $FarmLandModelCopyWith<$Res> {
  factory _$$FarmLandModelImplCopyWith(
    _$FarmLandModelImpl value,
    $Res Function(_$FarmLandModelImpl) then,
  ) = __$$FarmLandModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String tenantId,
    String farmerId,
    String farmName,
    String plotBlockId,
    double totalLandHolding,
    double altitude,
    String soilType,
    int noOfTrees,
    String polygonGeoJson,
    double boundaryArea,
    double? geoCenterLat,
    double? geoCenterLng,
    DateTime? createdAt,
    DateTime? updatedAt,
  });
}

/// @nodoc
class __$$FarmLandModelImplCopyWithImpl<$Res>
    extends _$FarmLandModelCopyWithImpl<$Res, _$FarmLandModelImpl>
    implements _$$FarmLandModelImplCopyWith<$Res> {
  __$$FarmLandModelImplCopyWithImpl(
    _$FarmLandModelImpl _value,
    $Res Function(_$FarmLandModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FarmLandModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? farmerId = null,
    Object? farmName = null,
    Object? plotBlockId = null,
    Object? totalLandHolding = null,
    Object? altitude = null,
    Object? soilType = null,
    Object? noOfTrees = null,
    Object? polygonGeoJson = null,
    Object? boundaryArea = null,
    Object? geoCenterLat = freezed,
    Object? geoCenterLng = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(
      _$FarmLandModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        tenantId: null == tenantId
            ? _value.tenantId
            : tenantId // ignore: cast_nullable_to_non_nullable
                  as String,
        farmerId: null == farmerId
            ? _value.farmerId
            : farmerId // ignore: cast_nullable_to_non_nullable
                  as String,
        farmName: null == farmName
            ? _value.farmName
            : farmName // ignore: cast_nullable_to_non_nullable
                  as String,
        plotBlockId: null == plotBlockId
            ? _value.plotBlockId
            : plotBlockId // ignore: cast_nullable_to_non_nullable
                  as String,
        totalLandHolding: null == totalLandHolding
            ? _value.totalLandHolding
            : totalLandHolding // ignore: cast_nullable_to_non_nullable
                  as double,
        altitude: null == altitude
            ? _value.altitude
            : altitude // ignore: cast_nullable_to_non_nullable
                  as double,
        soilType: null == soilType
            ? _value.soilType
            : soilType // ignore: cast_nullable_to_non_nullable
                  as String,
        noOfTrees: null == noOfTrees
            ? _value.noOfTrees
            : noOfTrees // ignore: cast_nullable_to_non_nullable
                  as int,
        polygonGeoJson: null == polygonGeoJson
            ? _value.polygonGeoJson
            : polygonGeoJson // ignore: cast_nullable_to_non_nullable
                  as String,
        boundaryArea: null == boundaryArea
            ? _value.boundaryArea
            : boundaryArea // ignore: cast_nullable_to_non_nullable
                  as double,
        geoCenterLat: freezed == geoCenterLat
            ? _value.geoCenterLat
            : geoCenterLat // ignore: cast_nullable_to_non_nullable
                  as double?,
        geoCenterLng: freezed == geoCenterLng
            ? _value.geoCenterLng
            : geoCenterLng // ignore: cast_nullable_to_non_nullable
                  as double?,
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
class _$FarmLandModelImpl extends _FarmLandModel {
  const _$FarmLandModelImpl({
    required this.id,
    this.tenantId = '',
    this.farmerId = '',
    this.farmName = '',
    this.plotBlockId = '',
    this.totalLandHolding = 0.0,
    this.altitude = 0.0,
    this.soilType = '',
    this.noOfTrees = 0,
    this.polygonGeoJson = '',
    this.boundaryArea = 0.0,
    this.geoCenterLat,
    this.geoCenterLng,
    this.createdAt,
    this.updatedAt,
  }) : super._();

  factory _$FarmLandModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$FarmLandModelImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey()
  final String tenantId;
  @override
  @JsonKey()
  final String farmerId;
  @override
  @JsonKey()
  final String farmName;
  @override
  @JsonKey()
  final String plotBlockId;
  @override
  @JsonKey()
  final double totalLandHolding;
  @override
  @JsonKey()
  final double altitude;
  @override
  @JsonKey()
  final String soilType;
  @override
  @JsonKey()
  final int noOfTrees;
  @override
  @JsonKey()
  final String polygonGeoJson;
  @override
  @JsonKey()
  final double boundaryArea;
  @override
  final double? geoCenterLat;
  @override
  final double? geoCenterLng;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;

  @override
  String toString() {
    return 'FarmLandModel(id: $id, tenantId: $tenantId, farmerId: $farmerId, farmName: $farmName, plotBlockId: $plotBlockId, totalLandHolding: $totalLandHolding, altitude: $altitude, soilType: $soilType, noOfTrees: $noOfTrees, polygonGeoJson: $polygonGeoJson, boundaryArea: $boundaryArea, geoCenterLat: $geoCenterLat, geoCenterLng: $geoCenterLng, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FarmLandModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tenantId, tenantId) ||
                other.tenantId == tenantId) &&
            (identical(other.farmerId, farmerId) ||
                other.farmerId == farmerId) &&
            (identical(other.farmName, farmName) ||
                other.farmName == farmName) &&
            (identical(other.plotBlockId, plotBlockId) ||
                other.plotBlockId == plotBlockId) &&
            (identical(other.totalLandHolding, totalLandHolding) ||
                other.totalLandHolding == totalLandHolding) &&
            (identical(other.altitude, altitude) ||
                other.altitude == altitude) &&
            (identical(other.soilType, soilType) ||
                other.soilType == soilType) &&
            (identical(other.noOfTrees, noOfTrees) ||
                other.noOfTrees == noOfTrees) &&
            (identical(other.polygonGeoJson, polygonGeoJson) ||
                other.polygonGeoJson == polygonGeoJson) &&
            (identical(other.boundaryArea, boundaryArea) ||
                other.boundaryArea == boundaryArea) &&
            (identical(other.geoCenterLat, geoCenterLat) ||
                other.geoCenterLat == geoCenterLat) &&
            (identical(other.geoCenterLng, geoCenterLng) ||
                other.geoCenterLng == geoCenterLng) &&
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
    farmerId,
    farmName,
    plotBlockId,
    totalLandHolding,
    altitude,
    soilType,
    noOfTrees,
    polygonGeoJson,
    boundaryArea,
    geoCenterLat,
    geoCenterLng,
    createdAt,
    updatedAt,
  );

  /// Create a copy of FarmLandModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FarmLandModelImplCopyWith<_$FarmLandModelImpl> get copyWith =>
      __$$FarmLandModelImplCopyWithImpl<_$FarmLandModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FarmLandModelImplToJson(this);
  }
}

abstract class _FarmLandModel extends FarmLandModel {
  const factory _FarmLandModel({
    required final String id,
    final String tenantId,
    final String farmerId,
    final String farmName,
    final String plotBlockId,
    final double totalLandHolding,
    final double altitude,
    final String soilType,
    final int noOfTrees,
    final String polygonGeoJson,
    final double boundaryArea,
    final double? geoCenterLat,
    final double? geoCenterLng,
    final DateTime? createdAt,
    final DateTime? updatedAt,
  }) = _$FarmLandModelImpl;
  const _FarmLandModel._() : super._();

  factory _FarmLandModel.fromJson(Map<String, dynamic> json) =
      _$FarmLandModelImpl.fromJson;

  @override
  String get id;
  @override
  String get tenantId;
  @override
  String get farmerId;
  @override
  String get farmName;
  @override
  String get plotBlockId;
  @override
  double get totalLandHolding;
  @override
  double get altitude;
  @override
  String get soilType;
  @override
  int get noOfTrees;
  @override
  String get polygonGeoJson;
  @override
  double get boundaryArea;
  @override
  double? get geoCenterLat;
  @override
  double? get geoCenterLng;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;

  /// Create a copy of FarmLandModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FarmLandModelImplCopyWith<_$FarmLandModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
