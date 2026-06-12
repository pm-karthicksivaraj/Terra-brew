// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'farmer_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

FarmerModel _$FarmerModelFromJson(Map<String, dynamic> json) {
  return _FarmerModel.fromJson(json);
}

/// @nodoc
mixin _$FarmerModel {
  String get id => throw _privateConstructorUsedError;
  String get tenantId => throw _privateConstructorUsedError;
  String get farmerCode => throw _privateConstructorUsedError;
  String get fullName => throw _privateConstructorUsedError;
  String get contactNumber => throw _privateConstructorUsedError;
  bool get isCertified => throw _privateConstructorUsedError;
  String get gender => throw _privateConstructorUsedError;
  String? get dob => throw _privateConstructorUsedError;
  String get country => throw _privateConstructorUsedError;
  String get province => throw _privateConstructorUsedError;
  String get district => throw _privateConstructorUsedError;
  String get commune => throw _privateConstructorUsedError;
  String get village => throw _privateConstructorUsedError;
  double? get latitude => throw _privateConstructorUsedError;
  double? get longitude => throw _privateConstructorUsedError;
  int get creditScore => throw _privateConstructorUsedError;
  String get bankName => throw _privateConstructorUsedError;
  String get accountNumber => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this FarmerModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FarmerModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FarmerModelCopyWith<FarmerModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FarmerModelCopyWith<$Res> {
  factory $FarmerModelCopyWith(
    FarmerModel value,
    $Res Function(FarmerModel) then,
  ) = _$FarmerModelCopyWithImpl<$Res, FarmerModel>;
  @useResult
  $Res call({
    String id,
    String tenantId,
    String farmerCode,
    String fullName,
    String contactNumber,
    bool isCertified,
    String gender,
    String? dob,
    String country,
    String province,
    String district,
    String commune,
    String village,
    double? latitude,
    double? longitude,
    int creditScore,
    String bankName,
    String accountNumber,
    DateTime? createdAt,
    DateTime? updatedAt,
  });
}

/// @nodoc
class _$FarmerModelCopyWithImpl<$Res, $Val extends FarmerModel>
    implements $FarmerModelCopyWith<$Res> {
  _$FarmerModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FarmerModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? farmerCode = null,
    Object? fullName = null,
    Object? contactNumber = null,
    Object? isCertified = null,
    Object? gender = null,
    Object? dob = freezed,
    Object? country = null,
    Object? province = null,
    Object? district = null,
    Object? commune = null,
    Object? village = null,
    Object? latitude = freezed,
    Object? longitude = freezed,
    Object? creditScore = null,
    Object? bankName = null,
    Object? accountNumber = null,
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
            farmerCode: null == farmerCode
                ? _value.farmerCode
                : farmerCode // ignore: cast_nullable_to_non_nullable
                      as String,
            fullName: null == fullName
                ? _value.fullName
                : fullName // ignore: cast_nullable_to_non_nullable
                      as String,
            contactNumber: null == contactNumber
                ? _value.contactNumber
                : contactNumber // ignore: cast_nullable_to_non_nullable
                      as String,
            isCertified: null == isCertified
                ? _value.isCertified
                : isCertified // ignore: cast_nullable_to_non_nullable
                      as bool,
            gender: null == gender
                ? _value.gender
                : gender // ignore: cast_nullable_to_non_nullable
                      as String,
            dob: freezed == dob
                ? _value.dob
                : dob // ignore: cast_nullable_to_non_nullable
                      as String?,
            country: null == country
                ? _value.country
                : country // ignore: cast_nullable_to_non_nullable
                      as String,
            province: null == province
                ? _value.province
                : province // ignore: cast_nullable_to_non_nullable
                      as String,
            district: null == district
                ? _value.district
                : district // ignore: cast_nullable_to_non_nullable
                      as String,
            commune: null == commune
                ? _value.commune
                : commune // ignore: cast_nullable_to_non_nullable
                      as String,
            village: null == village
                ? _value.village
                : village // ignore: cast_nullable_to_non_nullable
                      as String,
            latitude: freezed == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double?,
            longitude: freezed == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double?,
            creditScore: null == creditScore
                ? _value.creditScore
                : creditScore // ignore: cast_nullable_to_non_nullable
                      as int,
            bankName: null == bankName
                ? _value.bankName
                : bankName // ignore: cast_nullable_to_non_nullable
                      as String,
            accountNumber: null == accountNumber
                ? _value.accountNumber
                : accountNumber // ignore: cast_nullable_to_non_nullable
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
abstract class _$$FarmerModelImplCopyWith<$Res>
    implements $FarmerModelCopyWith<$Res> {
  factory _$$FarmerModelImplCopyWith(
    _$FarmerModelImpl value,
    $Res Function(_$FarmerModelImpl) then,
  ) = __$$FarmerModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String tenantId,
    String farmerCode,
    String fullName,
    String contactNumber,
    bool isCertified,
    String gender,
    String? dob,
    String country,
    String province,
    String district,
    String commune,
    String village,
    double? latitude,
    double? longitude,
    int creditScore,
    String bankName,
    String accountNumber,
    DateTime? createdAt,
    DateTime? updatedAt,
  });
}

