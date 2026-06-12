import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../models/shipment_model.dart';

final shipmentRepositoryProvider = Provider<ShipmentRepository>((ref) {
  return ShipmentRepository(ApiClient.dio);
});

class ShipmentRepository {
  final Dio _dio;

  ShipmentRepository(this._dio);

  Future<List<ShipmentModel>> getShipments({
    ShipmentStatus? status,
    String? search,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) queryParams['status'] = status.name;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final response = await _dio.get(
        '/shipments',
        queryParameters: queryParams,
      );
      final data = response.data;
      final list = data is List ? data : (data['data'] as List? ?? []);
      return list
          .map((e) => ShipmentModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<ShipmentModel> getShipment(String id) async {
    try {
      final response = await _dio.get('/shipments/$id');
      return ShipmentModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<ShipmentModel> createShipment(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/shipments', data: data);
      return ShipmentModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<ShipmentModel> updateShipment(
      String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('/shipments/$id', data: data);
      return ShipmentModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> deleteShipment(String id) async {
    try {
      await _dio.delete('/shipments/$id');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}

// ─── Riverpod Providers ───

final shipmentsProvider = FutureProvider.family
    .autoDispose<List<ShipmentModel>, Map<String, dynamic>>(
  (ref, params) async {
    final repo = ref.watch(shipmentRepositoryProvider);
    return repo.getShipments(
      status: params['status'] as ShipmentStatus?,
      search: params['search'] as String?,
    );
  },
);

final shipmentDetailProvider =
    FutureProvider.family.autoDispose<ShipmentModel, String>(
  (ref, id) async {
    final repo = ref.watch(shipmentRepositoryProvider);
    return repo.getShipment(id);
  },
);
