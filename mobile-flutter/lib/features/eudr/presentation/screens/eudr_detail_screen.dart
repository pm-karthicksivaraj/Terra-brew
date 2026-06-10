import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/eudr_compliance_model.dart';
import '../../data/repositories/eudr_repository.dart';
import '../widgets/compliance_status_badge.dart';
import '../widgets/risk_level_indicator.dart';

class EudrDetailScreen extends ConsumerWidget {
  final String complianceId;

  const EudrDetailScreen({super.key, required this.complianceId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final complianceAsync = ref.watch(eudrDetailProvider(complianceId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('EUDR Compliance'),
      ),
      body: complianceAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.danger),
              const SizedBox(height: 12),
              const Text(
                'Failed to load compliance record',
                style: TextStyle(fontFamily: 'SpaceMono', fontSize: 14, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(eudrDetailProvider(complianceId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (compliance) => _buildContent(context, ref, compliance),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, EudrComplianceModel compliance) {
    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStatusHeader(compliance),
          const SizedBox(height: 12),
          _buildRiskAssessment(compliance),
          const SizedBox(height: 12),
          _buildDeforestationScore(compliance),
          const SizedBox(height: 12),
          _buildDueDiligenceSection(compliance),
          const SizedBox(height: 12),
          _buildTracesSection(compliance),
          const SizedBox(height: 12),
          _buildLinkedEntitiesSection(compliance),
          const SizedBox(height: 12),
          _buildMapSection(compliance),
          const SizedBox(height: 12),
          _buildTimelineSection(compliance),
        ],
      ),
    );
  }

  Widget _buildStatusHeader(EudrComplianceModel compliance) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _getStatusBgColor(compliance.status),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Batch: ${compliance.batchId.isNotEmpty ? compliance.batchId : '—'}',
                style: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              ComplianceStatusBadgeLarge(status: compliance.status),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Compliance ID: ${compliance.complianceId.isNotEmpty ? compliance.complianceId : compliance.id.substring(0, 8)}',
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusBgColor(EudrStatus status) {
    switch (status) {
      case EudrStatus.pending:
        return AppColors.pending.withValues(alpha: 0.08);
      case EudrStatus.inReview:
        return AppColors.inReview.withValues(alpha: 0.08);
      case EudrStatus.compliant:
        return AppColors.compliant.withValues(alpha: 0.08);
      case EudrStatus.nonCompliant:
        return AppColors.nonCompliant.withValues(alpha: 0.08);
      case EudrStatus.expired:
        return AppColors.expired.withValues(alpha: 0.08);
    }
  }

  Widget _buildRiskAssessment(EudrComplianceModel compliance) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.shield_outlined, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Risk Assessment',
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              RiskLevelGauge(score: compliance.deforestationRiskScore, size: 100),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Risk Level',
                      style: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 10,
                        color: AppColors.textHint,
                      ),
                    ),
                    const SizedBox(height: 4),
                    RiskLevelIndicator(riskLevel: compliance.riskLevel, showLabel: true),
                    const SizedBox(height: 12),
                    const Text(
                      'Deforestation Score',
                      style: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 10,
                        color: AppColors.textHint,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${compliance.deforestationRiskScore.toStringAsFixed(1)} / 100',
                      style: const TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeforestationScore(EudrComplianceModel compliance) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.analytics_outlined, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Deforestation Risk Score',
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          RiskLevelBar(
            riskLevel: compliance.riskLevel,
            score: compliance.deforestationRiskScore,
          ),
          const SizedBox(height: 12),
          _buildScoreBreakdown(),
        ],
      ),
    );
  }

  Widget _buildScoreBreakdown() {
    return Column(
      children: [
        _buildScoreRow('Satellite Analysis', 15.0),
        _buildScoreRow('Land Use Change', 8.5),
        _buildScoreRow('Proximity to Forest', 12.0),
        _buildScoreRow('Historical Data', 5.5),
      ],
    );
  }

  Widget _buildScoreRow(String label, double value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Text(
              label,
              style: const TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: (value / 25).clamp(0.0, 1.0),
                backgroundColor: AppColors.surfaceVariant,
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            value.toStringAsFixed(1),
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDueDiligenceSection(EudrComplianceModel compliance) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.description_outlined, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Due Diligence Statement',
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(
              compliance.dueDiligenceStatement.isNotEmpty
                  ? compliance.dueDiligenceStatement
                  : 'No due diligence statement uploaded yet.',
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 12,
                color: compliance.dueDiligenceStatement.isNotEmpty
                    ? AppColors.textPrimary
                    : AppColors.textHint,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTracesSection(EudrComplianceModel compliance) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.verified_user_outlined, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Traces Certificate',
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildInfoRow('Reference', compliance.tracesCertificateRef.isNotEmpty ? compliance.tracesCertificateRef : 'Not provided'),
          _buildInfoRow('Compliance ID', compliance.complianceId.isNotEmpty ? compliance.complianceId : '—'),
        ],
      ),
    );
  }

  Widget _buildLinkedEntitiesSection(EudrComplianceModel compliance) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.link, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Linked Records',
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildLinkedItem(
            icon: Icons.person_outline,
            label: 'Farmer',
            value: compliance.farmerId.isNotEmpty ? compliance.farmerId : 'Not linked',
          ),
          const SizedBox(height: 8),
          _buildLinkedItem(
            icon: Icons.landscape_outlined,
            label: 'Farm Land',
            value: compliance.farmLandId.isNotEmpty ? compliance.farmLandId : 'Not linked',
          ),
        ],
      ),
    );
  }

  Widget _buildLinkedItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.primary),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 11,
              color: AppColors.textHint,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(width: 4),
          const Icon(Icons.chevron_right, size: 14, color: AppColors.textHint),
        ],
      ),
    );
  }

  Widget _buildMapSection(EudrComplianceModel compliance) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.map_outlined, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Farm Polygon',
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            height: 180,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.map_outlined, size: 40, color: AppColors.textHint),
                  SizedBox(height: 8),
                  Text(
                    'Polygon map preview',
                    style: TextStyle(
                      fontFamily: 'SpaceMono',
                      fontSize: 12,
                      color: AppColors.textHint,
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

  Widget _buildTimelineSection(EudrComplianceModel compliance) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.history, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Status Timeline',
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildTimelineItem(
            'Record Created',
            compliance.createdAt ?? DateTime.now(),
            isActive: true,
          ),
          _buildTimelineItem(
            'Status: ${compliance.status.label}',
            compliance.updatedAt ?? DateTime.now(),
            isActive: false,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(String title, DateTime date, {required bool isActive}) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 24,
            child: Column(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.primary : AppColors.textHint,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isActive ? AppColors.primary : AppColors.border,
                      width: 2,
                    ),
                  ),
                ),
                Expanded(
                  child: Container(
                    width: 2,
                    color: AppColors.border,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontFamily: 'SpaceMono',
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: isActive ? AppColors.primary : AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _formatDateTime(date),
                    style: const TextStyle(
                      fontFamily: 'SpaceMono',
                      fontSize: 10,
                      color: AppColors.textHint,
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

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textHint),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDateTime(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')} '
        '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}