/// @nodoc
class __$$FarmerModelImplCopyWithImpl<$Res>
    extends _$FarmerModelCopyWithImpl<$Res, _$FarmerModelImpl>
    implements _$$FarmerModelImplCopyWith<$Res> {
  __$$FarmerModelImplCopyWithImpl(
    _$FarmerModelImpl _value,
    $Res Function(_$FarmerModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FarmerModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tenantId = null,
    Object? farmerCode = null,
    Object? fullName = null,
    Object? contactNumber = null,
    Object? isCertified = null,
    Object? gender = null,
    Object? dob = freezed,
    Object? country = null,
    Object? province = null,
    Object? district = null,
    Object? commune = null,
    Object? village = null,
    Object? latitude = freezed,
    Object? longitude = freezed,
    Object? creditScore = null,
    Object? bankName = null,
    Object? accountNumber = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(
      _$FarmerModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        tenantId: null == tenantId
            ? _value.tenantId
            : tenantId // ignore: cast_nullable_to_non_nullable
                  as String,
        farmerCode: null == farmerCode
            ? _value.farmerCode
            : farmerCode // ignore: cast_nullable_to_non_nullable
                  as String,
        fullName: null == fullName
            ? _value.fullName
            : fullName // ignore: cast_nullable_to_non_nullable
                  as String,
        contactNumber: null == contactNumber
            ? _value.contactNumber
            : contactNumber // ignore: cast_nullable_to_non_nullable
                  as String,
        isCertified: null == isCertified
            ? _value.isCertified
            : isCertified // ignore: cast_nullable_to_non_nullable
                  as bool,
        gender: null == gender
            ? _value.gender
            : gender // ignore: cast_nullable_to_non_nullable
                  as String,
        dob: freezed == dob
            ? _value.dob
            : dob // ignore: cast_nullable_to_non_nullable
                  as String?,
        country: null == country
            ? _value.country
            : country // ignore: cast_nullable_to_non_nullable
                  as String,
        province: null == province
            ? _value.province
            : province // ignore: cast_nullable_to_non_nullable
                  as String,
        district: null == district
            ? _value.district
            : district // ignore: cast_nullable_to_non_nullable
                  as String,
        commune: null == commune
            ? _value.commune
            : commune // ignore: cast_nullable_to_non_nullable
                  as String,
        village: null == village
            ? _value.village
            : village // ignore: cast_nullable_to_non_nullable
                  as String,
        latitude: freezed == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double?,
        longitude: freezed == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double?,
        creditScore: null == creditScore
            ? _value.creditScore
            : creditScore // ignore: cast_nullable_to_non_nullable
                  as int,
        bankName: null == bankName
            ? _value.bankName
            : bankName // ignore: cast_nullable_to_non_nullable
                  as String,
        accountNumber: null == accountNumber
            ? _value.accountNumber
            : accountNumber // ignore: cast_nullable_to_non_nullable
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
class _$FarmerModelImpl extends _FarmerModel {
  const _$FarmerModelImpl({
    required this.id,
    this.tenantId = '',
    this.farmerCode = '',
    this.fullName = '',
    this.contactNumber = '',
    this.isCertified = false,
    this.gender = '',
    this.dob,
    this.country = '',
    this.province = '',
    this.district = '',
    this.commune = '',
    this.village = '',
    this.latitude,
    this.longitude,
    this.creditScore = 0,
    this.bankName = '',
    this.accountNumber = '',
    this.createdAt,
    this.updatedAt,
  }) : super._();

  factory _$FarmerModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$FarmerModelImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey()
  final String tenantId;
  @override
  @JsonKey()
  final String farmerCode;
  @override
  @JsonKey()
  final String fullName;
  @override
  @JsonKey()
  final String contactNumber;
  @override
  @JsonKey()
  final bool isCertified;
  @override
  @JsonKey()
  final String gender;
  @override
  final String? dob;
  @override
  @JsonKey()
  final String country;
  @override
  @JsonKey()
  final String province;
  @override
  @JsonKey()
  final String district;
  @override
  @JsonKey()
  final String commune;
  @override
  @JsonKey()
  final String village;
  @override
  final double? latitude;
  @override
  final double? longitude;
  @override
  @JsonKey()
  final int creditScore;
  @override
  @JsonKey()
  final String bankName;
  @override
  @JsonKey()
  final String accountNumber;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;

  @override
  String toString() {
    return 'FarmerModel(id: $id, tenantId: $tenantId, farmerCode: $farmerCode, fullName: $fullName, contactNumber: $contactNumber, isCertified: $isCertified, gender: $gender, dob: $dob, country: $country, province: $province, district: $district, commune: $commune, village: $village, latitude: $latitude, longitude: $longitude, creditScore: $creditScore, bankName: $bankName, accountNumber: $accountNumber, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FarmerModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tenantId, tenantId) ||
                other.tenantId == tenantId) &&
            (identical(other.farmerCode, farmerCode) ||
                other.farmerCode == farmerCode) &&
            (identical(other.fullName, fullName) ||
                other.fullName == fullName) &&
            (identical(other.contactNumber, contactNumber) ||
                other.contactNumber == contactNumber) &&
            (identical(other.isCertified, isCertified) ||
                other.isCertified == isCertified) &&
            (identical(other.gender, gender) || other.gender == gender) &&
            (identical(other.dob, dob) || other.dob == dob) &&
            (identical(other.country, country) || other.country == country) &&
            (identical(other.province, province) ||
                other.province == province) &&
            (identical(other.district, district) ||
                other.district == district) &&
            (identical(other.commune, commune) || other.commune == commune) &&
            (identical(other.village, village) || other.village == village) &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude) &&
            (identical(other.creditScore, creditScore) ||
                other.creditScore == creditScore) &&
            (identical(other.bankName, bankName) ||
                other.bankName == bankName) &&
            (identical(other.accountNumber, accountNumber) ||
                other.accountNumber == accountNumber) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    tenantId,
    farmerCode,
    fullName,
    contactNumber,
    isCertified,
    gender,
    dob,
    country,
    province,
    district,
    commune,
    village,
    latitude,
    longitude,
    creditScore,
    bankName,
    accountNumber,
    createdAt,
    updatedAt,
  ]);

  /// Create a copy of FarmerModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FarmerModelImplCopyWith<_$FarmerModelImpl> get copyWith =>
      __$$FarmerModelImplCopyWithImpl<_$FarmerModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FarmerModelImplToJson(this);
  }
}

