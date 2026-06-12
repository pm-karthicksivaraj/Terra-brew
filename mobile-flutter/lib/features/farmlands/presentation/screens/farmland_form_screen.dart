import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../data/repositories/farmland_repository.dart';
import '../../../farmers/data/repositories/farmer_repository.dart';

class FarmLandFormScreen extends ConsumerStatefulWidget {
  final String? farmlandId;

  const FarmLandFormScreen({super.key, this.farmlandId});

  @override
  ConsumerState<FarmLandFormScreen> createState() => _FarmLandFormScreenState();
}

class _FarmLandFormScreenState extends ConsumerState<FarmLandFormScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _farmNameController;
  late TextEditingController _plotBlockIdController;
  late TextEditingController _totalLandHoldingController;
  late TextEditingController _altitudeController;
  late TextEditingController _noOfTreesController;
  late TextEditingController _boundaryAreaController;
  late TextEditingController _geoCenterLatController;
  late TextEditingController _geoCenterLngController;
  late TextEditingController _polygonGeoJsonController;

  String _selectedSoilType = 'Volcanic';
  String? _selectedFarmerId;
  bool _isLoading = false;
  bool _isEditing = false;

  // Polygon drawing state
  final List<_MapPoint> _polygonPoints = [];

  @override
  void initState() {
    super.initState();
    _isEditing = widget.farmlandId != null;

    _farmNameController = TextEditingController();
    _plotBlockIdController = TextEditingController();
    _totalLandHoldingController = TextEditingController(text: '0.0');
    _altitudeController = TextEditingController(text: '0');
    _noOfTreesController = TextEditingController(text: '0');
    _boundaryAreaController = TextEditingController(text: '0.0');
    _geoCenterLatController = TextEditingController();
    _geoCenterLngController = TextEditingController();
    _polygonGeoJsonController = TextEditingController();

    if (_isEditing) {
      _loadFarmland();
    }
  }

  @override
  void dispose() {
    _farmNameController.dispose();
    _plotBlockIdController.dispose();
    _totalLandHoldingController.dispose();
    _altitudeController.dispose();
    _noOfTreesController.dispose();
    _boundaryAreaController.dispose();
    _geoCenterLatController.dispose();
    _geoCenterLngController.dispose();
    _polygonGeoJsonController.dispose();
    super.dispose();
  }

  Future<void> _loadFarmland() async {
    try {
      final farmland = await ref.read(farmlandRepositoryProvider).getFarmLandById(widget.farmlandId!);
      if (mounted) {
        setState(() {
          _farmNameController.text = farmland.farmName;
          _plotBlockIdController.text = farmland.plotBlockId;
          _totalLandHoldingController.text = farmland.totalLandHolding.toString();
          _altitudeController.text = farmland.altitude.toString();
          _noOfTreesController.text = '${farmland.noOfTrees}';
          _boundaryAreaController.text = farmland.boundaryArea.toString();
          _selectedSoilType = farmland.soilType.isNotEmpty ? farmland.soilType : 'Volcanic';
          if (farmland.geoCenterLat != null) {
            _geoCenterLatController.text = farmland.geoCenterLat.toString();
          }
          if (farmland.geoCenterLng != null) {
            _geoCenterLngController.text = farmland.geoCenterLng.toString();
          }
          _polygonGeoJsonController.text = farmland.polygonGeoJson;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load farm land: $e')),
        );
      }
    }
  }

  void _addPolygonPoint(double lat, double lng) {
    setState(() {
      _polygonPoints.add(_MapPoint(lat, lng));
      _recalculateFromPolygon();
    });
  }

  void _removeLastPoint() {
    if (_polygonPoints.isNotEmpty) {
      setState(() {
        _polygonPoints.removeLast();
        _recalculateFromPolygon();
      });
    }
  }

  void _recalculateFromPolygon() {
    if (_polygonPoints.length >= 3) {
      // Calculate area using shoelace formula (simplified)
      double area = 0;
      for (int i = 0; i < _polygonPoints.length; i++) {
        int j = (i + 1) % _polygonPoints.length;
        area += _polygonPoints[i].lng * _polygonPoints[j].lat;
        area -= _polygonPoints[j].lng * _polygonPoints[i].lat;
      }
      area = (area / 2).abs();

      // Approximate conversion to hectares (rough)
      final avgLat = _polygonPoints.map((p) => p.lat).reduce((a, b) => a + b) / _polygonPoints.length;
      final latFactor = 111320 * (1 - ((avgLat * 3.14159265) / 180).abs().clamp(0, 0.99));
      final areaHa = area * 111320 * latFactor / 10000;

      setState(() {
        _boundaryAreaController.text = areaHa.toStringAsFixed(2);
      });

      // Calculate center
      final centerLat = _polygonPoints.map((p) => p.lat).reduce((a, b) => a + b) / _polygonPoints.length;
      final centerLng = _polygonPoints.map((p) => p.lng).reduce((a, b) => a + b) / _polygonPoints.length;
      _geoCenterLatController.text = centerLat.toStringAsFixed(6);
      _geoCenterLngController.text = centerLng.toStringAsFixed(6);

      // Generate GeoJSON
      final coordinates = _polygonPoints.map((p) => [p.lng, p.lat]).toList();
      coordinates.add(coordinates.first); // Close the polygon
      final geoJson = jsonEncode({
        'type': 'Polygon',
        'coordinates': [coordinates],
      });
      _polygonGeoJsonController.text = geoJson;
    } else {
      _boundaryAreaController.text = '0.0';
      _polygonGeoJsonController.text = '';
    }
  }

  void _useGpsCenter() {
    setState(() {
      _geoCenterLatController.text = '9.025000';
      _geoCenterLngController.text = '38.746900';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('GPS center point captured (demo)')),
    );
  }

  void _addDemoPolygonPoint() {
    final baseLat = 9.0250;
    final baseLng = 38.7469;
    final offset = _polygonPoints.length * 0.001;
    _addPolygonPoint(baseLat + offset, baseLng + offset);
  }

  Future<void> _saveFarmland() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final data = <String, dynamic>{
      'farmName': _farmNameController.text.trim(),
      'plotBlockId': _plotBlockIdController.text.trim(),
      'totalLandHolding': double.tryParse(_totalLandHoldingController.text) ?? 0.0,
      'altitude': double.tryParse(_altitudeController.text) ?? 0.0,
      'soilType': _selectedSoilType,
      'noOfTrees': int.tryParse(_noOfTreesController.text) ?? 0,
      'boundaryArea': double.tryParse(_boundaryAreaController.text) ?? 0.0,
      'polygonGeoJson': _polygonGeoJsonController.text,
    };

    if (_selectedFarmerId != null) {
      data['farmerId'] = _selectedFarmerId;
    }
    if (_geoCenterLatController.text.isNotEmpty) {
      data['geoCenterLat'] = double.tryParse(_geoCenterLatController.text);
    }
    if (_geoCenterLngController.text.isNotEmpty) {
      data['geoCenterLng'] = double.tryParse(_geoCenterLngController.text);
    }

    try {
      if (_isEditing) {
        await ref.read(farmlandRepositoryProvider).updateFarmLand(widget.farmlandId!, data);
      } else {
        await ref.read(farmlandRepositoryProvider).createFarmLand(data);
      }
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_isEditing ? 'Farm land updated' : 'Farm land created')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Farm Land' : 'Add Farm Land'),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _saveFarmland,
            child: const Text(
              'Save',
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildSectionHeader('Basic Information'),
            const SizedBox(height: 12),
            _buildTextFormField(
              controller: _farmNameController,
              label: 'Farm Name *',
              hint: 'Enter farm name',
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Farm name is required' : null,
            ),
            const SizedBox(height: 12),
            _buildTextFormField(
              controller: _plotBlockIdController,
              label: 'Plot/Block ID *',
              hint: 'e.g. PLOT-001',
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Plot ID is required' : null,
            ),
            const SizedBox(height: 12),
            _buildFarmerDropdown(),
            const SizedBox(height: 20),

            _buildSectionHeader('Land Details'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildTextFormField(
                    controller: _totalLandHoldingController,
                    label: 'Total Land (ha)',
                    hint: '0.0',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextFormField(
                    controller: _boundaryAreaController,
                    label: 'Boundary Area (ha)',
                    hint: 'Auto-calculated',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildTextFormField(
                    controller: _altitudeController,
                    label: 'Altitude (masl)',
                    hint: '1800',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextFormField(
                    controller: _noOfTreesController,
                    label: 'Number of Trees',
                    hint: '0',
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildDropdownField(
              label: 'Soil Type',
              value: _selectedSoilType,
              items: AppConstants.soilTypes,
              onChanged: (v) => setState(() => _selectedSoilType = v ?? 'Volcanic'),
            ),
            const SizedBox(height: 20),

            _buildSectionHeader('Map & Boundary'),
            const SizedBox(height: 12),
            _buildPolygonDrawingArea(),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildTextFormField(
                    controller: _geoCenterLatController,
                    label: 'Center Latitude',
                    hint: '9.0250',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextFormField(
                    controller: _geoCenterLngController,
                    label: 'Center Longitude',
                    hint: '38.7469',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton.icon(
                  onPressed: _useGpsCenter,
                  icon: const Icon(Icons.my_location, size: 16),
                  label: const Text('Use GPS', style: TextStyle(fontFamily: 'SpaceMono', fontSize: 11)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildGeoJsonUploadField(),
            const SizedBox(height: 32),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _saveFarmland,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Text(_isEditing ? 'Update' : 'Create'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildFarmerDropdown() {
    return FutureBuilder(
      future: ref.read(farmerRepositoryProvider).getFarmers(limit: 100),
      builder: (context, snapshot) {
        final farmers = snapshot.data?.farmers ?? [];
        return DropdownButtonFormField<String>(
          value: _selectedFarmerId,
          decoration: InputDecoration(
            labelText: 'Link to Farmer',
            filled: true,
            fillColor: AppColors.surface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            labelStyle: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textHint),
          ),
          items: farmers
              .map((f) => DropdownMenuItem(
                    value: f.id,
                    child: Text(
                      '${f.fullName} (${f.farmerCode})',
                      style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ))
              .toList(),
          onChanged: (v) => setState(() => _selectedFarmerId = v),
        );
      },
    );
  }

  Widget _buildPolygonDrawingArea() {
    return Container(
      height: 220,
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Stack(
        children: [
          // Map placeholder with polygon preview
          Center(
            child: _polygonPoints.isEmpty
                ? Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.touch_app_outlined, size: 36, color: AppColors.textHint),
                      const SizedBox(height: 8),
                      const Text(
                        'Tap "Add Point" to draw polygon',
                        style: TextStyle(
                          fontFamily: 'SpaceMono',
                          fontSize: 11,
                          color: AppColors.textHint,
                        ),
                      ),
                    ],
                  )
                : CustomPaint(
                    size: const Size(double.infinity, 220),
                    painter: _PolygonPainter(_polygonPoints),
                  ),
          ),
          // Controls
          Positioned(
            bottom: 8,
            left: 8,
            right: 8,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                ElevatedButton.icon(
                  onPressed: _addDemoPolygonPoint,
                  icon: const Icon(Icons.add_location, size: 16),
                  label: const Text('Add Point', style: TextStyle(fontFamily: 'SpaceMono', fontSize: 11)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    minimumSize: Size.zero,
                  ),
                ),
                Text(
                  '${_polygonPoints.length} points',
                  style: const TextStyle(
                    fontFamily: 'SpaceMono',
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
                if (_polygonPoints.isNotEmpty)
                  OutlinedButton.icon(
                    onPressed: _removeLastPoint,
                    icon: const Icon(Icons.undo, size: 16),
                    label: const Text('Undo', style: TextStyle(fontFamily: 'SpaceMono', fontSize: 11)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.danger,
                      side: const BorderSide(color: AppColors.danger),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      minimumSize: Size.zero,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGeoJsonUploadField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'GeoJSON',
          style: TextStyle(
            fontFamily: 'SpaceMono',
            fontSize: 12,
            color: AppColors.textHint,
          ),
        ),
        const SizedBox(height: 4),
        TextFormField(
          controller: _polygonGeoJsonController,
          maxLines: 3,
          style: const TextStyle(
            fontFamily: 'SpaceMono',
            fontSize: 11,
            color: AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: AppColors.surface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
            hintText: 'Paste GeoJSON or upload a file',
            hintStyle: const TextStyle(fontFamily: 'SpaceMono', fontSize: 11, color: AppColors.textHint),
            suffixIcon: IconButton(
              icon: const Icon(Icons.upload_file, size: 18, color: AppColors.primary),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('File upload - use file_picker in production')),
                );
              },
              tooltip: 'Upload GeoJSON file',
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 20,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontFamily: 'SpaceMono',
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildTextFormField({
    required TextEditingController controller,
    required String label,
    required String hint,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
  }) {
    return TextFormField(
      controller: controller,
      validator: validator,
      keyboardType: keyboardType,
      style: const TextStyle(
        fontFamily: 'SpaceMono',
        fontSize: 14,
        color: AppColors.textPrimary,
      ),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        labelStyle: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textHint),
        hintStyle: const TextStyle(fontFamily: 'SpaceMono', fontSize: 14, color: AppColors.textHint),
      ),
    );
  }

  Widget _buildDropdownField({
    required String label,
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        labelStyle: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textHint),
      ),
      items: items
          .map((item) => DropdownMenuItem(
                value: item,
                child: Text(item, style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12)),
              ))
          .toList(),
      onChanged: onChanged,
    );
  }
}

class _MapPoint {
  final double lat;
  final double lng;
  _MapPoint(this.lat, this.lng);
}

class _PolygonPainter extends CustomPainter {
  final List<_MapPoint> points;

  _PolygonPainter(this.points);

  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty) return;

    final paint = Paint()
      ..color = AppColors.primary.withValues(alpha: 0.2)
      ..style = PaintingStyle.fill;

    final strokePaint = Paint()
      ..color = AppColors.primary
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final dotPaint = Paint()
      ..color = AppColors.primary
      ..style = PaintingStyle.fill;

    // Map points to canvas coordinates
    final lats = points.map((p) => p.lat).toList();
    final lngs = points.map((p) => p.lng).toList();
    final minLat = lats.reduce((a, b) => a < b ? a : b);
    final maxLat = lats.reduce((a, b) => a > b ? a : b);
    final minLng = lngs.reduce((a, b) => a < b ? a : b);
    final maxLng = lngs.reduce((a, b) => a > b ? a : b);
    final latRange = (maxLat - minLat).clamp(0.0001, double.infinity);
    final lngRange = (maxLng - minLng).clamp(0.0001, double.infinity);

    final padding = 30.0;
    final drawWidth = size.width - padding * 2;
    final drawHeight = size.height - padding * 2 - 40;

    final path = Path();
    final offsets = <Offset>[];

    for (int i = 0; i < points.length; i++) {
      final x = padding + ((points[i].lng - minLng) / lngRange) * drawWidth;
      final y = padding + drawHeight - ((points[i].lat - minLat) / latRange) * drawHeight;
      final offset = Offset(x, y);
      offsets.add(offset);

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    if (points.length >= 3) {
      path.close();
      canvas.drawPath(path, paint);
    }
    canvas.drawPath(path, strokePaint);

    for (final offset in offsets) {
      canvas.drawCircle(offset, 5, dotPaint);
      canvas.drawCircle(offset, 5, strokePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
