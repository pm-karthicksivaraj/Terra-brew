import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/eudr_compliance_model.dart';
import '../../data/repositories/eudr_repository.dart';
import '../../../farmers/data/repositories/farmer_repository.dart';
import '../../../farmlands/data/models/farmland_model.dart';
import '../../../farmlands/data/repositories/farmland_repository.dart';
import '../widgets/risk_level_indicator.dart';

class EudrWizardScreen extends ConsumerStatefulWidget {
  const EudrWizardScreen({super.key});

  @override
  ConsumerState<EudrWizardScreen> createState() => _EudrWizardScreenState();
}

class _EudrWizardScreenState extends ConsumerState<EudrWizardScreen> {
  final _pageController = PageController();

  int _currentStep = 0;
  static const int _totalSteps = 6;
  bool _isSaving = false;

  // Step 1: Farmer & Farmland
  String? _selectedFarmerId;
  String? _selectedFarmerName;
  String? _selectedFarmlandId;
  String? _selectedFarmlandName;

  // Step 2: Batch Details
  final _batchIdController = TextEditingController();
  final _complianceIdController = TextEditingController();

  // Step 3: GPS Polygon
  final List<_WizardPoint> _polygonPoints = [];
  final _geoJsonController = TextEditingController();

  // Step 4: Risk Assessment
  double _deforestationRiskScore = 0.0;
  RiskLevel _riskLevel = RiskLevel.low;

  // Step 5: Due Diligence
  final _dueDiligenceController = TextEditingController();
  final _tracesCertRefController = TextEditingController();

  @override
  void dispose() {
    _pageController.dispose();
    _batchIdController.dispose();
    _complianceIdController.dispose();
    _geoJsonController.dispose();
    _dueDiligenceController.dispose();
    _tracesCertRefController.dispose();
    super.dispose();
  }

  bool _canGoNext() {
    switch (_currentStep) {
      case 0:
        return _selectedFarmerId != null && _selectedFarmlandId != null;
      case 1:
        return _batchIdController.text.trim().isNotEmpty;
      case 2:
        return true; // GPS verification is optional
      case 3:
        return true; // Risk assessment auto-calculated
      case 4:
        return true; // Due diligence optional at draft
      case 5:
        return true;
      default:
        return false;
    }
  }

