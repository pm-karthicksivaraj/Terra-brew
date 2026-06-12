import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/widgets/app_button.dart';

/// Polygon editor state
class PolygonEditorState {
  final List<LatLng> vertices;
  final bool isDrawing;
  final int? selectedVertexIndex;

  const PolygonEditorState({
    this.vertices = const [],
    this.isDrawing = true,
    this.selectedVertexIndex,
  });

  PolygonEditorState copyWith({
    List<LatLng>? vertices,
    bool? isDrawing,
    int? selectedVertexIndex,
    bool clearSelection = false,
  }) {
    return PolygonEditorState(
      vertices: vertices ?? this.vertices,
      isDrawing: isDrawing ?? this.isDrawing,
      selectedVertexIndex: clearSelection ? null : (selectedVertexIndex ?? this.selectedVertexIndex),
    );
  }
}

/// Polygon drawing editor widget
class PolygonEditor extends StatefulWidget {
  final ValueChanged<List<LatLng>>? onPolygonComplete;
  final ValueChanged<Map<String, dynamic>>? onGeoJsonExport;

  const PolygonEditor({
    super.key,
    this.onPolygonComplete,
    this.onGeoJsonExport,
  });

  @override
  State<PolygonEditor> createState() => _PolygonEditorState();
}

class _PolygonEditorState extends State<PolygonEditor> {
  PolygonEditorState _state = const PolygonEditorState();

  void _addVertex(LatLng point) {
    if (!_state.isDrawing) return;
    setState(() {
      _state = _state.copyWith(
        vertices: [..._state.vertices, point],
      );
    });
  }

  void _updateVertex(int index, LatLng newPoint) {
    final vertices = [..._state.vertices];
    if (index >= 0 && index < vertices.length) {
      vertices[index] = newPoint;
      setState(() {
        _state = _state.copyWith(vertices: vertices);
      });
    }
  }

  void _removeVertex(int index) {
    final vertices = [..._state.vertices]..removeAt(index);
    setState(() {
      _state = _state.copyWith(
        vertices: vertices,
        clearSelection: true,
      );
    });
  }

  void _clearPolygon() {
    setState(() {
      _state = const PolygonEditorState();
    });
  }