abstract class _FarmerModel extends FarmerModel {
  const factory _FarmerModel({
    required final String id,
    final String tenantId,
    final String farmerCode,
    final String fullName,
    final String contactNumber,
    final bool isCertified,
    final String gender,
    final String? dob,
    final String country,
    final String province,
    final String district,
    final String commune,
    final String village,
    final double? latitude,
    final double? longitude,
    final int creditScore,
    final String bankName,
    final String accountNumber,
    final DateTime? createdAt,
    final DateTime? updatedAt,
  }) = _$FarmerModelImpl;
  const _FarmerModel._() : super._();

  factory _FarmerModel.fromJson(Map<String, dynamic> json) =
      _$FarmerModelImpl.fromJson;

  @override
  String get id;
  @override
  String get tenantId;
  @override
  String get farmerCode;
  @override
  String get fullName;
  @override
  String get contactNumber;
  @override
  bool get isCertified;
  @override
  String get gender;
  @override
  String? get dob;
  @override
  String get country;
  @override
  String get province;
  @override
  String get district;
  @override
  String get commune;
  @override
  String get village;
  @override
  double? get latitude;
  @override
  double? get longitude;
  @override
  int get creditScore;
  @override
  String get bankName;
  @override
  String get accountNumber;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;

  /// Create a copy of FarmerModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FarmerModelImplCopyWith<_$FarmerModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
