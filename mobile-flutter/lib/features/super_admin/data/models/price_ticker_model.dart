class PriceTickerModel {
  final String id;
  final String commodity;
  final double price;
  final String currency;
  final double change;
  final double changePercent;
  final String unit;
  final String source;
  final double? high52w;
  final double? low52w;
  final DateTime? lastUpdated;

  const PriceTickerModel({
    required this.id,
    required this.commodity,
    required this.price,
    required this.currency,
    required this.change,
    required this.changePercent,
    required this.unit,
    required this.source,
    this.high52w,
    this.low52w,
    this.lastUpdated,
  });

  factory PriceTickerModel.fromJson(Map<String, dynamic> json) {
    return PriceTickerModel(
      id: json['id'] as String? ?? '',
      commodity: json['commodity'] as String? ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      currency: json['currency'] as String? ?? '\$',
      change: (json['change'] as num?)?.toDouble() ?? 0,
      changePercent: (json['changePercent'] as num?)?.toDouble() ?? 0,
      unit: json['unit'] as String? ?? '/kg',
      source: json['source'] as String? ?? '',
      high52w: (json['high52w'] as num?)?.toDouble(),
      low52w: (json['low52w'] as num?)?.toDouble(),
      lastUpdated: json['lastUpdated'] != null
          ? DateTime.tryParse(json['lastUpdated'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'commodity': commodity,
        'price': price,
        'currency': currency,
        'change': change,
        'changePercent': changePercent,
        'unit': unit,
        'source': source,
        'high52w': high52w,
        'low52w': low52w,
        'lastUpdated': lastUpdated?.toIso8601String(),
      };

  bool get isUp => change >= 0;

  String get formattedPrice => '$currency${price.toStringAsFixed(2)}';

  String get formattedChange {
    final sign = isUp ? '+' : '';
    return '$sign${change.toStringAsFixed(2)} ($sign${changePercent.toStringAsFixed(2)}%)';
  }

  String get formattedRange {
    if (high52w == null || low52w == null) return 'N/A';
    return '$currency${low52w!.toStringAsFixed(2)} - $currency${high52w!.toStringAsFixed(2)}';
  }
}
