import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/farmland_model.dart';
import '../../data/repositories/farmland_repository.dart';
import 'farmland_form_screen.dart';

class FarmLandDetailScreen extends ConsumerWidget {
  final String farmlandId;

  const FarmLandDetailScreen({super.key, required this.farmlandId});

  static const String _userRole = 'field_officer';
  static bool get _canEdit =>
      _userRole == 'super_admin' || _userRole == 'field_officer';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final farmlandAsync = ref.watch(farmlandDetailProvider(farmlandId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Farm Land Details'),
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
      body: farmlandAsync.when(
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
                'Failed to load farm land',
                style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 14, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(farmlandDetailProvider(farmlandId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (farmland) => _buildContent(context, ref, farmland),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, FarmLandModel farmland) {
    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeaderCard(farmland),
          const SizedBox(height: 12),
          _buildAreaAltitudeSection(farmland),
          const SizedBox(height: 12),
          _buildSoilTreeSection(farmland),
          const SizedBox(height: 12),
          _buildMapSection(farmland),
          const SizedBox(height: 12),
          _buildLinkedFarmerSection(),
          const SizedBox(height: 12),
          _buildEudrStatusSection(),
        ],
      ),
    );
  }

  Widget _buildHeaderCard(FarmLandModel farmland) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.landscape,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      farmland.farmName.isNotEmpty ? farmland.farmName : 'Unnamed Farm',
                      style: const TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Plot: ${farmland.plotBlockId.isNotEmpty ? farmland.plotBlockId : '—'}',
                        style: const TextStyle(
                          fontFamily: 'SpaceMono',
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
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

  Widget _buildAreaAltitudeSection(FarmLandModel farmland) {
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
              Icon(Icons.straighten, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Area & Altitude',
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
              _buildStatCard(
                label: 'Boundary Area',
                value: farmland.areaDisplay,
                icon: Icons.square_foot,
                color: AppColors.primary,
              ),
              const SizedBox(width: 12),
              _buildStatCard(
                label: 'Altitude',
                value: farmland.altitudeDisplay,
                icon: Icons.terrain,
                color: AppColors.warning,
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildInfoRow('Total Land Holding', '${farmland.totalLandHolding} ha'),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required String label,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(height: 8),
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
                fontSize: 10,
                color: AppColors.textHint,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSoilTreeSection(FarmLandModel farmland) {
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
              Icon(Icons.grain, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Soil & Trees',
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
          _buildInfoRow('Soil Type', farmland.soilTypeDisplay),
          _buildInfoRow('Number of Trees', '${farmland.noOfTrees}'),
          _buildInfoRow('Tree Density', farmland.treeDensityDisplay),
        ],
      ),
    );
  }

  Widget _buildMapSection(FarmLandModel farmland) {
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
                'Map & Boundary',
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
            height: 200,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Stack(
              children: [
                if (farmland.polygonGeoJson.isNotEmpty)
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.polyline_outlined, size: 40, color: AppColors.primary),
                        const SizedBox(height: 8),
                        Text(
                          'Polygon boundary defined',
                          style: TextStyle(
                            fontFamily: 'SpaceMono',
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.map_outlined, size: 40, color: AppColors.textHint),
                        const SizedBox(height: 8),
                        const Text(
                          'No polygon defined',
                          style: TextStyle(
                            fontFamily: 'SpaceMono',
                            fontSize: 12,
                            color: AppColors.textHint,
                          ),
                        ),
                      ],
                    ),
                  ),
                if (farmland.geoCenterLat != null && farmland.geoCenterLng != null)
                  Positioned(
                    bottom: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Text(
                        'Center: ${farmland.geoCenterLat!.toStringAsFixed(4)}, ${farmland.geoCenterLng!.toStringAsFixed(4)}',
                        style: const TextStyle(
                          fontFamily: 'SpaceMono',
                          fontSize: 9,
                          color: AppColors.textSecondary,
                        ),
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

  Widget _buildLinkedFarmerSection() {
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
              Icon(Icons.person_outline, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Linked Farmer',
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
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Column(
                children: [
                  const Icon(Icons.person_search_outlined, size: 32, color: AppColors.textHint),
                  const SizedBox(height: 8),
                  const Text(
                    'Farmer details will appear here',
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

  Widget _buildEudrStatusSection() {
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
              Icon(Icons.eco_outlined, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'EUDR Compliance',
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
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
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
            width: 140,
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
            builder: (_) => FarmLandFormScreen(farmlandId: farmlandId),
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
          'Delete Farm Land',
          style: TextStyle(fontFamily: 'SpaceMono', fontWeight: FontWeight.w700),
        ),
        content: const Text(
          'Are you sure you want to delete this farm land? This action cannot be undone.',
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
                await ref.read(farmlandRepositoryProvider).deleteFarmLand(farmlandId);
                if (context.mounted) {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Farm land deleted successfully')),
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
