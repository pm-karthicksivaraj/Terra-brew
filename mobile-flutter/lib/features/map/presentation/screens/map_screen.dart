import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/widgets/search_bar_widget.dart';
import '../widgets/farm_polygon_layer.dart';
import '../widgets/location_picker.dart';

/// Default map center: Vietnam coffee region (approx)
const _defaultCenter = LatLng(11.9404, 108.4584);
const _defaultZoom = 10.0;

/// Map layer type
enum MapLayerType { streets, satellite }

/// Drawing mode state
enum DrawingMode { none, polygon, marker }

/// Map state provider
final mapCenterProvider = StateProvider<LatLng>((ref) => _defaultCenter);
final mapZoomProvider = StateProvider<double>((ref) => _defaultZoom);
final mapLayerProvider = StateProvider<MapLayerType>((ref) => MapLayerType.streets);
final drawingModeProvider = StateProvider<DrawingMode>((ref) => DrawingMode.none);

/// Full map screen using flutter_map + OpenStreetMap
class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen>
    with SingleTickerProviderStateMixin {
  final MapController _mapController = MapController();
  late AnimationController _fabAnimationController;

  @override
  void initState() {
    super.initState();
    _fabAnimationController = AnimationController(
      vsync: this,
      duration: AppDuration.normal,
    )..forward();
  }

  @override
  void dispose() {
    _fabAnimationController.dispose();
    super.dispose();
  }

  void _goToMyLocation() async {
    // In a real app, use geolocator to get GPS position
    _mapController.move(_defaultCenter, 13);
  }

  void _toggleLayer() {
    final current = ref.read(mapLayerProvider);
    ref.read(mapLayerProvider.notifier).state =
        current == MapLayerType.streets ? MapLayerType.satellite : MapLayerType.streets;
  }

  void _startDrawing(DrawingMode mode) {
    ref.read(drawingModeProvider.notifier).state = mode;
  }

  void _stopDrawing() {
    ref.read(drawingModeProvider.notifier).state = DrawingMode.none;
  }

  @override
  Widget build(BuildContext context) {
    final layerType = ref.watch(mapLayerProvider);
    final drawingMode = ref.watch(drawingModeProvider);

    return Scaffold(
      body: Stack(
        children: [
          // Map
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _defaultCenter,
              initialZoom: _defaultZoom,
              onPositionChanged: (position, hasGesture) {
                if (position.center != null) {
                  ref.read(mapCenterProvider.notifier).state = position.center!;
                }
                if (position.zoom != null) {
                  ref.read(mapZoomProvider.notifier).state = position.zoom!;
                }
              },
              onTap: (tapPosition, point) {
                if (drawingMode != DrawingMode.none) return;
                // Dismiss any popups
              },
            ),
            children: [
              // Tile layer
              TileLayer(
                urlTemplate: layerType == MapLayerType.streets
                    ? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                userAgentPackageName: 'com.terrabrew.coffee',
              ),

              // Farm polygons layer
              const FarmPolygonLayer(),

              // Location picker (for drawing mode)
              if (drawingMode == DrawingMode.marker)
                LocationPickerLayer(
                  onLocationSelected: (latlng) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Location: ${latlng.latitude.toStringAsFixed(4)}, ${latlng.longitude.toStringAsFixed(4)}',
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),

          // Search bar at top
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            left: AppSpacing.lg,
            right: AppSpacing.lg,
            child: SearchBarWidget(
              hint: 'Search farms, locations...',
              onSearch: (query) {
                // In a real app, geocode search and move map
              },
            ),
          ),

          // Drawing mode banner
          if (drawingMode != DrawingMode.none)
            Positioned(
              top: MediaQuery.of(context).padding.top + 64,
              left: AppSpacing.lg,
              right: AppSpacing.lg,
              child: _DrawingModeBanner(
                mode: drawingMode,
                onStop: _stopDrawing,
              ),
            ),

          // Right side controls
          Positioned(
            right: AppSpacing.lg,
            bottom: MediaQuery.of(context).padding.bottom + 160,
            child: FadeTransition(
              opacity: _fabAnimationController,
              child: _MapControls(
                onMyLocation: _goToMyLocation,
                onToggleLayer: _toggleLayer,
                layerType: layerType,
              ),
            ),
          ),

          // Drawing FABs
          Positioned(
            right: AppSpacing.lg,
            bottom: MediaQuery.of(context).padding.bottom + 80,
            child: FadeTransition(
              opacity: _fabAnimationController,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _MiniFab(
                    icon: Icons.draw_rounded,
                    label: 'Draw Polygon',
                    isActive: drawingMode == DrawingMode.polygon,
                    onTap: () => _startDrawing(DrawingMode.polygon),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _MiniFab(
                    icon: Icons.add_location_alt_rounded,
                    label: 'Pick Location',
                    isActive: drawingMode == DrawingMode.marker,
                    onTap: () => _startDrawing(DrawingMode.marker),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Map control buttons
class _MapControls extends StatelessWidget {
  final VoidCallback onMyLocation;
  final VoidCallback onToggleLayer;
  final MapLayerType layerType;

  const _MapControls({
    required this.onMyLocation,
    required this.onToggleLayer,
    required this.layerType,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _MapButton(
          icon: layerType == MapLayerType.streets
              ? Icons.satellite_alt_rounded
              : Icons.map_rounded,
          onTap: onToggleLayer,
          tooltip: layerType == MapLayerType.streets ? 'Satellite' : 'Streets',
        ),
        const SizedBox(height: AppSpacing.sm),
        _MapButton(
          icon: Icons.my_location_rounded,
          onTap: onMyLocation,
          tooltip: 'My Location',
        ),
      ],
    );
  }
}

/// Map floating button
class _MapButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final String tooltip;

  const _MapButton({
    required this.icon,
    required this.onTap,
    required this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(AppRadius.md),
          boxShadow: [
            BoxShadow(
              color: AppColors.overlay,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(icon, color: AppColors.primary, size: 22),
      ),
    );
  }
}

/// Mini floating action button with label
class _MiniFab extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _MiniFab({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : AppColors.background,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          boxShadow: [
            BoxShadow(
              color: AppColors.overlay,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isActive ? AppColors.textOnPrimary : AppColors.primary,
              size: 18,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: AppFontSize.sm,
                fontWeight: FontWeight.w600,
                color: isActive ? AppColors.textOnPrimary : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Drawing mode banner
class _DrawingModeBanner extends StatelessWidget {
  final DrawingMode mode;
  final VoidCallback onStop;

  const _DrawingModeBanner({
    required this.mode,
    required this.onStop,
  });

  String get _label {
    switch (mode) {
      case DrawingMode.polygon:
        return 'Tap to add polygon vertices';
      case DrawingMode.marker:
        return 'Long press to place a marker';
      case DrawingMode.none:
        return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Row(
        children: [
          const Icon(Icons.edit_rounded, color: AppColors.textOnPrimary, size: 18),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              _label,
              style: const TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: AppFontSize.sm,
                color: AppColors.textOnPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          GestureDetector(
            onTap: onStop,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.textOnPrimary,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: const Text(
                'Done',
                style: TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: AppFontSize.sm,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
