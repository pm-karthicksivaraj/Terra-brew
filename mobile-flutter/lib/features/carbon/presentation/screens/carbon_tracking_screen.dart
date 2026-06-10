import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/carbon_tracking_model.dart';
import '../../data/repositories/carbon_repository.dart';
import '../widgets/emissions_breakdown_chart.dart';

class CarbonTrackingScreen extends ConsumerStatefulWidget {
  const CarbonTrackingScreen({super.key});

  @override
  ConsumerState<CarbonTrackingScreen> createState() =>
      _CarbonTrackingScreenState();
}

class _CarbonTrackingScreenState extends ConsumerState<CarbonTrackingScreen> {
  String? _selectedBatchId;
  String? _selectedFarmerId;
  DateTimeRange? _dateRange;

  @override
  Widget build(BuildContext context) {
    final carbonAsync = ref.watch(carbonRecordsProvider({
      'batchId': _selectedBatchId,
      'farmerId': _selectedFarmerId,
      'startDate': _dateRange?.start,
      'endDate': _dateRange?.end,
    }));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text(
          'Carbon Tracking',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: carbonAsync.when(
        data: (records) {
          if (records.isEmpty) {
            return _buildEmptyState();
          }

          // Calculate aggregates
          final totals = _calculateAggregates(records);

          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => ref.invalidate(carbonRecordsProvider),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Total emissions card
                  _buildTotalEmissionsCard(totals),
                  const SizedBox(height: 16),
                  // Emissions per kg indicator
                  _buildEmissionsPerKgCard(totals),
                  const SizedBox(height: 16),
                  // Scope 1/2/3 breakdown
                  _buildBreakdownCard(totals),
                  const SizedBox(height: 16),
                  // Carbon sequestered vs emitted
                  _buildComparisonCard(totals),
                  const SizedBox(height: 16),
                  // Net emissions trend
                  _buildTrendCard(records),
                  const SizedBox(height: 16),
                  // Records list
                  _buildRecordsList(records),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (err, _) => _buildErrorState(err.toString()),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateRecordDialog,
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  _AggregatedData _calculateAggregates(List<CarbonTrackingModel> records) {
    double totalScope1 = 0;
    double totalScope2 = 0;
    double totalScope3 = 0;
    double totalEmissions = 0;
    double totalSequestered = 0;
    double totalNet = 0;
    double weightedEmissionsPerKg = 0;

    for (final r in records) {
      totalScope1 += r.scope1Emissions;
      totalScope2 += r.scope2Emissions;
      totalScope3 += r.scope3Emissions;
      totalEmissions += r.totalEmissions;
      totalSequestered += r.carbonSequestered;
      totalNet += r.netEmissions;
      weightedEmissionsPerKg += r.emissionsPerKg;
    }

    return _AggregatedData(
      scope1: totalScope1,
      scope2: totalScope2,
      scope3: totalScope3,
      totalEmissions: totalEmissions,
      carbonSequestered: totalSequestered,
      netEmissions: totalNet,
      emissionsPerKg:
          records.isNotEmpty ? weightedEmissionsPerKg / records.length : 0,
      recordCount: records.length,
    );
  }

  Widget _buildTotalEmissionsCard(_AggregatedData totals) {
    final isPositive = totals.netEmissions < 0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary,
            AppColors.primaryDark,
          ],
        ),
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Total Emissions',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${totals.totalEmissions.toStringAsFixed(1)} tCO₂e',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: (isPositive ? AppColors.success : AppColors.danger)
                      .withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isPositive
                          ? Icons.trending_down
                          : Icons.trending_up,
                      size: 14,
                      color: isPositive ? AppColors.success : AppColors.danger,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isPositive
                          ? 'Net Positive'
                          : 'Net Emitter',
                      style: TextStyle(
                        color:
                            isPositive ? AppColors.success : AppColors.danger,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Text(
                '${totals.recordCount} records',
                style: const TextStyle(
                  color: Colors.white60,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmissionsPerKgCard(_AggregatedData totals) {
    final isLow = totals.emissionsPerKg < 3.0;
    final isMedium = totals.emissionsPerKg >= 3.0 && totals.emissionsPerKg < 5.0;

    Color indicatorColor;
    String indicatorLabel;
    if (isLow) {
      indicatorColor = AppColors.success;
      indicatorLabel = 'Low';
    } else if (isMedium) {
      indicatorColor = AppColors.warning;
      indicatorLabel = 'Medium';
    } else {
      indicatorColor = AppColors.danger;
      indicatorLabel = 'High';
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: indicatorColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    totals.emissionsPerKg.toStringAsFixed(2),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: indicatorColor,
                    ),
                  ),
                  Text(
                    'kg CO₂e/kg',
                    style: TextStyle(
                      fontSize: 8,
                      color: indicatorColor.withValues(alpha: 0.7),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Emissions Per kg',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Average across all tracked batches',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: indicatorColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              indicatorLabel,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: indicatorColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBreakdownCard(_AggregatedData totals) {
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
              Icon(Icons.bar_chart, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Emissions Breakdown',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          EmissionsBreakdownChart(
            scope1: totals.scope1,
            scope2: totals.scope2,
            scope3: totals.scope3,
            total: totals.totalEmissions,
          ),
          const SizedBox(height: 16),
          _scopeRow('Scope 1 — Direct', totals.scope1, totals.totalEmissions,
              AppColors.primary),
          _scopeRow('Scope 2 — Energy', totals.scope2, totals.totalEmissions,
              AppColors.info),
          _scopeRow('Scope 3 — Value Chain', totals.scope3,
              totals.totalEmissions, AppColors.warning),
        ],
      ),
    );
  }

  Widget _scopeRow(String label, double value, double total, Color color) {
    final percentage = total > 0 ? (value / total) * 100 : 0.0;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Text(
            '${value.toStringAsFixed(1)} tCO₂e',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 48,
            child: Text(
              '${percentage.toStringAsFixed(1)}%',
              style: TextStyle(
                fontSize: 11,
                color: color,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComparisonCard(_AggregatedData totals) {
    final isNetPositive = totals.netEmissions < 0;

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
              Icon(Icons.compare_arrows, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Emitted vs Sequestered',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _ComparisonItem(
                  label: 'Emitted',
                  value: '${totals.totalEmissions.toStringAsFixed(1)} tCO₂e',
                  color: AppColors.danger,
                  icon: Icons.cloud_outlined,
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Column(
                  children: [
                    Icon(
                      isNetPositive
                          ? Icons.arrow_downward
                          : Icons.arrow_upward,
                      color: isNetPositive ? AppColors.success : AppColors.danger,
                      size: 20,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isNetPositive ? 'Net -' : 'Net +',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color:
                            isNetPositive ? AppColors.success : AppColors.danger,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: _ComparisonItem(
                  label: 'Sequestered',
                  value:
                      '${totals.carbonSequestered.toStringAsFixed(1)} tCO₂e',
                  color: AppColors.success,
                  icon: Icons.eco_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: (isNetPositive ? AppColors.success : AppColors.warning)
                  .withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: (isNetPositive ? AppColors.success : AppColors.warning)
                    .withValues(alpha: 0.2),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  isNetPositive ? Icons.check_circle : Icons.info_outline,
                  size: 18,
                  color: isNetPositive ? AppColors.success : AppColors.warning,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    isNetPositive
                        ? 'Your operation is carbon positive! You sequester more than you emit.'
                        : 'Your emissions exceed sequestration. Consider sustainable practices.',
                    style: TextStyle(
                      fontSize: 12,
                      color: isNetPositive
                          ? AppColors.success
                          : AppColors.warning,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrendCard(List<CarbonTrackingModel> records) {
    if (records.length < 2) {
      return const SizedBox.shrink();
    }

    final sortedRecords = List<CarbonTrackingModel>.from(records)
      ..sort((a, b) =>
          (a.createdAt ?? DateTime.now()).compareTo(b.createdAt ?? DateTime.now()));

    final spots = <FlSpot>[];
    for (int i = 0; i < sortedRecords.length; i++) {
      spots.add(FlSpot(i.toDouble(), sortedRecords[i].netEmissions));
    }

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
              Icon(Icons.show_chart, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Net Emissions Trend',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            height: 140,
            child: LineChart(
              LineChartData(
                lineBarsData: [
                  LineChartBarData(
                    spots: spots,
                    isCurved: true,
                    curveSmoothness: 0.3,
                    color: AppColors.primary,
                    barWidth: 2,
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
                      color: AppColors.primary.withValues(alpha: 0.04),
                    ),
                  ),
                ],
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: AppColors.borderLight,
                    strokeWidth: 1,
                  ),
                ),
                titlesData: FlTitlesData(
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      getTitlesWidget: (value, meta) => Text(
                        '${value.toStringAsFixed(0)}',
                        style: const TextStyle(
                            fontSize: 10, color: AppColors.textTertiary),
                      ),
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 24,
                      getTitlesWidget: (value, meta) {
                        final idx = value.toInt();
                        if (idx < 0 || idx >= sortedRecords.length) {
                          return const SizedBox.shrink();
                        }
                        final r = sortedRecords[idx];
                        if (r.createdAt == null) return const SizedBox.shrink();
                        return Text(
                          DateFormat('dd/MM').format(r.createdAt!),
                          style: const TextStyle(
                              fontSize: 9, color: AppColors.textTertiary),
                        );
                      },
                    ),
                  ),
                  topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                ),
                borderData: FlBorderData(show: false),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecordsList(List<CarbonTrackingModel> records) {
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
              Icon(Icons.list_alt, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Recent Records',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...records.take(5).map(
            (record) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: record.isCarbonPositive
                            ? AppColors.success.withValues(alpha: 0.1)
                            : AppColors.warning.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        record.isCarbonPositive ? Icons.eco : Icons.cloud,
                        size: 18,
                        color: record.isCarbonPositive
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
                            record.batchId ?? 'Batch ${record.id.substring(0, 8)}',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            record.formattedTotalEmissions,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          record.formattedNetEmissions,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: record.isCarbonPositive
                                ? AppColors.success
                                : AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          record.formattedEmissionsPerKg,
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.eco_outlined,
                size: 64, color: AppColors.textTertiary),
            const SizedBox(height: 16),
            const Text(
              'No carbon records found',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Start tracking your carbon emissions',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.danger),
            const SizedBox(height: 12),
            const Text('Something went wrong',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary)),
            const SizedBox(height: 4),
            Text(message,
                textAlign: TextAlign.center,
                style:
                    const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }

  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Filter Records',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: const Icon(Icons.date_range, color: AppColors.primary),
                title: Text(
                  _dateRange != null
                      ? '${DateFormat('dd/MM/yy').format(_dateRange!.start)} - ${DateFormat('dd/MM/yy').format(_dateRange!.end)}'
                      : 'Select Date Range',
                  style: const TextStyle(fontSize: 14),
                ),
                onTap: () async {
                  final range = await showDateRangePicker(
                    context: context,
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now(),
                    builder: (_, child) => Theme(
                      data: ThemeData(
                        primaryColor: AppColors.primary,
                        colorScheme: ColorScheme.light(primary: AppColors.primary),
                      ),
                      child: child!,
                    ),
                  );
                  if (range != null) {
                    setState(() => _dateRange = range);
                  }
                },
              ),
              ListTile(
                leading: const Icon(Icons.clear, color: AppColors.danger),
                title: const Text('Clear Filters'),
                onTap: () {
                  setState(() {
                    _selectedBatchId = null;
                    _selectedFarmerId = null;
                    _dateRange = null;
                  });
                  Navigator.pop(ctx);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showCreateRecordDialog() {
    final scope1Ctl = TextEditingController();
    final scope2Ctl = TextEditingController();
    final scope3Ctl = TextEditingController();
    final sequesteredCtl = TextEditingController();
    final batchCtl = TextEditingController();
    bool isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          decoration: const BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
          ),
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'New Carbon Record',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: batchCtl,
                    decoration: _inputDecoration('Batch ID', 'BATCH-001'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: scope1Ctl,
                    keyboardType: TextInputType.number,
                    decoration: _inputDecoration(
                        'Scope 1 Emissions (tCO₂e)', '2.5'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: scope2Ctl,
                    keyboardType: TextInputType.number,
                    decoration: _inputDecoration(
                        'Scope 2 Emissions (tCO₂e)', '1.2'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: scope3Ctl,
                    keyboardType: TextInputType.number,
                    decoration: _inputDecoration(
                        'Scope 3 Emissions (tCO₂e)', '4.8'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: sequesteredCtl,
                    keyboardType: TextInputType.number,
                    decoration: _inputDecoration(
                        'Carbon Sequestered (tCO₂e)', '3.0'),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: isLoading
                          ? null
                          : () async {
                              final s1 =
                                  double.tryParse(scope1Ctl.text) ?? 0;
                              final s2 =
                                  double.tryParse(scope2Ctl.text) ?? 0;
                              final s3 =
                                  double.tryParse(scope3Ctl.text) ?? 0;
                              final seq =
                                  double.tryParse(sequesteredCtl.text) ?? 0;
                              final total = s1 + s2 + s3;

                              setModalState(() => isLoading = true);
                              try {
                                await ref
                                    .read(carbonRepositoryProvider)
                                    .createCarbonRecord({
                                  'batchId': batchCtl.text,
                                  'scope1Emissions': s1,
                                  'scope2Emissions': s2,
                                  'scope3Emissions': s3,
                                  'totalEmissions': total,
                                  'carbonSequestered': seq,
                                  'netEmissions': total - seq,
                                  'emissionsPerKg': 0,
                                });
                                if (mounted) {
                                  Navigator.pop(context);
                                  ref.invalidate(carbonRecordsProvider);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content:
                                          Text('Carbon record created'),
                                      backgroundColor: AppColors.success,
                                    ),
                                  );
                                }
                              } catch (e) {
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                        content: Text(e.toString()),
                                        backgroundColor: AppColors.danger),
                                  );
                                }
                              } finally {
                                setModalState(() => isLoading = false);
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Create Record',
                              style: TextStyle(
                                  fontWeight: FontWeight.w600, fontSize: 15)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, String hint) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      labelStyle:
          const TextStyle(fontSize: 13, color: AppColors.textSecondary),
      hintStyle:
          const TextStyle(fontSize: 13, color: AppColors.textTertiary),
      filled: true,
      fillColor: AppColors.surface,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
    );
  }
}

class _AggregatedData {
  final double scope1;
  final double scope2;
  final double scope3;
  final double totalEmissions;
  final double carbonSequestered;
  final double netEmissions;
  final double emissionsPerKg;
  final int recordCount;

  const _AggregatedData({
    required this.scope1,
    required this.scope2,
    required this.scope3,
    required this.totalEmissions,
    required this.carbonSequestered,
    required this.netEmissions,
    required this.emissionsPerKg,
    required this.recordCount,
  });
}

class _ComparisonItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final IconData icon;

  const _ComparisonItem({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.15)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: color.withValues(alpha: 0.7),
            ),
          ),
        ],
      ),
    );
  }
}