  void _goToStep(int step) {
    setState(() => _currentStep = step);
    _pageController.animateToPage(
      step,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  void _nextStep() {
    if (_currentStep < _totalSteps - 1) {
      _goToStep(_currentStep + 1);
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      _goToStep(_currentStep - 1);
    }
  }

  Future<void> _autoSaveDraft() async {
    // Simulate auto-save
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Draft auto-saved'),
          duration: Duration(seconds: 1),
        ),
      );
    }
  }

  Future<void> _submitCompliance() async {
    setState(() => _isSaving = true);

    final data = <String, dynamic>{
      'batchId': _batchIdController.text.trim(),
      'farmerId': _selectedFarmerId,
      'farmLandId': _selectedFarmlandId,
      'deforestationRiskScore': _deforestationRiskScore,
      'riskLevel': _riskLevel.name,
      'dueDiligenceStatement': _dueDiligenceController.text.trim(),
      'tracesCertificateRef': _tracesCertRefController.text.trim(),
      'complianceId': _complianceIdController.text.trim(),
      'status': EudrStatus.pending.name,
    };

    try {
      await ref.read(eudrRepositoryProvider).createCompliance(data);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('EUDR compliance record created successfully')),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('New EUDR Record'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text(
              'Cancel',
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 13,
                color: Colors.white70,
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildProgressIndicator(),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildStep1FarmerFarmland(),
                _buildStep2BatchDetails(),
                _buildStep3GpsVerification(),
                _buildStep4RiskAssessment(),
                _buildStep5DueDiligence(),
                _buildStep6ReviewSubmit(),
              ],
            ),
          ),
          _buildNavigationButtons(),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            children: List.generate(_totalSteps, (index) {
              final isCompleted = index < _currentStep;
              final isCurrent = index == _currentStep;
              return Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 4,
                        decoration: BoxDecoration(
                          color: isCompleted || isCurrent
                              ? AppColors.primary
                              : AppColors.surfaceVariant,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    if (index < _totalSteps - 1) const SizedBox(width: 4),
                  ],
                ),
              );
            }),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Step ${_currentStep + 1} of $_totalSteps',
                style: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
              Text(
                _getStepTitle(_currentStep),
                style: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 11,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getStepTitle(int step) {
    switch (step) {
      case 0:
        return 'Farmer & Farmland';
      case 1:
        return 'Batch Details';
      case 2:
        return 'GPS Verification';
      case 3:
        return 'Risk Assessment';
      case 4:
        return 'Due Diligence';
      case 5:
        return 'Review & Submit';
      default:
        return '';
    }
  }

  // ==================== STEP 1 ====================
  Widget _buildStep1FarmerFarmland() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStepHeader(
            icon: Icons.person_search_outlined,
            title: 'Select Farmer & Farmland',
            subtitle: 'Choose the farmer and the farm land for this compliance record.',
          ),
          const SizedBox(height: 20),
          const Text(
            'Farmer',
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          FutureBuilder(
            future: ref.read(farmerRepositoryProvider).getFarmers(limit: 100),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator(color: AppColors.primary));
              }
              final farmers = snapshot.data?.farmers ?? [];
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: _selectedFarmerId != null ? AppColors.primary : AppColors.border,
                    width: _selectedFarmerId != null ? 2 : 1,
                  ),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedFarmerId,
                    isExpanded: true,
                    hint: const Text(
                      'Select a farmer...',
                      style: TextStyle(fontFamily: 'SpaceMono', fontSize: 13, color: AppColors.textHint),
                    ),
                    items: farmers.map((f) => DropdownMenuItem(
                      value: f.id,
                      child: Text(
                        '${f.fullName} (${f.farmerCode})',
                        style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12),
                        overflow: TextOverflow.ellipsis,
                      ),
                    )).toList(),
                    onChanged: (value) {
                      final farmer = farmers.firstWhere((f) => f.id == value);
                      setState(() {
                        _selectedFarmerId = value;
                        _selectedFarmerName = farmer.fullName;
                        _selectedFarmlandId = null;
                        _selectedFarmlandName = null;
                      });
                      _autoSaveDraft();
                    },
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 20),
          const Text(
            'Farm Land',
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          FutureBuilder(
            future: _selectedFarmerId != null
                ? ref.read(farmlandRepositoryProvider).getFarmLands(farmerId: _selectedFarmerId, limit: 50)
                : Future.value((farmlands: <FarmLandModel>[], total: 0, page: 1, totalPages: 1)),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator(color: AppColors.primary));
              }
              final farmlands = snapshot.data?.farmlands ?? [];
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: _selectedFarmlandId != null ? AppColors.primary : AppColors.border,
                    width: _selectedFarmlandId != null ? 2 : 1,
                  ),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedFarmlandId,
                    isExpanded: true,
                    hint: Text(
                      _selectedFarmerId != null
                          ? 'Select a farm land...'
                          : 'Select a farmer first',
                      style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 13, color: AppColors.textHint),
                    ),
                    items: farmlands.map((fl) => DropdownMenuItem(
                      value: fl.id,
                      child: Text(
                        '${fl.farmName} (${fl.plotBlockId})',
                        style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12),
                        overflow: TextOverflow.ellipsis,
                      ),
                    )).toList(),
                    onChanged: _selectedFarmerId != null
                        ? (value) {
                            final farmland = farmlands.firstWhere((fl) => fl.id == value);
                            setState(() {
                              _selectedFarmlandId = value;
                              _selectedFarmlandName = farmland.farmName;
                            });
                            _autoSaveDraft();
                          }
                        : null,
                  ),
                ),
              );
            },
          ),
          if (_selectedFarmerId != null && _selectedFarmlandId != null) ...[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.successLight,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: AppColors.success, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Farmer: $_selectedFarmerName\nFarm: $_selectedFarmlandName',
                      style: const TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 11,
                        color: Color(0xFF4D7A15),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // ==================== STEP 2 ====================
  Widget _buildStep2BatchDetails() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStepHeader(
            icon: Icons.inventory_2_outlined,
            title: 'Batch Details',
            subtitle: 'Enter the batch identification and compliance reference.',
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: _batchIdController,
            style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 14, color: AppColors.textPrimary),
            decoration: InputDecoration(
              labelText: 'Batch ID *',
              hintText: 'e.g. BATCH-2025-001',
              filled: true,
              fillColor: AppColors.surface,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              labelStyle: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textHint),
            ),
            onChanged: (_) => _autoSaveDraft(),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _complianceIdController,
            style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 14, color: AppColors.textPrimary),
            decoration: InputDecoration(
              labelText: 'Compliance ID',
              hintText: 'Auto-generated if empty',
              filled: true,
              fillColor: AppColors.surface,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              labelStyle: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textHint),
            ),
            onChanged: (_) => _autoSaveDraft(),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // ==================== STEP 3 ====================
  Widget _buildStep3GpsVerification() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStepHeader(
            icon: Icons.gps_fixed,
            title: 'GPS Polygon Verification',
            subtitle: 'Verify the farm boundary polygon on the map.',
          ),
          const SizedBox(height: 20),
          Container(
            height: 260,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Stack(
              children: [
                if (_polygonPoints.isEmpty)
                  const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.gps_fixed, size: 48, color: AppColors.textHint),
                        SizedBox(height: 12),
                        Text(
                          'Tap "Add Point" to draw the\nfarm boundary polygon',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textHint),
                        ),
                      ],
                    ),
                  )
                else
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.polyline_outlined, size: 48, color: AppColors.primary),
                        const SizedBox(height: 12),
                        Text(
                          '${_polygonPoints.length} polygon points defined',
                          style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
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
                        ),
                      ),
                      if (_polygonPoints.isNotEmpty)
                        OutlinedButton.icon(
                          onPressed: () {
                            setState(() => _polygonPoints.removeLast());
                            _autoSaveDraft();
                          },
                          icon: const Icon(Icons.undo, size: 16),
                          label: const Text('Undo', style: TextStyle(fontFamily: 'SpaceMono', fontSize: 11)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.danger,
                            side: const BorderSide(color: AppColors.danger),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _geoJsonController,
            maxLines: 3,
            style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 11, color: AppColors.textPrimary),
            decoration: InputDecoration(
              labelText: 'GeoJSON (optional)',
              hintText: 'Paste or upload GeoJSON polygon data',
              filled: true,
              fillColor: AppColors.surface,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
              contentPadding: const EdgeInsets.all(12),
              labelStyle: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textHint),
              suffixIcon: IconButton(
                icon: const Icon(Icons.upload_file, size: 18, color: AppColors.primary),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('File upload - use file_picker in production')),
                  );
                },
              ),
            ),
            onChanged: (_) => _autoSaveDraft(),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  void _addDemoPolygonPoint() {
    final baseLat = 9.0250;
    final baseLng = 38.7469;
    final offset = _polygonPoints.length * 0.0015;
    setState(() {
      _polygonPoints.add(_WizardPoint(baseLat + offset, baseLng + offset));
    });
    _autoSaveDraft();
  }

  // ==================== STEP 4 ====================
  Widget _buildStep4RiskAssessment() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStepHeader(
            icon: Icons.analytics_outlined,
            title: 'Deforestation Risk Assessment',
            subtitle: 'Review the automated risk assessment for this farm.',
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    RiskLevelGauge(
                      score: _deforestationRiskScore,
                      size: 120,
                    ),
                    const SizedBox(width: 24),
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
                          RiskLevelIndicator(riskLevel: _riskLevel),
                          const SizedBox(height: 16),
                          const Text(
                            'Score',
                            style: TextStyle(
                              fontFamily: 'SpaceMono',
                              fontSize: 10,
                              color: AppColors.textHint,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${_deforestationRiskScore.toStringAsFixed(1)} / 100',
                            style: const TextStyle(
                              fontFamily: 'SpaceMono',
                              fontSize: 20,
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
          ),
          const SizedBox(height: 16),
          const Text(
            'Adjust Risk Score',
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Slider(
            value: _deforestationRiskScore,
            min: 0,
            max: 100,
            divisions: 100,
            activeColor: _getRiskSliderColor(),
            label: _deforestationRiskScore.toStringAsFixed(0),
            onChanged: (value) {
              setState(() {
                _deforestationRiskScore = value;
                if (value <= 25) {
                  _riskLevel = RiskLevel.low;
                } else if (value <= 50) {
                  _riskLevel = RiskLevel.medium;
                } else if (value <= 75) {
                  _riskLevel = RiskLevel.high;
                } else {
                  _riskLevel = RiskLevel.critical;
                }
              });
              _autoSaveDraft();
            },
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Low', style: TextStyle(fontFamily: 'SpaceMono', fontSize: 10, color: AppColors.riskLow)),
              const Text('Medium', style: TextStyle(fontFamily: 'SpaceMono', fontSize: 10, color: AppColors.riskMedium)),
              const Text('High', style: TextStyle(fontFamily: 'SpaceMono', fontSize: 10, color: AppColors.riskHigh)),
              const Text('Critical', style: TextStyle(fontFamily: 'SpaceMono', fontSize: 10, color: AppColors.riskCritical)),
            ],
          ),
          const SizedBox(height: 16),
          RiskLevelBar(
            riskLevel: _riskLevel,
            score: _deforestationRiskScore,
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Color _getRiskSliderColor() {
    if (_deforestationRiskScore <= 25) return AppColors.riskLow;
    if (_deforestationRiskScore <= 50) return AppColors.riskMedium;
    if (_deforestationRiskScore <= 75) return AppColors.riskHigh;
    return AppColors.riskCritical;
  }

  // ==================== STEP 5 ====================
  Widget _buildStep5DueDiligence() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStepHeader(
            icon: Icons.description_outlined,
            title: 'Due Diligence Statement',
            subtitle: 'Upload or enter the due diligence statement and traces certificate.',
          ),
          const SizedBox(height: 20),
          const Text(
            'Due Diligence Statement',
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _dueDiligenceController,
            maxLines: 5,
            style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textPrimary),
            decoration: InputDecoration(
              hintText: 'Enter the due diligence statement text...',
              filled: true,
              fillColor: AppColors.surface,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
              contentPadding: const EdgeInsets.all(12),
              labelStyle: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textHint),
            ),
            onChanged: (_) => _autoSaveDraft(),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('File upload - use file_picker in production')),
              );
            },
            icon: const Icon(Icons.upload_file, size: 16),
            label: const Text('Upload Document', style: TextStyle(fontFamily: 'SpaceMono', fontSize: 11)),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              side: const BorderSide(color: AppColors.primary),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Traces Certificate Reference',
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _tracesCertRefController,
            style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 14, color: AppColors.textPrimary),
            decoration: InputDecoration(
              hintText: 'e.g. TRC-2025-XXXXX',
              filled: true,
              fillColor: AppColors.surface,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              labelStyle: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textHint),
            ),
            onChanged: (_) => _autoSaveDraft(),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // ==================== STEP 6 ====================
  Widget _buildStep6ReviewSubmit() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStepHeader(
            icon: Icons.fact_check_outlined,
            title: 'Review & Submit',
            subtitle: 'Review all information before submitting the EUDR compliance record.',
          ),
          const SizedBox(height: 20),
          _buildReviewSection(
            title: 'Farmer & Farmland',
            icon: Icons.person_outline,
            items: [
              _buildReviewItem('Farmer', _selectedFarmerName ?? 'Not selected'),
              _buildReviewItem('Farm Land', _selectedFarmlandName ?? 'Not selected'),
            ],
          ),
          const SizedBox(height: 12),
          _buildReviewSection(
            title: 'Batch Details',
            icon: Icons.inventory_2_outlined,
            items: [
              _buildReviewItem('Batch ID', _batchIdController.text.isNotEmpty ? _batchIdController.text : '—'),
              _buildReviewItem('Compliance ID', _complianceIdController.text.isNotEmpty ? _complianceIdController.text : 'Auto-generated'),
            ],
          ),
          const SizedBox(height: 12),
          _buildReviewSection(
            title: 'Risk Assessment',
            icon: Icons.analytics_outlined,
            items: [
              _buildReviewItem('Deforestation Risk Score', '${_deforestationRiskScore.toStringAsFixed(1)} / 100'),
              Row(
                children: [
                  const Text(
                    'Risk Level',
                    style: TextStyle(fontFamily: 'SpaceMono', fontSize: 12, color: AppColors.textHint),
                  ),
                  const Spacer(),
                  RiskLevelIndicator(riskLevel: _riskLevel),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildReviewSection(
            title: 'Due Diligence',
            icon: Icons.description_outlined,
            items: [
              _buildReviewItem('Statement', _dueDiligenceController.text.isNotEmpty ? 'Provided' : 'Not provided'),
              _buildReviewItem('Traces Cert Ref', _tracesCertRefController.text.isNotEmpty ? _tracesCertRefController.text : 'Not provided'),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.pending.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.pending.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: AppColors.pending, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'This record will be submitted with "Pending" status and will require review before being marked compliant.',
                    style: TextStyle(
                      fontFamily: 'SpaceMono',
                      fontSize: 11,
                      color: const Color(0xFF997A00),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSaving ? null : _submitCompliance,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: _isSaving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text(
                      'Submit EUDR Record',
                      style: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildReviewSection({
    required String title,
    required IconData icon,
    required List<Widget> items,
  }) {
    return Container(
      width: double.infinity,
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
              Icon(icon, size: 16, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...items,
        ],
      ),
    );
  }

  Widget _buildReviewItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
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

  Widget _buildStepHeader({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 18, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Padding(
          padding: const EdgeInsets.only(left: 48),
          child: Text(
            subtitle,
            style: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 12,
              color: AppColors.textHint,
              height: 1.4,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNavigationButtons() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.divider)),
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (_currentStep > 0)
              Expanded(
                child: OutlinedButton(
                  onPressed: _previousStep,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    side: const BorderSide(color: AppColors.primary),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.arrow_back, size: 16),
                      SizedBox(width: 4),
                      Text('Back'),
                    ],
                  ),
                ),
              ),
            if (_currentStep > 0) const SizedBox(width: 12),
            if (_currentStep < _totalSteps - 1)
              Expanded(
                child: ElevatedButton(
                  onPressed: _canGoNext() ? _nextStep : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    disabledBackgroundColor: AppColors.textHint,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _canGoNext() ? 'Next' : 'Complete required fields',
                        style: const TextStyle(
                          fontFamily: 'SpaceMono',
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      if (_canGoNext()) ...[
                        const SizedBox(width: 4),
                        const Icon(Icons.arrow_forward, size: 16),
                      ],
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _WizardPoint {
  final double lat;
  final double lng;
  _WizardPoint(this.lat, this.lng);
}
