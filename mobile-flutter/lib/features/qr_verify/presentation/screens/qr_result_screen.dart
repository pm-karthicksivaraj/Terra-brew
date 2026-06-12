import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/layouts/app_scaffold.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/status_badge.dart';

/// QR verification result data model
class QrVerificationResult {
  final String code;
  final bool isVerified;
  final String entityType;
  final String entityId;
  final String? hashVerification;
  final bool isBlockchainAnchored;
  final DateTime? verifiedAt;
  final String? metadata;

  const QrVerificationResult({
    required this.code,
    required this.isVerified,
    required this.entityType,
    required this.entityId,
    this.hashVerification,
    this.isBlockchainAnchored = false,
    this.verifiedAt,
    this.metadata,
  });
}

/// QR verification result screen
class QrResultScreen extends StatelessWidget {
  final QrVerificationResult? result;

  const QrResultScreen({super.key, this.result});

  @override
  Widget build(BuildContext context) {
    // Use provided result or create from route extra data
    final verificationResult = result ?? _parseFromRoute(context);

    return AppScaffold(
      title: 'Verification Result',
      showBackButton: true,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: AppSpacing.lg),
            // Status header
            _buildStatusHeader(verificationResult),
            const SizedBox(height: AppSpacing.xl),

            // Verification details
            _buildDetailCard(verificationResult),
            const SizedBox(height: AppSpacing.xl),

            // Blockchain info
            _buildBlockchainCard(verificationResult),
            const SizedBox(height: AppSpacing.xl),

            // Action buttons
            _buildActions(verificationResult, context),
            const SizedBox(height: AppSpacing.xxl),
          ],
        ),
      ),
    );
  }

  QrVerificationResult _parseFromRoute(BuildContext context) {
    // In a real app, parse from GoRouterState or extra data
    return const QrVerificationResult(
      code: 'TB-2025-FRM-001',
      isVerified: true,
      entityType: 'Farmer',
      entityId: 'FRM-001',
      hashVerification: 'sha256:a1b2c3d4e5f6...',
      isBlockchainAnchored: true,
      verifiedAt: null,
    );
  }

  Widget _buildStatusHeader(QrVerificationResult result) {
    final isVerified = result.isVerified;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: isVerified
            ? AppColors.success.withOpacity(0.08)
            : AppColors.danger.withOpacity(0.08),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(
          color: isVerified
              ? AppColors.success.withOpacity(0.3)
              : AppColors.danger.withOpacity(0.3),
        ),
      ),
      child: Column(
        children: [
          TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: 1),
            duration: AppDuration.slow,
            builder: (context, value, child) {
              return Transform.scale(
                scale: value,
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: isVerified
                        ? AppColors.success.withOpacity(0.2)
                        : AppColors.danger.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isVerified
                        ? Icons.verified_rounded
                        : Icons.gpp_bad_rounded,
                    size: 36,
                    color: isVerified ? AppColors.success : AppColors.danger,
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            isVerified ? 'Verified' : 'Not Verified',
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.xl,
              fontWeight: FontWeight.w700,
              color: isVerified ? AppColors.success : AppColors.danger,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            isVerified
                ? 'This entity has been verified on the TerraBrew platform'
                : 'This entity could not be verified. Contact support.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.sm,
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailCard(QrVerificationResult result) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Entity Details',
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.md,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          _DetailRow(
            label: 'QR Code',
            value: result.code,
            trailing: StatusBadge(
              label: result.entityType,
              size: StatusBadgeSize.small,
              backgroundColor: AppColors.primary,
            ),
          ),
          const Divider(height: AppSpacing.xl),
          _DetailRow(
            label: 'Entity ID',
            value: result.entityId,
          ),
          const Divider(height: AppSpacing.xl),
          _DetailRow(
            label: 'Hash Verification',
            value: result.hashVerification ?? 'N/A',
          ),
          if (result.verifiedAt != null) ...[
            const Divider(height: AppSpacing.xl),
            _DetailRow(
              label: 'Verified At',
              value: _formatDate(result.verifiedAt!),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBlockchainCard(QrVerificationResult result) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.link_rounded,
                color: AppColors.primary,
                size: 20,
              ),
              const SizedBox(width: AppSpacing.sm),
              const Text(
                'Blockchain Anchor',
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: AppFontSize.md,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              StatusBadge.fromStatus(
                result.isBlockchainAnchored ? 'Anchored' : 'Pending',
                size: StatusBadgeSize.small,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            result.isBlockchainAnchored
                ? 'This record has been immutably anchored to the blockchain, ensuring data integrity and transparency throughout the supply chain.'
                : 'This record is pending blockchain anchoring. Verification may be incomplete.',
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.sm,
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActions(QrVerificationResult result, BuildContext context) {
    return Column(
      children: [
        AppButton(
          label: 'View Entity',
          variant: AppButtonVariant.primary,
          icon: Icons.open_in_new_rounded,
          fullWidth: true,
          onPressed: () {
            // Navigate to entity detail
            if (result.entityType.toLowerCase() == 'farmer') {
              context.push('/farmers/${result.entityId}');
            } else if (result.entityType.toLowerCase() == 'farmland') {
              context.push('/farmlands/${result.entityId}');
            }
          },
        ),
        const SizedBox(height: AppSpacing.md),
        AppButton(
          label: 'Scan Another',
          variant: AppButtonVariant.secondary,
          icon: Icons.qr_code_scanner_rounded,
          fullWidth: true,
          onPressed: () => context.push('/qr-scan'),
        ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}

/// Detail row widget
class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final Widget? trailing;

  const _DetailRow({
    required this.label,
    required this.value,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: Text(
            label,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: AppFontSize.sm,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          flex: 3,
          child: trailing ??
              Text(
                value,
                style: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: AppFontSize.sm,
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
        ),
      ],
    );
  }
}
