import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../models/trust_score_model.dart';

final trustScoreRepositoryProvider = Provider<TrustScoreRepository>((ref) {
  return TrustScoreRepository(ApiClient.dio);
});

class TrustScoreRepository {
  final Dio _dio;

  TrustScoreRepository(this._dio);

  Future<TrustScoreModel> getTrustScore() async {
    try {
      final response = await _dio.get('/v1/compliance/trust-score');
      return TrustScoreModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}

final trustScoreProvider =
    FutureProvider.autoDispose<TrustScoreModel>((ref) async {
  final repo = ref.watch(trustScoreRepositoryProvider);
  return repo.getTrustScore();
});
