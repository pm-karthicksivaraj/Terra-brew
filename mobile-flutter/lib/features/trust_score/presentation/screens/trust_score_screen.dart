import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/trust_score_model.dart';
import '../../data/repositories/trust_score_repository.dart';
import '../widgets/score_gauge.dart';

class TrustScoreScreen extends ConsumerWidget {
  const TrustScoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trustScoreAsync = ref.watch(trustScoreProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text(
          'Trust Score',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () => _showInfoDialog(context),
          ),
        ],
      ),
      body: trustScoreAsync.when(
        data: (trustScore) => RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async => ref.invalidate(trustScoreProvider),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Score gauge
                _buildScoreHero(trustScore),
                const SizedBox(height: 24),
                // Comparison with industry
                if (trustScore.industryAverage != null) ...[
                  _buildComparisonCard(trustScore),
                  const SizedBox(height: 16),
                ],
                // Score factors
                _buildFactorsCard(trustScore),
                const SizedBox(height: 16),
                // Trend chart
                if (trustScore.trend != null &&
                    trustScore.trend!.dataPoints.isNotEmpty) ...[
                  _buildTrendCard(trustScore),
                  const SizedBox(height: 16),
                ],
                // How to improve
                _buildImproveSection(trustScore),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (err, _) => _buildErrorState(context, ref, err.toString()),
      ),
    );
  }

  Widget _buildScoreHero(TrustScoreModel trustScore) {
    final color = _getScoreColor(trustScore.score);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          ScoreGauge(
            score: trustScore.score,
            grade: trustScore.grade,
            size: 200,
          ),
          const SizedBox(height: 16),
          Text(
            trustScore.gradeDescription,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Last updated: ${DateFormat('dd MMM yyyy, HH:mm').format(trustScore.lastUpdated)}',
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComparisonCard(TrustScoreModel trustScore) {
    final isAbove = trustScore.isAboveIndustryAverage;
    final diff = trustScore.differenceFromAverage;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isAbove
            ? AppColors.success.withValues(alpha: 0.06)
            : AppColors.warning.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isAbove
              ? AppColors.success.withValues(alpha: 0.2)
              : AppColors.warning.withValues(alpha: 0.2),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: (isAbove ? AppColors.success : AppColors.warning)
                  .withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              isAbove ? Icons.trending_up : Icons.trending_down,
              color: isAbove ? AppColors.success : AppColors.warning,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAbove
                      ? 'Above Industry Average'
                      : 'Below Industry Average',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color:
                        isAbove ? AppColors.success : AppColors.warning,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Industry avg: ${trustScore.industryAverage} | Your score: ${trustScore.score} (${diff > 0 ? '+' : ''}$diff pts)',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFactorsCard(TrustScoreModel trustScore) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.fact_check_outlined, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Score Factors',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Key factors influencing your trust score',
            style: TextStyle(fontSize: 12, color: AppColors.textTertiary),
          ),
          const SizedBox(height: 14),
          if (trustScore.factors.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Center(
                child: Text(
                  'No factors available',
                  style: TextStyle(
                      fontSize: 13, color: AppColors.textTertiary),
                ),
              ),
            )
          else
            ...trustScore.factors.map(
              (factor) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 3),
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: factor.isPositive
                            ? AppColors.success.withValues(alpha: 0.12)
                            : AppColors.warning.withValues(alpha: 0.12),
                      ),
                      child: Icon(
                        factor.isPositive
                            ? Icons.check
                            : Icons.warning_amber,
                        size: 12,
                        color: factor.isPositive
                            ? AppColors.success
                            : AppColors.warning,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            factor.name,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 1),
                          Text(
                            factor.description,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTrendCard(TrustScoreModel trustScore) {
    final trend = trustScore.trend!;
    final trendColor = trend.trendDirection > 0
        ? AppColors.success
        : trend.trendDirection < 0
            ? AppColors.danger
            : AppColors.textSecondary;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.show_chart, size: 18, color: AppColors.primary),
                  SizedBox(width: 8),
                  Text(
                    'Score Trend',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: trendColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      trend.trendDirection > 0
                          ? Icons.trending_up
                          : trend.trendDirection < 0
                              ? Icons.trending_down
                              : Icons.trending_flat,
                      size: 12,
                      color: trendColor,
                    ),
                    const SizedBox(width: 3),
                    Text(
                      trend.trendLabel,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: trendColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Last 30 days',
            style: TextStyle(fontSize: 12, color: AppColors.textTertiary),
          ),
          const SizedBox(height: 14),
          SizedBox(
            height: 160,
            child: _TrendChart(dataPoints: trend.dataPoints),
          ),
        ],
      ),
    );
  }

  Widget _buildImproveSection(TrustScoreModel trustScore) {
    // Improvement suggestions based on current factors (never algorithmic)
    final suggestions = <Map<String, dynamic>>[
      {
        'icon': Icons.verified_user_outlined,
        'title': 'Maintain EUDR Compliance',
        'description':
            'Continue ensuring all coffee lots meet EUDR deforestation regulations.',
      },
      {
        'icon': Icons.description_outlined,
        'title': 'Complete Documentation',
        'description':
            'Ensure all shipment and traceability documents are complete and up to date.',
      },
      {
        'icon': Icons.eco_outlined,
        'title': 'Reduce Carbon Emissions',
        'description':
            'Work with farmers to implement sustainable practices that lower carbon output.',
      },
      {
        'icon': Icons.track_changes,
        'title': 'Improve Supply Chain Traceability',
        'description':
            'Enhance geo-tracking and farm-level data collection for full chain visibility.',
      },
      {
        'icon': Icons.handshake_outlined,
        'title': 'Strengthen Buyer Relationships',
        'description':
            'Build consistent trading patterns and maintain positive buyer interactions.',
      },
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.lightbulb_outline, size: 18, color: AppColors.gold),
              SizedBox(width: 8),
              Text(
                'How to Improve Your Score',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...suggestions.map(
            (s) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      s['icon'] as IconData,
                      size: 18,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          s['title'] as String,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          s['description'] as String,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getScoreColor(int score) {
    if (score >= 85) return AppColors.success;
    if (score >= 70) return AppColors.gold;
    if (score >= 55) return AppColors.warning;
    if (score >= 40) return const Color(0xFFE06030);
    return AppColors.danger;
  }

  Widget _buildErrorState(BuildContext context, WidgetRef ref, String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.danger),
            const SizedBox(height: 12),
            const Text('Failed to load trust score',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary)),
            const SizedBox(height: 4),
            Text(message,
                textAlign: TextAlign.center,
                style:
                    const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.invalidate(trustScoreProvider),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  void _showInfoDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        title: const Text(
          'About Trust Score',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        content: const Text(
          'Your Trust Score reflects your overall compliance and reliability as a coffee supply chain participant. '
          'It is computed from multiple verified factors including EUDR compliance, documentation completeness, '
          'carbon tracking, supply chain traceability, and trading history.\n\n'
          'The scoring algorithm is proprietary and is not disclosed to ensure fair and unbiased assessments. '
          'Focus on the score factors shown to understand what influences your rating.',
          style: TextStyle(
            fontSize: 14,
            color: AppColors.textSecondary,
            height: 1.5,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Got it',
                style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
    );
  }
}

class _TrendChart extends StatelessWidget {
  final List<TrustScoreDataPoint> dataPoints;

  const _TrendChart({required this.dataPoints});

  @override
  Widget build(BuildContext context) {
    if (dataPoints.isEmpty) {
      return const Center(
        child: Text('No trend data available',
            style: TextStyle(color: AppColors.textTertiary, fontSize: 13)),
      );
    }

    final spots = dataPoints.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), e.value.score.toDouble());
    }).toList();

    double minScore = 100, maxScore = 0;
    for (final dp in dataPoints) {
      if (dp.score < minScore) minScore = dp.score.toDouble();
      if (dp.score > maxScore) maxScore = dp.score.toDouble();
    }
    minScore = (minScore - 5).clamp(0, 100);
    maxScore = (maxScore + 5).clamp(0, 100);

    return LineChart(
      LineChartData(
        minY: minScore,
        maxY: maxScore,
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: (maxScore - minScore) / 4,
          getDrawingHorizontalLine: (value) => FlLine(
            color: AppColors.borderLight,
            strokeWidth: 1,
          ),
        ),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 32,
              interval: (maxScore - minScore) / 4,
              getTitlesWidget: (value, meta) => Text(
                value.toInt().toString(),
                style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.textTertiary,
                ),
              ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 24,
              interval: (dataPoints.length / 5).ceilToDouble(),
              getTitlesWidget: (value, meta) {
                final idx = value.toInt();
                if (idx < 0 || idx >= dataPoints.length) {
                  return const SizedBox.shrink();
                }
                return Text(
                  DateFormat('dd/MM').format(dataPoints[idx].date),
                  style: const TextStyle(
                    fontSize: 9,
                    color: AppColors.textTertiary,
                  ),
                );
              },
            ),
          ),
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
        ),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            curveSmoothness: 0.3,
            color: AppColors.primary,
            barWidth: 2.5,
            dotData: FlDotData(
              show: true,
              getDotPainter: (spot, percent, barData, index) =>
                  FlDotCirclePainter(
                radius: 3,
                color: AppColors.primary,
                strokeWidth: 1.5,
                strokeColor: Colors.white,
              ),
            ),
            belowBarData: BarAreaData(
              show: true,
              color: AppColors.primary.withValues(alpha: 0.06),
            ),
          ),
        ],
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            tooltipRoundedRadius: 8,
            getTooltipItems: (touchedSpots) {
              return touchedSpots.map((spot) {
                return LineTooltipItem(
                  'Score: ${spot.y.toInt()}',
                  const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                );
              }).toList();
            },
          ),
        ),
      ),
    );
  }
}
