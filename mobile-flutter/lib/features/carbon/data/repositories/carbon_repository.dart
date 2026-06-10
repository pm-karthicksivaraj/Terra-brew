import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../models/carbon_tracking_model.dart';

final carbonRepositoryProvider = Provider<CarbonRepository>((ref) {
  return CarbonRepository(ApiClient.dio);
});

class CarbonRepository {
  final Dio _dio;

  CarbonRepository(this._dio);

  Future<List<CarbonTrackingModel>> getCarbonRecords({
    String? batchId,
    String? farmerId,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (batchId != null) queryParams['batchId'] = batchId;
      if (farmerId != null) queryParams['farmerId'] = farmerId;
      if (startDate != null) queryParams['startDate'] = startDate.toIso8601String();
      if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();

      final response = await _dio.get(
        '/carbon-tracking',
        queryParameters: queryParams,
      );
      final data = response.data;
      final list = data is List ? data : (data['data'] as List? ?? []);
      return list
          .map((e) => CarbonTrackingModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<CarbonTrackingModel> getCarbonRecord(String id) async {
    try {
      final response = await _dio.get('/carbon-tracking/$id');
      return CarbonTrackingModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<CarbonTrackingModel> createCarbonRecord(
      Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/carbon-tracking', data: data);
      return CarbonTrackingModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<CarbonTrackingModel> updateCarbonRecord(
      String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('/carbon-tracking/$id', data: data);
      return CarbonTrackingModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> deleteCarbonRecord(String id) async {
    try {
      await _dio.delete('/carbon-tracking/$id');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}

// ─── Riverpod Providers ───

final carbonRecordsProvider = FutureProvider.family
    .autoDispose<List<CarbonTrackingModel>, Map<String, dynamic>>(
  (ref, params) async {
    final repo = ref.watch(carbonRepositoryProvider);
    return repo.getCarbonRecords(
      batchId: params['batchId'] as String?,
      farmerId: params['farmerId'] as String?,
      startDate: params['startDate'] as DateTime?,
      endDate: params['endDate'] as DateTime?,
    );
  },
);

final carbonRecordDetailProvider =
    FutureProvider.family.autoDispose<CarbonTrackingModel, String>(
  (ref, id) async {
    final repo = ref.watch(carbonRepositoryProvider);
    return repo.getCarbonRecord(id);
  },
);
