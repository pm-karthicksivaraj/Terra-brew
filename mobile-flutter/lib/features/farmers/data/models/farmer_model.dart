import 'package:freezed_annotation/freezed_annotation.dart';

part 'farmer_model.freezed.dart';
part 'farmer_model.g.dart';

@freezed
class FarmerModel with _$FarmerModel {
  const factory FarmerModel({
    required String id,
    @Default('') String tenantId,
    @Default('') String farmerCode,
    @Default('') String fullName,
    @Default('') String contactNumber,
    @Default(false) bool isCertified,
    @Default('') String gender,
    String? dob,
    @Default('') String country,
    @Default('') String province,
    @Default('') String district,
    @Default('') String commune,
    @Default('') String village,
    double? latitude,
    double? longitude,
    @Default(0) int creditScore,
    @Default('') String bankName,
    @Default('') String accountNumber,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _FarmerModel;

  const FarmerModel._();

  factory FarmerModel.fromJson(Map<String, dynamic> json) =>
      _$FarmerModelFromJson(json);

  String get initials {
    final parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return fullName.isNotEmpty ? fullName[0].toUpperCase() : '?';
  }

  String get locationDisplay {
    final parts = [village, commune, district, province, country]
        .where((p) => p.isNotEmpty)
        .toList();
    return parts.join(', ');
  }

  String get displayDob => dob ?? 'Not set';
}

class FarmerModelConverter implements JsonConverter<FarmerModel, Map<String, dynamic>> {
  const FarmerModelConverter();

  @override
  FarmerModel fromJson(Map<String, dynamic> json) => FarmerModel.fromJson(json);

  @override
  Map<String, dynamic> toJson(FarmerModel object) => object.toJson();
}
