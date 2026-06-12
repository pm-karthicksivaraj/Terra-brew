import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/farmland_model.dart';

class FarmLandCard extends StatelessWidget {
  final FarmLandModel farmland;
  final VoidCallback onTap;

  const FarmLandCard({
    super.key,
    required this.farmland,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      elevation: 1,
      shadowColor: Colors.black.withValues(alpha: 0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      child: InkWell(
        onTap: onTap,
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
                      farmland.farmName.isNotEmpty ? farmland.farmName : 'Unnamed Farm',
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
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      farmland.plotBlockId.isNotEmpty ? farmland.plotBlockId : '—',
                      style: const TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildInfoChip(
                    icon: Icons.landscape_outlined,
                    label: farmland.areaDisplay,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 8),
                  _buildInfoChip(
                    icon: Icons.terrain_outlined,
                    label: farmland.altitudeDisplay,
                    color: AppColors.warning,
                  ),
                  const SizedBox(width: 8),
                  _buildInfoChip(
                    icon: Icons.park_outlined,
                    label: '${farmland.noOfTrees} trees',
                    color: AppColors.success,
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  if (farmland.soilType.isNotEmpty)
                    _buildInfoChip(
                      icon: Icons.grain_outlined,
                      label: farmland.soilTypeDisplay,
                      color: AppColors.textSecondary,
                    ),
                  const Spacer(),
                  // Mini map preview
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: farmland.polygonGeoJson.isNotEmpty
                        ? const Icon(
                            Icons.polyline_outlined,
                            size: 20,
                            color: AppColors.primary,
                          )
                        : const Icon(
                            Icons.map_outlined,
                            size: 20,
                            color: AppColors.textHint,
                          ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.chevron_right,
                    color: AppColors.textHint,
                    size: 20,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip({
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
