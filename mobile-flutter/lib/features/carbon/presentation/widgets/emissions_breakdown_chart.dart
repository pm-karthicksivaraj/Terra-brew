import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../../core/theme/app_colors.dart';

class EmissionsBreakdownChart extends StatelessWidget {
  final double scope1;
  final double scope2;
  final double scope3;
  final double total;

  const EmissionsBreakdownChart({
    super.key,
    required this.scope1,
    required this.scope2,
    required this.scope3,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    if (total == 0) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'No emissions data available',
            style: TextStyle(color: AppColors.textTertiary, fontSize: 13),
          ),
        ),
      );
    }

    return Column(
      children: [
        SizedBox(
          height: 200,
          child: BarChart(
            BarChartData(
              alignment: BarChartAlignment.spaceAround,
              maxY: [scope1, scope2, scope3].reduce((a, b) => a > b ? a : b) * 1.3,
              barTouchData: BarTouchData(
                touchTooltipData: BarTouchTooltipData(
                  tooltipRoundedRadius: 8,
                  getTooltipItem: (group, groupIndex, rod, rodIndex) {
                    String label;
                    switch (group.x.toInt()) {
                      case 0:
                        label = 'Scope 1';
                        break;
                      case 1:
                        label = 'Scope 2';
                        break;
                      case 2:
                        label = 'Scope 3';
                        break;
                      default:
                        label = '';
                    }
                    return BarTooltipItem(
                      '$label\n${rod.toY.toStringAsFixed(1)} tCO₂e',
                      const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    );
                  },
                ),
              ),
              titlesData: FlTitlesData(
                show: true,
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 32,
                    getTitlesWidget: (value, meta) {
                      String label;
                      switch (value.toInt()) {
                        case 0:
                          label = 'Scope 1';
                          break;
                        case 1:
                          label = 'Scope 2';
                          break;
                        case 2:
                          label = 'Scope 3';
                          break;
                        default:
                          label = '';
                      }
                      return Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(
                          label,
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      );
                    },
                  ),
                ),
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 44,
                    interval: ([scope1, scope2, scope3].reduce((a, b) => a > b ? a : b) * 1.3) / 4,
                    getTitlesWidget: (value, meta) => Text(
                      value.toStringAsFixed(0),
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ),
                ),
                topTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
                rightTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
              ),
              borderData: FlBorderData(show: false),
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                horizontalInterval: ([scope1, scope2, scope3].reduce((a, b) => a > b ? a : b) * 1.3) / 4,
                getDrawingHorizontalLine: (value) => FlLine(
                  color: AppColors.borderLight,
                  strokeWidth: 1,
                ),
              ),
              barGroups: [
                BarChartGroupData(
                  x: 0,
                  barRods: [
                    BarChartRodData(
                      toY: scope1,
                      color: AppColors.primary,
                      width: 44,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(6),
                        topRight: Radius.circular(6),
                      ),
                    ),
                  ],
                ),
                BarChartGroupData(
                  x: 1,
                  barRods: [
                    BarChartRodData(
                      toY: scope2,
                      color: AppColors.info,
                      width: 44,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(6),
                        topRight: Radius.circular(6),
                      ),
                    ),
                  ],
                ),
                BarChartGroupData(
                  x: 2,
                  barRods: [
                    BarChartRodData(
                      toY: scope3,
                      color: AppColors.warning,
                      width: 44,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(6),
                        topRight: Radius.circular(6),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        // Legend
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _LegendItem(color: AppColors.primary, label: 'Scope 1 (Direct)'),
            const SizedBox(width: 16),
            _LegendItem(color: AppColors.info, label: 'Scope 2 (Energy)'),
            const SizedBox(width: 16),
            _LegendItem(color: AppColors.warning, label: 'Scope 3 (Value Chain)'),
          ],
        ),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
