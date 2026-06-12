import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../../../core/theme/app_theme.dart';

/// Farm polygon data model
class FarmPolygon {
  final String id;
  final String name;
  final String farmerName;
  final List<LatLng> points;
  final String complianceStatus; // 'compliant', 'pending', 'non-compliant'
  final double areaHectares;
  final String? cropType;

  const FarmPolygon({
    required this.id,
    required this.name,
    required this.farmerName,
    required this.points,
    required this.complianceStatus,
    required this.areaHectares,
    this.cropType,
  });

  Color get fillColor {
    switch (complianceStatus) {
      case 'compliant':
        return AppColors.success.withOpacity(0.3);
      case 'pending':
        return AppColors.warning.withOpacity(0.3);
      case 'non-compliant':
        return AppColors.danger.withOpacity(0.3);
      default:
        return AppColors.primary.withOpacity(0.3);
    }
  }

  Color get borderColor {
    switch (complianceStatus) {
      case 'compliant':
        return AppColors.success;
      case 'pending':
        return AppColors.warning;
      case 'non-compliant':
        return AppColors.danger;
      default:
        return AppColors.primary;
    }
  }

  StatusBadgeData get statusBadge {
    switch (complianceStatus) {
      case 'compliant':
        return StatusBadgeData(label: 'Compliant', color: AppColors.success);
      case 'pending':
        return StatusBadgeData(label: 'Pending', color: AppColors.warning);
      case 'non-compliant':
        return StatusBadgeData(label: 'Non-Compliant', color: AppColors.danger);
      default:
        return StatusBadgeData(label: 'Unknown', color: AppColors.muted);
    }
  }
}

class StatusBadgeData {
  final String label;
  final Color color;
  const StatusBadgeData({required this.label, required this.color});
}

/// Sample farm data (in production, this comes from API)
final sampleFarms = <FarmPolygon>[
  FarmPolygon(
    id: 'farm-1',
    name: 'Highland Coffee Farm',
    farmerName: 'Nguyen Van Minh',
    points: [
      const LatLng(11.95, 108.45),
      const LatLng(11.96, 108.45),
      const LatLng(11.96, 108.47),
      const LatLng(11.95, 108.47),
    ],
    complianceStatus: 'compliant',
    areaHectares: 2.5,
    cropType: 'Arabica',
  ),
  FarmPolygon(
    id: 'farm-2',
    name: 'Green Valley Estate',
    farmerName: 'Tran Thi Hoa',
    points: [
      const LatLng(11.93, 108.44),
      const LatLng(11.94, 108.44),
      const LatLng(11.94, 108.46),
      const LatLng(11.93, 108.46),
    ],
    complianceStatus: 'pending',
    areaHectares: 1.8,
    cropType: 'Robusta',
  ),
  FarmPolygon(
    id: 'farm-3',
    name: 'Mountain Blend Co-op',
    farmerName: 'Le Duc Anh',
    points: [
      const LatLng(11.97, 108.48),
      const LatLng(11.98, 108.48),
      const LatLng(11.98, 108.50),
      const LatLng(11.97, 108.50),
    ],
    complianceStatus: 'non-compliant',
    areaHectares: 4.2,
    cropType: 'Arabica',
  ),
];

/// Farm polygon layer widget - renders GeoJSON polygons on map
class FarmPolygonLayer extends StatelessWidget {
  final List<FarmPolygon>? farms;
  final ValueChanged<FarmPolygon>? onPolygonTap;

  const FarmPolygonLayer({
    super.key,
    this.farms,
    this.onPolygonTap,
  });

  @override
  Widget build(BuildContext context) {
    final farmList = farms ?? sampleFarms;

    return PolygonLayer(
      polygons: farmList.map((farm) {
        return Polygon(
          points: farm.points,
          color: farm.fillColor,
          borderColor: farm.borderColor,
          borderStrokeWidth: 2,
        );
      }).toList(),
    );
  }

  void _showFarmPopup(BuildContext context, FarmPolygon farm) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => _FarmInfoPopup(farm: farm),
    );
  }
}

/// Farm info popup bottom sheet
class _FarmInfoPopup extends StatelessWidget {
  final FarmPolygon farm;

  const _FarmInfoPopup({required this.farm});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppRadius.xl),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.muted,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header row
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            farm.name,
                            style: const TextStyle(
                              fontFamily: 'SpaceMono',
                              fontSize: AppFontSize.lg,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            farm.farmerName,
                            style: const TextStyle(
                              fontFamily: 'SpaceMono',
                              fontSize: AppFontSize.base,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: farm.statusBadge.color.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: Text(
                        farm.statusBadge.label,
                        style: TextStyle(
                          fontFamily: 'SpaceMono',
                          fontSize: AppFontSize.sm,
                          fontWeight: FontWeight.w700,
                          color: farm.statusBadge.color,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),

                // Stats row
                Row(
                  children: [
                    _StatItem(
                      icon: Icons.landscape_rounded,
                      label: 'Area',
                      value: '${farm.areaHectares} ha',
                    ),
                    const SizedBox(width: AppSpacing.xl),
                    if (farm.cropType != null)
                      _StatItem(
                        icon: Icons.eco_rounded,
                        label: 'Crop',
                        value: farm.cropType!,
                      ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xl),

                // View detail button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      // Navigate to farmland detail
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: AppColors.textOnPrimary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                    ),
                    child: const Text(
                      'View Farmland Details',
                      style: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: AppFontSize.base,
                        fontWeight: FontWeight.w700,
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
}

/// Stat item widget
class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 10,
                color: AppColors.textSecondary,
              ),
            ),
            Text(
              value,
              style: const TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: AppFontSize.base,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
