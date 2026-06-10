import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/config/app_config.dart';
import '../models/farmland_model.dart';

final farmlandRepositoryProvider = Provider<FarmLandRepository>((ref) {
  return FarmLandRepository();
});

class FarmLandRepository {
  Future<({List<FarmLandModel> farmlands, int total, int page, int totalPages})>
      getFarmLands({
    int page = 1,
    int limit = AppConfig.defaultPageSize,
    String? search,
    String? soilType,
    double? minAltitude,
    double? maxAltitude,
    double? minArea,
    double? maxArea,
    String? farmerId,
  }) async {
    final queryParameters = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    if (search != null && search.isNotEmpty) queryParameters['search'] = search;
    if (soilType != null && soilType.isNotEmpty) queryParameters['soilType'] = soilType;
    if (minAltitude != null) queryParameters['minAltitude'] = minAltitude;
    if (maxAltitude != null) queryParameters['maxAltitude'] = maxAltitude;
    if (minArea != null) queryParameters['minArea'] = minArea;
    if (maxArea != null) queryParameters['maxArea'] = maxArea;
    if (farmerId != null && farmerId.isNotEmpty) queryParameters['farmerId'] = farmerId;

    final data = await ApiClient.getMap('/farmlands', queryParameters: queryParameters);

    final List<dynamic> items = (data['data'] ?? data['items'] ?? data['farmlands'] ?? []) as List<dynamic>;
    final farmlands = items.map((e) => FarmLandModel.fromJson(e as Map<String, dynamic>)).toList();
    return (
      farmlands: farmlands,
      total: (data['total'] ?? farmlands.length) as int,
      page: (data['page'] ?? page) as int,
      totalPages: (data['totalPages'] ?? 1) as int,
    );
  }

  Future<FarmLandModel> getFarmLandById(String id) async {
    final data = await ApiClient.getMap('/farmlands/$id');
    return FarmLandModel.fromJson(data);
  }

  Future<FarmLandModel> createFarmLand(Map<String, dynamic> data) async {
    final response = await ApiClient.postMap('/farmlands', data: data);
    return FarmLandModel.fromJson(response);
  }

  Future<FarmLandModel> updateFarmLand(String id, Map<String, dynamic> data) async {
    final response = await ApiClient.putMap('/farmlands/$id', data: data);
    return FarmLandModel.fromJson(response);
  }

  Future<void> deleteFarmLand(String id) async {
    await ApiClient.delete('/farmlands/$id');
  }
}

// Providers

final farmlandsListProvider =
    StateNotifierProvider<FarmLandsListNotifier, AsyncValue<List<FarmLandModel>>>((ref) {
  return FarmLandsListNotifier(ref.watch(farmlandRepositoryProvider));
});

class FarmLandsListNotifier extends StateNotifier<AsyncValue<List<FarmLandModel>>> {
  final FarmLandRepository _repository;
  int _currentPage = 1;
  int _totalPages = 1;
  bool _hasMore = true;
  String _search = '';
  String? _soilType;
  double? _minAltitude;
  double? _maxAltitude;
  double? _minArea;
  double? _maxArea;
  String? _farmerId;

  FarmLandsListNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadFarmLands();
  }

  bool get hasMore => _hasMore;

  Future<void> loadFarmLands({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      state = const AsyncValue.loading();
    }

    try {
      final result = await _repository.getFarmLands(
        page: _currentPage,
        search: _search.isNotEmpty ? _search : null,
        soilType: _soilType,
        minAltitude: _minAltitude,
        maxAltitude: _maxAltitude,
        minArea: _minArea,
        maxArea: _maxArea,
        farmerId: _farmerId,
      );

      _totalPages = result.totalPages;
      _hasMore = _currentPage < _totalPages;

      if (refresh || _currentPage == 1) {
        state = AsyncValue.data(result.farmlands);
      } else {
        final current = state.value ?? [];
        state = AsyncValue.data([...current, ...result.farmlands]);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> loadMore() async {
    if (!_hasMore) return;
    _currentPage++;
    await loadFarmLands();
  }

  void setSearch(String search) {
    _search = search;
    loadFarmLands(refresh: true);
  }

  void setSoilType(String? soilType) {
    _soilType = soilType;
    loadFarmLands(refresh: true);
  }

  void setAltitudeRange(double? min, double? max) {
    _minAltitude = min;
    _maxAltitude = max;
    loadFarmLands(refresh: true);
  }

  void setAreaRange(double? min, double? max) {
    _minArea = min;
    _maxArea = max;
    loadFarmLands(refresh: true);
  }

  void setFarmerId(String? farmerId) {
    _farmerId = farmerId;
    loadFarmLands(refresh: true);
  }

  void clearFilters() {
    _search = '';
    _soilType = null;
    _minAltitude = null;
    _maxAltitude = null;
    _minArea = null;
    _maxArea = null;
    _farmerId = null;
    loadFarmLands(refresh: true);
  }
}

final farmlandDetailProvider = FutureProvider.family<FarmLandModel, String>((ref, id) {
  return ref.watch(farmlandRepositoryProvider).getFarmLandById(id);
});
