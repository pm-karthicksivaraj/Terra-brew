import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/config/app_config.dart';
import '../models/farmer_model.dart';

final farmerRepositoryProvider = Provider<FarmerRepository>((ref) {
  return FarmerRepository();
});

class FarmerRepository {
  Future<({List<FarmerModel> farmers, int total, int page, int totalPages})>
      getFarmers({
    int page = 1,
    int limit = AppConfig.defaultPageSize,
    String? search,
    String? status,
    String? country,
    String? gender,
  }) async {
    final queryParameters = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    if (search != null && search.isNotEmpty) queryParameters['search'] = search;
    if (status != null && status.isNotEmpty) queryParameters['status'] = status;
    if (country != null && country.isNotEmpty) queryParameters['country'] = country;
    if (gender != null && gender.isNotEmpty) queryParameters['gender'] = gender;

    final data = await ApiClient.getMap('/farmers', queryParameters: queryParameters);

    final List<dynamic> items = (data['data'] ?? data['items'] ?? data['farmers'] ?? []) as List<dynamic>;
    final farmers = items.map((e) => FarmerModel.fromJson(e as Map<String, dynamic>)).toList();
    return (
      farmers: farmers,
      total: (data['total'] ?? farmers.length) as int,
      page: (data['page'] ?? page) as int,
      totalPages: (data['totalPages'] ?? 1) as int,
    );
  }

  Future<FarmerModel> getFarmerById(String id) async {
    final data = await ApiClient.getMap('/farmers/$id');
    return FarmerModel.fromJson(data);
  }

  Future<FarmerModel> createFarmer(Map<String, dynamic> data) async {
    final response = await ApiClient.postMap('/farmers', data: data);
    return FarmerModel.fromJson(response);
  }

  Future<FarmerModel> updateFarmer(String id, Map<String, dynamic> data) async {
    final response = await ApiClient.putMap('/farmers/$id', data: data);
    return FarmerModel.fromJson(response);
  }

  Future<void> deleteFarmer(String id) async {
    await ApiClient.delete('/farmers/$id');
  }
}

// Providers

final farmersListProvider = StateNotifierProvider<FarmersListNotifier, AsyncValue<List<FarmerModel>>>((ref) {
  return FarmersListNotifier(ref.watch(farmerRepositoryProvider));
});

class FarmersListNotifier extends StateNotifier<AsyncValue<List<FarmerModel>>> {
  final FarmerRepository _repository;
  int _currentPage = 1;
  int _totalPages = 1;
  bool _hasMore = true;
  String _search = '';
  String? _status;
  String? _country;
  String? _gender;

  FarmersListNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadFarmers();
  }

  bool get hasMore => _hasMore;

  Future<void> loadFarmers({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      state = const AsyncValue.loading();
    }

    try {
      final result = await _repository.getFarmers(
        page: _currentPage,
        search: _search.isNotEmpty ? _search : null,
        status: _status,
        country: _country,
        gender: _gender,
      );

      _totalPages = result.totalPages;
      _hasMore = _currentPage < _totalPages;

      if (refresh || _currentPage == 1) {
        state = AsyncValue.data(result.farmers);
      } else {
        final current = state.value ?? [];
        state = AsyncValue.data([...current, ...result.farmers]);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> loadMore() async {
    if (!_hasMore) return;
    _currentPage++;
    await loadFarmers();
  }

  void setSearch(String search) {
    _search = search;
    loadFarmers(refresh: true);
  }

  void setStatus(String? status) {
    _status = status;
    loadFarmers(refresh: true);
  }

  void setCountry(String? country) {
    _country = country;
    loadFarmers(refresh: true);
  }

  void setGender(String? gender) {
    _gender = gender;
    loadFarmers(refresh: true);
  }

  void clearFilters() {
    _search = '';
    _status = null;
    _country = null;
    _gender = null;
    loadFarmers(refresh: true);
  }
}

final farmerDetailProvider = FutureProvider.family<FarmerModel, String>((ref, id) {
  return ref.watch(farmerRepositoryProvider).getFarmerById(id);
});
