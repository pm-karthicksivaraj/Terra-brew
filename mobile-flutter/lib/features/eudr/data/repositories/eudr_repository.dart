import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/config/app_config.dart';
import '../models/eudr_compliance_model.dart';

final eudrRepositoryProvider = Provider<EudrRepository>((ref) {
  return EudrRepository();
});

class EudrRepository {
  Future<({List<EudrComplianceModel> records, int total, int page, int totalPages})>
      getComplianceRecords({
    int page = 1,
    int limit = AppConfig.defaultPageSize,
    String? search,
    EudrStatus? status,
    RiskLevel? riskLevel,
    String? batchId,
    String? farmerId,
  }) async {
    final queryParameters = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    if (search != null && search.isNotEmpty) queryParameters['search'] = search;
    if (status != null) queryParameters['status'] = status.name;
    if (riskLevel != null) queryParameters['riskLevel'] = riskLevel.name;
    if (batchId != null && batchId.isNotEmpty) queryParameters['batchId'] = batchId;
    if (farmerId != null && farmerId.isNotEmpty) queryParameters['farmerId'] = farmerId;

    final data = await ApiClient.getMap('/eudr-compliance', queryParameters: queryParameters);

    final List<dynamic> items = (data['data'] ?? data['items'] ?? data['records'] ?? []) as List<dynamic>;
    final records = items.map((e) => EudrComplianceModel.fromJson(e as Map<String, dynamic>)).toList();
    return (
      records: records,
      total: (data['total'] ?? records.length) as int,
      page: (data['page'] ?? page) as int,
      totalPages: (data['totalPages'] ?? 1) as int,
    );
  }

  Future<EudrComplianceModel> getComplianceById(String id) async {
    final data = await ApiClient.getMap('/eudr-compliance/$id');
    return EudrComplianceModel.fromJson(data);
  }

  Future<EudrComplianceModel> createCompliance(Map<String, dynamic> data) async {
    final response = await ApiClient.postMap('/eudr-compliance', data: data);
    return EudrComplianceModel.fromJson(response);
  }

  Future<EudrComplianceModel> updateCompliance(String id, Map<String, dynamic> data) async {
    final response = await ApiClient.putMap('/eudr-compliance/$id', data: data);
    return EudrComplianceModel.fromJson(response);
  }

  Future<void> deleteCompliance(String id) async {
    await ApiClient.delete('/eudr-compliance/$id');
  }

  Future<Map<String, dynamic>> calculateReadiness(String batchId) async {
    return ApiClient.postMap('/eudr-readiness/calculate', data: {'batchId': batchId});
  }

  Future<EudrReadinessReport> getReadinessReport() async {
    final data = await ApiClient.getMap('/eudr-readiness/report');
    return EudrReadinessReport.fromJson(data);
  }
}

// Providers

final eudrListProvider =
    StateNotifierProvider<EudrListNotifier, AsyncValue<List<EudrComplianceModel>>>((ref) {
  return EudrListNotifier(ref.watch(eudrRepositoryProvider));
});

class EudrListNotifier extends StateNotifier<AsyncValue<List<EudrComplianceModel>>> {
  final EudrRepository _repository;
  int _currentPage = 1;
  int _totalPages = 1;
  bool _hasMore = true;
  String _search = '';
  EudrStatus? _status;
  RiskLevel? _riskLevel;

  EudrListNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadRecords();
  }

  bool get hasMore => _hasMore;

  Future<void> loadRecords({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      state = const AsyncValue.loading();
    }

    try {
      final result = await _repository.getComplianceRecords(
        page: _currentPage,
        search: _search.isNotEmpty ? _search : null,
        status: _status,
        riskLevel: _riskLevel,
      );

      _totalPages = result.totalPages;
      _hasMore = _currentPage < _totalPages;

      if (refresh || _currentPage == 1) {
        state = AsyncValue.data(result.records);
      } else {
        final current = state.value ?? [];
        state = AsyncValue.data([...current, ...result.records]);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> loadMore() async {
    if (!_hasMore) return;
    _currentPage++;
    await loadRecords();
  }

  void setSearch(String search) {
    _search = search;
    loadRecords(refresh: true);
  }

  void setStatus(EudrStatus? status) {
    _status = status;
    loadRecords(refresh: true);
  }

  void setRiskLevel(RiskLevel? riskLevel) {
    _riskLevel = riskLevel;
    loadRecords(refresh: true);
  }

  void clearFilters() {
    _search = '';
    _status = null;
    _riskLevel = null;
    loadRecords(refresh: true);
  }
}

final eudrDetailProvider = FutureProvider.family<EudrComplianceModel, String>((ref, id) {
  return ref.watch(eudrRepositoryProvider).getComplianceById(id);
});

final eudrReadinessReportProvider = FutureProvider<EudrReadinessReport>((ref) {
  return ref.watch(eudrRepositoryProvider).getReadinessReport();
});
