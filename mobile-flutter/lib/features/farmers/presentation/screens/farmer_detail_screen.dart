import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/farmer_model.dart';
import '../../data/repositories/farmer_repository.dart';
import 'farmer_form_screen.dart';

class FarmerDetailScreen extends ConsumerWidget {
  final String farmerId;

  const FarmerDetailScreen({super.key, required this.farmerId});

  static const String _userRole = 'field_officer';
  bool get _canEdit =>
      _userRole == 'admin' || _userRole == 'field_officer';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final farmerAsync = ref.watch(farmerDetailProvider(farmerId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Farmer Details'),
        actions: [
          if (_canEdit)
            PopupMenuButton<String>(
              onSelected: (value) => _handleMenuAction(context, ref, value),
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'edit',
                  child: Row(
                    children: [
                      Icon(Icons.edit_outlined, size: 18, color: AppColors.primary),
                      SizedBox(width: 8),
                      Text('Edit', style: TextStyle(fontFamily: 'SpaceMono', fontSize: 13)),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'delete',
                  child: Row(
                    children: [
                      Icon(Icons.delete_outline, size: 18, color: AppColors.danger),
                      SizedBox(width: 8),
                      Text('Delete', style: TextStyle(fontFamily: 'SpaceMono', fontSize: 13, color: AppColors.danger)),
                    ],
                  ),
                ),
              ],
            ),
        ],
      ),
      body: farmerAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.danger),
              const SizedBox(height: 12),
              Text(
                'Failed to load farmer',
                style: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 14,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(farmerDetailProvider(farmerId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (farmer) => _buildContent(context, ref, farmer),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, FarmerModel farmer) {
    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeaderCard(farmer),
          const SizedBox(height: 12),
          _buildContactSection(farmer),
          const SizedBox(height: 12),
          _buildLocationSection(context, farmer),
          const SizedBox(height: 12),
          _buildBankingSection(farmer),
          const SizedBox(height: 12),
          _buildFarmLandsSection(),
          const SizedBox(height: 12),
          _buildEudrStatusSection(),
          const SizedBox(height: 12),
          _buildQrCodeSection(farmer),
        ],
      ),
    );
  }

  Widget _buildHeaderCard(FarmerModel farmer) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    farmer.initials,
                    style: const TextStyle(
                      fontFamily: 'SpaceMono',
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      farmer.fullName,
                      style: const TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            farmer.farmerCode,
                            style: const TextStyle(
                              fontFamily: 'SpaceMono',
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (farmer.isCertified)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.success,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.verified, size: 12, color: Colors.white),
                                SizedBox(width: 3),
                                Text(
                                  'Certified',
                                  style: TextStyle(
                                    fontFamily: 'SpaceMono',
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildStatItem('Gender', farmer.gender),
              _buildStatItem('DOB', farmer.displayDob),
              _buildStatItem('Credit', '${farmer.creditScore}'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 10,
              color: Colors.white.withValues(alpha: 0.7),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactSection(FarmerModel farmer) {
    return _buildSection(
      title: 'Contact Information',
      icon: Icons.contact_phone_outlined,
      children: [
        _buildInfoRow('Phone', farmer.contactNumber.isNotEmpty ? farmer.contactNumber : 'Not provided'),
        _buildInfoRow('Email', '—'),
      ],
    );
  }

  Widget _buildLocationSection(BuildContext context, FarmerModel farmer) {
    return _buildSection(
      title: 'Location',
      icon: Icons.location_on_outlined,
      children: [
        _buildInfoRow('Country', farmer.country.isNotEmpty ? farmer.country : 'Not set'),
        _buildInfoRow('Province', farmer.province.isNotEmpty ? farmer.province : 'Not set'),
        _buildInfoRow('District', farmer.district.isNotEmpty ? farmer.district : 'Not set'),
        _buildInfoRow('Commune', farmer.commune.isNotEmpty ? farmer.commune : 'Not set'),
        _buildInfoRow('Village', farmer.village.isNotEmpty ? farmer.village : 'Not set'),
        if (farmer.latitude != null && farmer.longitude != null) ...[
          const SizedBox(height: 8),
          Container(
            height: 150,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Stack(
              children: [
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.map_outlined, size: 32, color: AppColors.textHint),
                      const SizedBox(height: 4),
                      Text(
                        '${farmer.latitude!.toStringAsFixed(4)}, ${farmer.longitude!.toStringAsFixed(4)}',
                        style: const TextStyle(
                          fontFamily: 'SpaceMono',
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: const Text(
                      'Map Preview',
                      style: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 9,
                        color: AppColors.textHint,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildBankingSection(FarmerModel farmer) {
    return _buildSection(
      title: 'Banking Details',
      icon: Icons.account_balance_outlined,
      children: [
        _buildInfoRow('Bank', farmer.bankName.isNotEmpty ? farmer.bankName : 'Not provided'),
        _buildInfoRow('Account', farmer.accountNumber.isNotEmpty ? farmer.accountNumber : 'Not provided'),
        _buildInfoRow('Credit Score', '${farmer.creditScore}'),
      ],
    );
  }

  Widget _buildFarmLandsSection() {
    return _buildSection(
      title: 'Farm Lands',
      icon: Icons.landscape_outlined,
      children: [
        Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Column(
              children: [
                const Icon(Icons.landscape_outlined, size: 32, color: AppColors.textHint),
                const SizedBox(height: 8),
                const Text(
                  'No farm lands linked yet',
                  style: TextStyle(
                    fontFamily: 'SpaceMono',
                    fontSize: 12,
                    color: AppColors.textHint,
                  ),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Add Farm Land'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEudrStatusSection() {
    return _buildSection(
      title: 'EUDR Compliance',
      icon: Icons.eco_outlined,
      children: [
        Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Column(
              children: [
                const Icon(Icons.eco_outlined, size: 32, color: AppColors.textHint),
                const SizedBox(height: 8),
                const Text(
                  'No EUDR records yet',
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
    );
  }

  Widget _buildQrCodeSection(FarmerModel farmer) {
    return _buildSection(
      title: 'QR Code',
      icon: Icons.qr_code,
      children: [
        Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: QrImageView(
              data: 'TERRABREW:FARMER:${farmer.id}:${farmer.farmerCode}',
              version: QrVersions.auto,
              size: 160,
              backgroundColor: Colors.white,
              eyeStyle: const QrEyeStyle(
                eyeShape: QrEyeShape.square,
                color: AppColors.primary,
              ),
              dataModuleStyle: const QrDataModuleStyle(
                dataModuleShape: QrDataModuleShape.square,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ),
        Center(
          child: Text(
            farmer.farmerCode,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSection({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
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
          Row(
            children: [
              Icon(icon, size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...children,
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
            width: 110,
            child: Text(
              label,
              style: const TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 12,
                color: AppColors.textHint,
              ),
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

  void _handleMenuAction(BuildContext context, WidgetRef ref, String action) {
    switch (action) {
      case 'edit':
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => FarmerFormScreen(farmerId: farmerId),
          ),
        );
        break;
      case 'delete':
        _showDeleteConfirmation(context, ref);
        break;
    }
  }

  void _showDeleteConfirmation(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text(
          'Delete Farmer',
          style: TextStyle(fontFamily: 'SpaceMono', fontWeight: FontWeight.w700),
        ),
        content: const Text(
          'Are you sure you want to delete this farmer? This action cannot be undone.',
          style: TextStyle(fontFamily: 'SpaceMono', fontSize: 13),
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await ref.read(farmerRepositoryProvider).deleteFarmer(farmerId);
                if (context.mounted) {
                  Navigator.of(context).pop(); // Pop detail screen
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Farmer deleted successfully')),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to delete: $e')),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
