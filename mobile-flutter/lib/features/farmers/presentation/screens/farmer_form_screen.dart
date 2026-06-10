import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../data/repositories/farmer_repository.dart';

class FarmerFormScreen extends ConsumerStatefulWidget {
  final String? farmerId;

  const FarmerFormScreen({super.key, this.farmerId});

  @override
  ConsumerState<FarmerFormScreen> createState() => _FarmerFormScreenState();
}

class _FarmerFormScreenState extends ConsumerState<FarmerFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _scrollController = ScrollController();

  late TextEditingController _fullNameController;
  late TextEditingController _farmerCodeController;
  late TextEditingController _contactNumberController;
  late TextEditingController _dobController;
  late TextEditingController _provinceController;
  late TextEditingController _districtController;
  late TextEditingController _communeController;
  late TextEditingController _villageController;
  late TextEditingController _latitudeController;
  late TextEditingController _longitudeController;
  late TextEditingController _creditScoreController;
  late TextEditingController _bankNameController;
  late TextEditingController _accountNumberController;

  String _selectedGender = 'Male';
  String _selectedCountry = 'Ethiopia';
  bool _isCertified = false;
  bool _isLoading = false;
  bool _isEditing = false;
  DateTime? _selectedDob;

  @override
  void initState() {
    super.initState();
    _isEditing = widget.farmerId != null;

    _fullNameController = TextEditingController();
    _farmerCodeController = TextEditingController();
    _contactNumberController = TextEditingController();
    _dobController = TextEditingController();
    _provinceController = TextEditingController();
    _districtController = TextEditingController();
    _communeController = TextEditingController();
    _villageController = TextEditingController();
    _latitudeController = TextEditingController();
    _longitudeController = TextEditingController();
    _creditScoreController = TextEditingController(text: '0');
    _bankNameController = TextEditingController();
    _accountNumberController = TextEditingController();

    if (_isEditing) {
      _loadFarmer();
    }
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _farmerCodeController.dispose();
    _contactNumberController.dispose();
    _dobController.dispose();
    _provinceController.dispose();
    _districtController.dispose();
    _communeController.dispose();
    _villageController.dispose();
    _latitudeController.dispose();
    _longitudeController.dispose();
    _creditScoreController.dispose();
    _bankNameController.dispose();
    _accountNumberController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadFarmer() async {
    try {
      final farmer = await ref.read(farmerRepositoryProvider).getFarmerById(widget.farmerId!);
      if (mounted) {
        setState(() {
          _fullNameController.text = farmer.fullName;
          _farmerCodeController.text = farmer.farmerCode;
          _contactNumberController.text = farmer.contactNumber;
          _isCertified = farmer.isCertified;
          _selectedGender = farmer.gender.isNotEmpty ? farmer.gender : 'Male';
          _selectedCountry = farmer.country.isNotEmpty ? farmer.country : 'Ethiopia';
          _provinceController.text = farmer.province;
          _districtController.text = farmer.district;
          _communeController.text = farmer.commune;
          _villageController.text = farmer.village;
          _creditScoreController.text = '${farmer.creditScore}';
          _bankNameController.text = farmer.bankName;
          _accountNumberController.text = farmer.accountNumber;
          if (farmer.latitude != null) {
            _latitudeController.text = farmer.latitude.toString();
          }
          if (farmer.longitude != null) {
            _longitudeController.text = farmer.longitude.toString();
          }
          if (farmer.dob != null) {
            _selectedDob = DateTime.tryParse(farmer.dob!);
            _dobController.text = farmer.dob!;
          }
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load farmer: $e')),
        );
      }
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDob ?? DateTime(1990),
      firstDate: DateTime(1940),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              surface: AppColors.surface,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _selectedDob = picked;
        _dobController.text = '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
      });
    }
  }

  Future<void> _useCurrentLocation() async {
    // In production, use geolocator package
    setState(() {
      _latitudeController.text = '9.0250';
      _longitudeController.text = '38.7469';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('GPS location captured (demo coordinates)')),
    );
  }

  Future<void> _saveFarmer() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final data = <String, dynamic>{
      'fullName': _fullNameController.text.trim(),
      'farmerCode': _farmerCodeController.text.trim(),
      'contactNumber': _contactNumberController.text.trim(),
      'isCertified': _isCertified,
      'gender': _selectedGender,
      'country': _selectedCountry,
      'province': _provinceController.text.trim(),
      'district': _districtController.text.trim(),
      'commune': _communeController.text.trim(),
      'village': _villageController.text.trim(),
      'creditScore': int.tryParse(_creditScoreController.text) ?? 0,
      'bankName': _bankNameController.text.trim(),
      'accountNumber': _accountNumberController.text.trim(),
    };

    if (_selectedDob != null) {
      data['dob'] = _dobController.text;
    }
    if (_latitudeController.text.isNotEmpty) {
      data['latitude'] = double.tryParse(_latitudeController.text);
    }
    if (_longitudeController.text.isNotEmpty) {
      data['longitude'] = double.tryParse(_longitudeController.text);
    }

    try {
      if (_isEditing) {
        await ref.read(farmerRepositoryProvider).updateFarmer(widget.farmerId!, data);
      } else {
        await ref.read(farmerRepositoryProvider).createFarmer(data);
      }
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isEditing ? 'Farmer updated successfully' : 'Farmer created successfully'),
          ),
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
        title: Text(_isEditing ? 'Edit Farmer' : 'Add Farmer'),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _saveFarmer,
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
          controller: _scrollController,
          padding: const EdgeInsets.all(16),
          children: [
            _buildSectionHeader('Basic Information'),
            const SizedBox(height: 12),
            _buildTextFormField(
              controller: _fullNameController,
              label: 'Full Name *',
              hint: 'Enter farmer\'s full name',
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Name is required' : null,
            ),
            const SizedBox(height: 12),
            _buildTextFormField(
              controller: _farmerCodeController,
              label: 'Farmer Code *',
              hint: 'e.g. ETH-001',
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Code is required' : null,
            ),
            const SizedBox(height: 12),
            _buildTextFormField(
              controller: _contactNumberController,
              label: 'Contact Number',
              hint: '+251 9XX XXX XXX',
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildDropdownField(
                    label: 'Gender',
                    value: _selectedGender,
                    items: AppConstants.genderOptions,
                    onChanged: (v) => setState(() => _selectedGender = v ?? 'Male'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: () => _selectDate(context),
                    child: AbsorbPointer(
                      child: _buildTextFormField(
                        controller: _dobController,
                        label: 'Date of Birth',
                        hint: 'YYYY-MM-DD',
                        suffixIcon: const Icon(Icons.calendar_today, size: 18, color: AppColors.textHint),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SwitchListTile(
              value: _isCertified,
              onChanged: (v) => setState(() => _isCertified = v),
              title: const Text(
                'Certified Farmer',
                style: TextStyle(fontFamily: 'SpaceMono', fontSize: 13),
              ),
              activeColor: AppColors.success,
              contentPadding: EdgeInsets.zero,
            ),
            const SizedBox(height: 20),
            _buildSectionHeader('Location'),
            const SizedBox(height: 12),
            _buildDropdownField(
              label: 'Country',
              value: _selectedCountry,
              items: AppConstants.coffeeProducingCountries,
              onChanged: (v) => setState(() => _selectedCountry = v ?? 'Ethiopia'),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildTextFormField(
                    controller: _provinceController,
                    label: 'Province',
                    hint: 'Province/State',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextFormField(
                    controller: _districtController,
                    label: 'District',
                    hint: 'District',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildTextFormField(
                    controller: _communeController,
                    label: 'Commune',
                    hint: 'Commune',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextFormField(
                    controller: _villageController,
                    label: 'Village',
                    hint: 'Village',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildTextFormField(
                    controller: _latitudeController,
                    label: 'Latitude',
                    hint: '9.0250',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextFormField(
                    controller: _longitudeController,
                    label: 'Longitude',
                    hint: '38.7469',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: OutlinedButton.icon(
                onPressed: _useCurrentLocation,
                icon: const Icon(Icons.my_location, size: 16),
                label: const Text(
                  'Use Current Location',
                  style: TextStyle(fontFamily: 'SpaceMono', fontSize: 11),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.primary),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            _buildSectionHeader('Banking Details'),
            const SizedBox(height: 12),
            _buildTextFormField(
              controller: _bankNameController,
              label: 'Bank Name',
              hint: 'Name of the bank',
            ),
            const SizedBox(height: 12),
            _buildTextFormField(
              controller: _accountNumberController,
              label: 'Account Number',
              hint: 'Bank account number',
            ),
            const SizedBox(height: 12),
            _buildTextFormField(
              controller: _creditScoreController,
              label: 'Credit Score',
              hint: '0-1000',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _saveFarmer,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
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
    Widget? suffixIcon,
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
        suffixIcon: suffixIcon,
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
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        labelStyle: const TextStyle(
          fontFamily: 'SpaceMono',
          fontSize: 12,
          color: AppColors.textHint,
        ),
        hintStyle: const TextStyle(
          fontFamily: 'SpaceMono',
          fontSize: 14,
          color: AppColors.textHint,
        ),
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
        labelStyle: const TextStyle(
          fontFamily: 'SpaceMono',
          fontSize: 12,
          color: AppColors.textHint,
        ),
      ),
      items: items
          .map((item) => DropdownMenuItem(
                value: item,
                child: Text(
                  item,
                  style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12),
                ),
              ))
          .toList(),
      onChanged: onChanged,
      style: const TextStyle(
        fontFamily: 'SpaceMono',
        fontSize: 14,
        color: AppColors.textPrimary,
      ),
    );
  }
}