  void _finishDrawing() {
    if (_state.vertices.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('At least 3 vertices are required')),
      );
      return;
    }
    setState(() {
      _state = _state.copyWith(isDrawing: false);
    });
    widget.onPolygonComplete?.call(_state.vertices);
  }

  double _calculateArea() {
    if (_state.vertices.length < 3) return 0;
    return _calculateHaversineArea(_state.vertices);
  }

  /// Calculate polygon area using Haversine formula (spherical excess)
  double _calculateHaversineArea(List<LatLng> points) {
    const earthRadius = 6371000.0; // meters
    final n = points.length;
    if (n < 3) return 0;

    double totalAngle = 0;
    for (int i = 0; i < n; i++) {
      final prev = points[(i - 1 + n) % n];
      final curr = points[i];
      final next = points[(i + 1) % n];

      // Calculate bearing angles
      final bearing1 = _bearing(prev, curr);
      final bearing2 = _bearing(curr, next);

      double angle = bearing2 - bearing1;
      if (angle < -180) angle += 360;
      if (angle > 180) angle -= 360;

      totalAngle += angle;
    }

    // Spherical excess in radians
    final excess = (totalAngle.abs() - (n - 2) * 180) * pi / 180;
    final area = earthRadius * earthRadius * excess.abs();

    // Convert from m² to hectares
    return area / 10000;
  }

  double _bearing(LatLng from, LatLng to) {
    final lat1 = from.latitude * pi / 180;
    final lat2 = to.latitude * pi / 180;
    final dLon = (to.longitude - from.longitude) * pi / 180;

    final y = sin(dLon) * cos(lat2);
    final x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLon);
    final bearing = atan2(y, x) * 180 / pi;

    return (bearing + 360) % 360;
  }

  Map<String, dynamic> _exportGeoJson() {
    final coords = _state.vertices
        .map((p) => [p.longitude, p.latitude])
        .toList();

    // Close the ring
    if (coords.isNotEmpty && (coords.first[0] != coords.last[0] || coords.first[1] != coords.last[1])) {
      coords.add(List<double>.from(coords.first));
    }

    return {
      'type': 'Feature',
      'properties': {
        'area_hectares': _calculateArea(),
        'vertex_count': _state.vertices.length,
      },
      'geometry': {
        'type': 'Polygon',
        'coordinates': [coords],
      },
    };
  }

  void _doExport() {
    if (_state.vertices.length < 3) return;
    final geoJson = _exportGeoJson();
    widget.onGeoJsonExport?.call(geoJson);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('GeoJSON exported with ${_state.vertices.length} vertices'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final area = _calculateArea();

    return Column(
      children: [
        // Map layer with polygon
        Expanded(
          child: Stack(
            children: [
              FlutterMap(
                options: MapOptions(
                  initialCenter: const LatLng(11.9404, 108.4584),
                  initialZoom: 13,
                  onTap: (tapPosition, point) {
                    if (_state.isDrawing) {
                      _addVertex(point);
                    }
                  },
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.terrabrew.coffee',
                  ),
                  if (_state.vertices.length >= 3)
                    PolygonLayer(
                      polygons: [
                        Polygon(
                          points: _state.vertices,
                          color: AppColors.primary.withOpacity(0.2),
                          borderColor: AppColors.primary,
                          borderStrokeWidth: 2,
                          isFilled: true,
                        ),
                      ],
                    ),
                  if (_state.vertices.length >= 2)
                    PolylineLayer(
                      polylines: [
                        Polyline(
                          points: [..._state.vertices, _state.vertices.first],
                          color: AppColors.primary,
                          strokeWidth: 2,
                          pattern: StrokePattern.dashed(
                            segments: [8.0, 4.0],
                          ),
                        ),
                      ],
                    ),
                  // Vertex markers
                  MarkerLayer(
                    markers: _state.vertices.asMap().entries.map((entry) {
                      final index = entry.key;
                      final point = entry.value;
                      final isSelected = _state.selectedVertexIndex == index;

                      return Marker(
                        point: point,
                        width: isSelected ? 28 : 20,
                        height: isSelected ? 28 : 20,
                        child: GestureDetector(
                          onLongPress: () => _removeVertex(index),
                          onPanUpdate: (details) {
                            // Drag vertex - simplified; in real app, convert screen coords to LatLng
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.danger : AppColors.primary,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.background,
                                width: 2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.overlay,
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Center(
                              child: Text(
                                '${index + 1}',
                                style: TextStyle(
                                  fontFamily: 'SpaceMono',
                                  fontSize: isSelected ? 10 : 8,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textOnPrimary,
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
              // Instructions
              if (_state.isDrawing && _state.vertices.isEmpty)
                Positioned(
                  top: 16,
                  left: 16,
                  right: 16,
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: const Text(
                      'Tap on the map to add vertices for your polygon',
                      style: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: AppFontSize.sm,
                        color: AppColors.textOnPrimary,
                      ),
                    ),
                  ),
                ),
              if (_state.isDrawing && _state.vertices.isNotEmpty)
                Positioned(
                  top: 16,
                  left: 16,
                  right: 16,
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: Text(
                      '${_state.vertices.length} vertices added. ${_state.vertices.length < 3 ? 'Need at least 3.' : 'Long-press a vertex to delete it.'}',
                      style: const TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: AppFontSize.sm,
                        color: AppColors.textOnPrimary,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),

        // Bottom toolbar
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: AppColors.background,
            boxShadow: [
              BoxShadow(
                color: AppColors.overlay,
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Area display
                if (area > 0)
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.md),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.straighten_rounded, color: AppColors.primary, size: 18),
                        const SizedBox(width: 6),
                        Text(
                          'Area: ${area.toStringAsFixed(2)} hectares',
                          style: const TextStyle(
                            fontFamily: 'SpaceMono',
                            fontSize: AppFontSize.base,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                // Action buttons
                Row(
                  children: [
                    if (_state.isDrawing && _state.vertices.length >= 3)
                      Expanded(
                        child: AppButton(
                          label: 'Finish',
                          variant: AppButtonVariant.primary,
                          icon: Icons.check_rounded,
                          onPressed: _finishDrawing,
                          fullWidth: true,
                        ),
                      ),
                    if (!_state.isDrawing) ...[
                      Expanded(
                        child: AppButton(
                          label: 'Export GeoJSON',
                          variant: AppButtonVariant.primary,
                          icon: Icons.download_rounded,
                          onPressed: _doExport,
                          fullWidth: true,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                    ],
                    if (_state.vertices.isNotEmpty)
                      Expanded(
                        child: AppButton(
                          label: 'Clear',
                          variant: AppButtonVariant.danger,
                          icon: Icons.delete_outline_rounded,
                          onPressed: _clearPolygon,
                          fullWidth: true,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
