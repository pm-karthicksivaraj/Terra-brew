import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../models/trading_contract_model.dart';
import '../models/marketplace_listing_model.dart';
import '../models/buyer_model.dart';
import '../models/rfq_model.dart';

final tradingRepositoryProvider = Provider<TradingRepository>((ref) {
  return TradingRepository(ApiClient.dio);
});

class TradingRepository {
  final Dio _dio;

  TradingRepository(this._dio);

  // ─── Trading Contracts ───

  Future<List<TradingContractModel>> getContracts({
    ContractStatus? status,
    ContractType? type,
    String? search,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) queryParams['status'] = status.name;
      if (type != null) queryParams['contractType'] = type.name;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final response = await _dio.get(
        '/trading-desk',
        queryParameters: queryParams,
      );
      final data = response.data;
      final list = data is List ? data : (data['data'] as List? ?? []);
      return list
          .map((e) => TradingContractModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<TradingContractModel> createContract(
      Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/trading-desk', data: data);
      return TradingContractModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ─── Marketplace Listings ───

  Future<List<MarketplaceListingModel>> getMarketplaceListings({
    ListingStatus? status,
    String? coffeeType,
    String? search,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) queryParams['listingStatus'] = status.name;
      if (coffeeType != null) queryParams['coffeeType'] = coffeeType;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final response = await _dio.get(
        '/marketplace',
        queryParameters: queryParams,
      );
      final data = response.data;
      final list = data is List ? data : (data['data'] as List? ?? []);
      return list
          .map((e) =>
              MarketplaceListingModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<MarketplaceListingModel> createListing(
      Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/marketplace', data: data);
      return MarketplaceListingModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ─── RFQs ───

  Future<List<RFQModel>> getRFQs({
    RFQStatus? status,
    String? search,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) queryParams['status'] = status.name;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final response = await _dio.get('/rfq', queryParameters: queryParams);
      final data = response.data;
      final list = data is List ? data : (data['data'] as List? ?? []);
      return list
          .map((e) => RFQModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<RFQModel> createRFQ(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/rfq', data: data);
      return RFQModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ─── Buyers ───

  Future<List<BuyerModel>> getBuyers({
    BuyerType? type,
    String? search,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (type != null) queryParams['buyerType'] = type.name;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final response = await _dio.get('/buyers', queryParameters: queryParams);
      final data = response.data;
      final list = data is List ? data : (data['data'] as List? ?? []);
      return list
          .map((e) => BuyerModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<BuyerModel> createBuyer(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/buyers', data: data);
      return BuyerModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<BuyerModel> updateBuyer(String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('/buyers/$id', data: data);
      return BuyerModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> deleteBuyer(String id) async {
    try {
      await _dio.delete('/buyers/$id');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ─── Price Tickers ───

  Future<List<Map<String, dynamic>>> getPriceTickers() async {
    try {
      final response = await _dio.get('/price-tickers');
      final data = response.data;
      final list = data is List ? data : (data['data'] as List? ?? []);
      return list.cast<Map<String, dynamic>>();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ─── Coffee Prices ───

  Future<List<Map<String, dynamic>>> getCoffeePrices() async {
    try {
      final response = await _dio.get('/coffee-prices');
      final data = response.data;
      final list = data is List ? data : (data['data'] as List? ?? []);
      return list.cast<Map<String, dynamic>>();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}

// ─── Riverpod Providers ───

final contractsProvider = FutureProvider.family
    .autoDispose<List<TradingContractModel>, Map<String, dynamic>>(
  (ref, params) async {
    final repo = ref.watch(tradingRepositoryProvider);
    return repo.getContracts(
      status: params['status'] as ContractStatus?,
      type: params['type'] as ContractType?,
      search: params['search'] as String?,
    );
  },
);

final marketplaceListingsProvider = FutureProvider.family
    .autoDispose<List<MarketplaceListingModel>, Map<String, dynamic>>(
  (ref, params) async {
    final repo = ref.watch(tradingRepositoryProvider);
    return repo.getMarketplaceListings(
      status: params['status'] as ListingStatus?,
      coffeeType: params['coffeeType'] as String?,
      search: params['search'] as String?,
    );
  },
);

final rfqsProvider = FutureProvider.family
    .autoDispose<List<RFQModel>, Map<String, dynamic>>(
  (ref, params) async {
    final repo = ref.watch(tradingRepositoryProvider);
    return repo.getRFQs(
      status: params['status'] as RFQStatus?,
      search: params['search'] as String?,
    );
  },
);

final buyersProvider = FutureProvider.family
    .autoDispose<List<BuyerModel>, Map<String, dynamic>>(
  (ref, params) async {
    final repo = ref.watch(tradingRepositoryProvider);
    return repo.getBuyers(
      type: params['type'] as BuyerType?,
      search: params['search'] as String?,
    );
  },
);

final priceTickersProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>(
  (ref) async {
    final repo = ref.watch(tradingRepositoryProvider);
    return repo.getPriceTickers();
  },
);
