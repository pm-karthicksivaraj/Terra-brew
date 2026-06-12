import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class PriceTickerBanner extends StatefulWidget {
  final List<Map<String, dynamic>> tickers;

  const PriceTickerBanner({
    super.key,
    required this.tickers,
  });

  @override
  State<PriceTickerBanner> createState() => _PriceTickerBannerState();
}

class _PriceTickerBannerState extends State<PriceTickerBanner> {
  late ScrollController _scrollController;
  Timer? _autoScrollTimer;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _startAutoScroll();
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  void _startAutoScroll() {
    _autoScrollTimer = Timer.periodic(const Duration(milliseconds: 30), (_) {
      if (_scrollController.hasClients) {
        final maxScroll = _scrollController.position.maxScrollExtent;
        final currentScroll = _scrollController.position.pixels;
        if (currentScroll >= maxScroll) {
          _scrollController.jumpTo(0);
        } else {
          _scrollController.jumpTo(currentScroll + 0.8);
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (widget.tickers.isEmpty) {
      return Container(
        height: 40,
        color: AppColors.primary,
        child: const Center(
          child: Text(
            'Loading prices...',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
        ),
      );
    }

    // Duplicate the list for infinite scroll effect
    final items = [...widget.tickers, ...widget.tickers];

    return Container(
      height: 40,
      decoration: BoxDecoration(
        color: AppColors.primary,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListView.separated(
        controller: _scrollController,
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: items.length,
        separatorBuilder: (_, __) => SizedBox(
          width: 1,
          child: Center(
            child: Container(
              height: 16,
              color: Colors.white24,
            ),
          ),
        ),
        itemBuilder: (context, index) {
          final ticker = items[index];
          final change = (ticker['changePercent'] as num?)?.toDouble() ?? 0.0;
          final isUp = change >= 0;

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  ticker['commodity'] ?? 'N/A',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  '${ticker['currency'] ?? '\$'}${(ticker['price'] as num?)?.toStringAsFixed(2) ?? '0.00'}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(width: 4),
                Icon(
                  isUp ? Icons.trending_up : Icons.trending_down,
                  size: 12,
                  color: isUp ? AppColors.success : AppColors.danger,
                ),
                const SizedBox(width: 2),
                Text(
                  '${isUp ? '+' : ''}${change.toStringAsFixed(2)}%',
                  style: TextStyle(
                    color: isUp ? AppColors.success : AppColors.danger,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
