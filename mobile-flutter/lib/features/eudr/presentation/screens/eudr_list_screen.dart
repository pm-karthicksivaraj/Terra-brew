import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/eudr_compliance_model.dart';
import '../../data/repositories/eudr_repository.dart';
import '../widgets/compliance_status_badge.dart';
import '../widgets/risk_level_indicator.dart';
import 'eudr_detail_screen.dart';
import 'eudr_wizard_screen.dart';

class EudrListScreen extends ConsumerStatefulWidget {
  const EudrListScreen({super.key});

  @override
  ConsumerState<EudrListScreen> createState() => _EudrListScreenState();
}

class _EudrListScreenState extends ConsumerState<EudrListScreen> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  EudrStatus? _selectedStatus;
  RiskLevel? _selectedRiskLevel;

  static const String _userRole = 'field_officer';
  bool get _canAdd => _userRole == 'admin' || _userRole == 'field_officer';

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(eudrListProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final recordsState = ref.watch(eudrListProvider);
    final reportAsync = ref.watch(eudrReadinessReportProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('EUDR Compliance'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterBottomSheet,
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          _buildSummaryStats(reportAsync),
          _buildStatusFilterChips(),
          Expanded(
            child: recordsState.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              error: (error, _) => _buildErrorState(error),
              data: (records) {
                if (records.isEmpty) {
                  return _buildEmptyState();
                }
                return RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () => ref.read(eudrListProvider.notifier).loadRecords(refresh: true),
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.only(top: 4, bottom: 80),
                    itemCount: records.length + (ref.read(eudrListProvider.notifier).hasMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == records.length) {
                        return const Padding(
                          padding: EdgeInsets.all(16),
                          child: Center(
                            child: SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                            ),
                          ),
                        );
                      }
                      return _buildComplianceCard(records[index]);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: _canAdd
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const EudrWizardScreen()),
                ).then((_) => ref.read(eudrListProvider.notifier).loadRecords(refresh: true));
              },
              icon: const Icon(Icons.add),
              label: const Text(
                'New EUDR',
                style: TextStyle(fontFamily: 'SpaceMono', fontSize: 12),
              ),
            )
          : null,
    );
  }

  Widget _buildSearchBar() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: TextField(
        controller: _searchController,
        style: const TextStyle(
          fontFamily: 'SpaceMono',
          fontSize: 14,
          color: AppColors.textPrimary,
        ),
        decoration: const InputDecoration(
          hintText: 'Search by batch ID or farmer...',
          hintStyle: TextStyle(fontFamily: 'SpaceMono', fontSize: 14, color: AppColors.textHint),
          prefixIcon: Icon(Icons.search, color: AppColors.textHint, size: 20),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
        onChanged: (value) {
          ref.read(eudrListProvider.notifier).setSearch(value);
        },
      ),
    );
  }

  Widget _buildSummaryStats(AsyncValue<EudrReadinessReport> reportAsync) {
    return reportAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (report) => Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            _buildStatItem(
              'Total',
              '${report.totalRecords}',
              AppColors.primary,
            ),
            _buildStatDivider(),
            _buildStatItem(
              'Compliant',
              '${report.compliancePercentage.toStringAsFixed(0)}%',
              AppColors.compliant,
            ),
            _buildStatDivider(),
            _buildStatItem(
              'Pending',
              '${report.pendingPercentage.toStringAsFixed(0)}%',
              AppColors.pending,
            ),
            _buildStatDivider(),
            _buildStatItem(
              'Avg Risk',
              '${report.averageRiskScore.toStringAsFixed(0)}',
              _getRiskColor(report.averageRiskScore),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 9,
              color: AppColors.textHint,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatDivider() {
    return Container(
      width: 1,
      height: 28,
      color: AppColors.divider,
    );
  }

  Color _getRiskColor(double score) {
    if (score <= 25) return AppColors.riskLow;
    if (score <= 50) return AppColors.riskMedium;
    if (score <= 75) return AppColors.riskHigh;
    return AppColors.riskCritical;
  }

  Widget _buildStatusFilterChips() {
    return Container(
      height: 44,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _buildStatusChip('All', null),
          _buildStatusChip('Pending', EudrStatus.pending),
          _buildStatusChip('In Review', EudrStatus.inReview),
          _buildStatusChip('Compliant', EudrStatus.compliant),
          _buildStatusChip('Non-Compliant', EudrStatus.nonCompliant),
          _buildStatusChip('Expired', EudrStatus.expired),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String label, EudrStatus? status) {
    final isSelected = _selectedStatus == status;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() => _selectedStatus = selected ? status : null);
          ref.read(eudrListProvider.notifier).setStatus(selected ? status : null);
        },
        selectedColor: status != null
            ? _getStatusColor(status).withValues(alpha: 0.15)
            : AppColors.primary.withValues(alpha: 0.15),
        labelStyle: TextStyle(
          fontFamily: 'SpaceMono',
          fontSize: 11,
          color: isSelected ? AppColors.primary : AppColors.textSecondary,
        ),
      ),
    );
  }

  Color _getStatusColor(EudrStatus status) {
    switch (status) {
      case EudrStatus.pending:
        return AppColors.pending;
      case EudrStatus.inReview:
        return AppColors.inReview;
      case EudrStatus.compliant:
        return AppColors.compliant;
      case EudrStatus.nonCompliant:
        return AppColors.nonCompliant;
      case EudrStatus.expired:
        return AppColors.expired;
    }
  }

  Widget _buildComplianceCard(EudrComplianceModel record) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      elevation: 1,
      shadowColor: Colors.black.withValues(alpha: 0.08),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => EudrDetailScreen(complianceId: record.id),
            ),
          ).then((_) => ref.read(eudrListProvider.notifier).loadRecords(refresh: true));
        },
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Batch: ${record.batchId.isNotEmpty ? record.batchId : '—'}',
                      style: const TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  ComplianceStatusBadge(status: record.status),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.person_outline, size: 14, color: AppColors.textHint),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      'Farmer: ${record.farmerId.isNotEmpty ? record.farmerId : '—'}',
                      style: const TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  RiskLevelIndicator(riskLevel: record.riskLevel),
                  const SizedBox(width: 12),
                  Expanded(
                    child: RiskLevelBar(
                      riskLevel: record.riskLevel,
                      score: record.deforestationRiskScore,
                    ),
                  ),
                ],
              ),
              if (record.createdAt != null) ...[
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      _formatDate(record.createdAt!),
                      style: const TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 10,
                        color: AppColors.textHint,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(60),
              ),
              child: const Icon(Icons.eco_outlined, size: 56, color: AppColors.textHint),
            ),
            const SizedBox(height: 24),
            const Text(
              'No EUDR Records Found',
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Create your first EUDR compliance record\nto get started.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 13,
                color: AppColors.textHint,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            if (_canAdd)
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const EudrWizardScreen()),
                  ).then((_) => ref.read(eudrListProvider.notifier).loadRecords(refresh: true));
                },
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Create EUDR Record'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(Object error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 56, color: AppColors.danger),
            const SizedBox(height: 16),
            const Text(
              'Something went wrong',
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              textAlign: TextAlign.center,
              style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textHint),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => ref.read(eudrListProvider.notifier).loadRecords(refresh: true),
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

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Filter EUDR Records',
                      style: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  'Risk Level',
                  style: TextStyle(
                    fontFamily: 'SpaceMono',
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: [
                    _buildRiskFilterChip(setModalState, 'Low', RiskLevel.low),
                    _buildRiskFilterChip(setModalState, 'Medium', RiskLevel.medium),
                    _buildRiskFilterChip(setModalState, 'High', RiskLevel.high),
                    _buildRiskFilterChip(setModalState, 'Critical', RiskLevel.critical),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      ref.read(eudrListProvider.notifier).setRiskLevel(_selectedRiskLevel);
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text(
                      'Apply Filters',
                      style: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildRiskFilterChip(StateSetter setModalState, String label, RiskLevel level) {
    final isSelected = _selectedRiskLevel == level;
    return ChoiceChip(
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: _getRiskChipColor(level),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 4),
          Text(label),
        ],
      ),
      selected: isSelected,
      onSelected: (selected) {
        setModalState(() {
          _selectedRiskLevel = selected ? level : null;
        });
      },
      selectedColor: _getRiskChipColor(level).withValues(alpha: 0.15),
      labelStyle: TextStyle(
        fontFamily: 'SpaceMono',
        fontSize: 12,
        color: isSelected ? _getRiskChipColor(level) : AppColors.textSecondary,
      ),
    );
  }

  Color _getRiskChipColor(RiskLevel level) {
    switch (level) {
      case RiskLevel.low:
        return AppColors.riskLow;
      case RiskLevel.medium:
        return AppColors.riskMedium;
      case RiskLevel.high:
        return AppColors.riskHigh;
      case RiskLevel.critical:
        return AppColors.riskCritical;
    }
  }
}
