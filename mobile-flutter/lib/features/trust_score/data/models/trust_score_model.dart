class TrustScoreModel {
  final int score;
  final String grade;
  final DateTime lastUpdated;
  final List<ScoreFactor> factors;
  final TrustScoreTrend? trend;
  final int? industryAverage;

  const TrustScoreModel({
    required this.score,
    required this.grade,
    required this.lastUpdated,
    this.factors = const [],
    this.trend,
    this.industryAverage,
  });

  factory TrustScoreModel.fromJson(Map<String, dynamic> json) {
    return TrustScoreModel(
      score: (json['score'] as num?)?.toInt() ?? 0,
      grade: json['grade'] as String? ?? 'F',
      lastUpdated: json['lastUpdated'] != null
          ? DateTime.tryParse(json['lastUpdated'].toString()) ?? DateTime.now()
          : DateTime.now(),
      factors: (json['factors'] as List?)
              ?.map((e) => ScoreFactor.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      trend: json['trend'] != null
          ? TrustScoreTrend.fromJson(json['trend'] as Map<String, dynamic>)
          : null,
      industryAverage: (json['industryAverage'] as num?)?.toInt(),
    );
  }

  Map<String, dynamic> toJson() => {
        'score': score,
        'grade': grade,
        'lastUpdated': lastUpdated.toIso8601String(),
        'factors': factors.map((e) => e.toJson()).toList(),
        'trend': trend?.toJson(),
        'industryAverage': industryAverage,
      };

  /// Color based on score range
  /// NEVER expose the algorithm - this is purely for display purposes
  ColorType get colorType {
    if (score >= 85) return ColorType.excellent;
    if (score >= 70) return ColorType.good;
    if (score >= 55) return ColorType.fair;
    if (score >= 40) return ColorType.poor;
    return ColorType.critical;
  }

  String get gradeDescription {
    switch (grade) {
      case 'A+':
        return 'Exceptional';
      case 'A':
        return 'Excellent';
      case 'B':
        return 'Good';
      case 'C':
        return 'Fair';
      case 'D':
        return 'Needs Improvement';
      case 'F':
        return 'Critical';
      default:
        return 'Unknown';
    }
  }

  bool get isAboveIndustryAverage =>
      industryAverage != null && score > industryAverage!;

  int get differenceFromAverage =>
      industryAverage != null ? score - industryAverage! : 0;
}

class ScoreFactor {
  final String name;
  final String description;
  final bool isPositive;

  const ScoreFactor({
    required this.name,
    required this.description,
    required this.isPositive,
  });

  factory ScoreFactor.fromJson(Map<String, dynamic> json) {
    return ScoreFactor(
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      isPositive: json['isPositive'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'description': description,
        'isPositive': isPositive,
      };
}

class TrustScoreTrend {
  final List<TrustScoreDataPoint> dataPoints;
  final int trendDirection; // -1, 0, 1

  const TrustScoreTrend({
    this.dataPoints = const [],
    this.trendDirection = 0,
  });

  factory TrustScoreTrend.fromJson(Map<String, dynamic> json) {
    return TrustScoreTrend(
      dataPoints: (json['dataPoints'] as List?)
              ?.map((e) =>
                  TrustScoreDataPoint.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      trendDirection: (json['trendDirection'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'dataPoints': dataPoints.map((e) => e.toJson()).toList(),
        'trendDirection': trendDirection,
      };

  String get trendLabel {
    if (trendDirection > 0) return 'Improving';
    if (trendDirection < 0) return 'Declining';
    return 'Stable';
  }
}

class TrustScoreDataPoint {
  final DateTime date;
  final int score;

  const TrustScoreDataPoint({
    required this.date,
    required this.score,
  });

  factory TrustScoreDataPoint.fromJson(Map<String, dynamic> json) {
    return TrustScoreDataPoint(
      date: json['date'] != null
          ? DateTime.tryParse(json['date'].toString()) ?? DateTime.now()
          : DateTime.now(),
      score: (json['score'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'date': date.toIso8601String(),
        'score': score,
      };
}

enum ColorType { excellent, good, fair, poor, critical }
