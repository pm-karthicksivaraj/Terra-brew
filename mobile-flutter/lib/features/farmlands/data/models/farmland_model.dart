import 'package:freezed_annotation/freezed_annotation.dart';

part 'farmland_model.freezed.dart';
part 'farmland_model.g.dart';

@freezed
class FarmLandModel with _$FarmLandModel {
  const factory FarmLandModel({
    required String id,
    @Default('') String tenantId,
    @Default('') String farmerId,
    @Default('') String farmName,
    @Default('') String plotBlockId,
    @Default(0.0) double totalLandHolding,
    @Default(0.0) double altitude,
    @Default('') String soilType,
    @Default(0) int noOfTrees,
    @Default('') String polygonGeoJson,
    @Default(0.0) double boundaryArea,
    double? geoCenterLat,
    double? geoCenterLng,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _FarmLandModel;

  const FarmLandModel._();

  factory FarmLandModel.fromJson(Map<String, dynamic> json) =>
      _$FarmLandModelFromJson(json);

  String get areaDisplay => '${boundaryArea.toStringAsFixed(2)} ha';

  String get altitudeDisplay => '${altitude.toStringAsFixed(0)} masl';

  double get treeDensity =>
      boundaryArea > 0 ? noOfTrees / boundaryArea : 0;

  String get treeDensityDisplay =>
      treeDensity > 0 ? '${treeDensity.toStringAsFixed(0)} trees/ha' : 'N/A';

  String get soilTypeDisplay => soilType.isNotEmpty ? soilType : 'Not specified';
}
