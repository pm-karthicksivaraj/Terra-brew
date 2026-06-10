import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../models/tenant_model.dart';
import '../models/price_ticker_model.dart';

final superAdminRepositoryProvider = Provider<SuperAdminRepository>((ref) {
  return SuperAdminRepository(ApiClient.dio);
});

class SuperAdminRepository {
  final Dio _dio;

  SuperAdminRepository(this._dio);

  // ─── Tenants ───

  Future<List<TenantModel>> getTenants({
    String? search,
    EntityType? entityType,
    SubscriptionPlan? plan,
    SubscriptionStatus? status,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (search != null && search.isNotEmpty) queryParams['search'] = search;
      if (entityType != null) queryParams['entityType'] = entityType.name;
      if (plan != null) queryParams['plan'] = plan.name;
      if (status != null) queryParams['subscriptionStatus'] = status.name;

      final response = await _dio.get(
        '/tenants/list',
        queryParameters: queryParams,
      );
      final data = response.data;
      final list = data is List ? data : (data['data'] as List? ?? []);
      return list
          .map((e) => TenantModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<TenantModel> getTenant(String id) async {
    try {
      final response = await _dio.get('/tenants/$id');
      return TenantModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<TenantModel> createTenant(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/tenants', data: data);
      return TenantModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ─── Price Tickers ───

  Future<List<PriceTickerModel>> getPriceTickers() async {
    try {
      final response = await _dio.get('/price-tickers');
      final data = response.data;
      final list = data is List ? data : (data['data'] as List? ?? []);
      return list
          .map((e) => PriceTickerModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<PriceTickerModel> createPriceTicker(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/price-tickers', data: data);
      return PriceTickerModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<PriceTickerModel> updatePriceTicker(
      String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('/price-tickers/$id', data: data);
      return PriceTickerModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> deletePriceTicker(String id) async {
    try {
      await _dio.delete('/price-tickers/$id');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ─── Dashboard Stats ───

  Future<Map<String, dynamic>> getDashboardStats() async {
    try {
      final response = await _dio.get('/dashboard/stats');
      return response.data is Map<String, dynamic>
          ? response.data
          : {'data': response.data};
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}

// ─── Riverpod Providers ───

final tenantsProvider = FutureProvider.family
    .autoDispose<List<TenantModel>, Map<String, dynamic>>(
  (ref, params) async {
    final repo = ref.watch(superAdminRepositoryProvider);
    return repo.getTenants(
      search: params['search'] as String?,
      entityType: params['entityType'] as EntityType?,
      plan: params['plan'] as SubscriptionPlan?,
      status: params['status'] as SubscriptionStatus?,
    );
  },
);

final priceTickersAdminProvider =
    FutureProvider.autoDispose<List<PriceTickerModel>>((ref) async {
  final repo = ref.watch(superAdminRepositoryProvider);
  return repo.getPriceTickers();
});

final dashboardStatsProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final repo = ref.watch(superAdminRepositoryProvider);
  return repo.getDashboardStats();
});
