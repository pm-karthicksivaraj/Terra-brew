import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../data/models/farmer_model.dart';
import '../../data/repositories/farmer_repository.dart';
import '../widgets/farmer_card.dart';
import 'farmer_detail_screen.dart';
import 'farmer_form_screen.dart';

class FarmersListScreen extends ConsumerStatefulWidget {
  const FarmersListScreen({super.key});

  @override
  ConsumerState<FarmersListScreen> createState() => _FarmersListScreenState();
}

class _FarmersListScreenState extends ConsumerState<FarmersListScreen> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  String? _selectedStatus;
  String? _selectedCountry;
  String? _selectedGender;

  // Simulated role – in production, read from auth state
  static const String _userRole = 'field_officer';
  bool get _canAdd => _userRole == 'super_admin' || _userRole == 'field_officer';

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(farmersListProvider.notifier).loadMore();
    }
  }

  void _navigateToDetail(FarmerModel farmer) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => FarmerDetailScreen(farmerId: farmer.id),
      ),
    ).then((_) => ref.read(farmersListProvider.notifier).loadFarmers(refresh: true));
  }

  void _navigateToAddFarmer() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const FarmerFormScreen(),
      ),
    ).then((_) => ref.read(farmersListProvider.notifier).loadFarmers(refresh: true));
  }

  @override
  Widget build(BuildContext context) {
    final farmersState = ref.watch(farmersListProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Farmers'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterBottomSheet,
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          if (_hasActiveFilters) _buildActiveFilterChips(),
          Expanded(
            child: farmersState.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              error: (error, _) => _buildErrorState(error),
              data: (farmers) {
                if (farmers.isEmpty) {
                  return _buildEmptyState();
                }
                return RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () => ref.read(farmersListProvider.notifier).loadFarmers(refresh: true),
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.only(top: 8, bottom: 80),
                    itemCount: farmers.length + (ref.read(farmersListProvider.notifier).hasMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == farmers.length) {
                        return const Padding(
                          padding: EdgeInsets.all(16),
                          child: Center(
                            child: SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        );
                      }
                      return FarmerCard(
                        farmer: farmers[index],
                        onTap: () => _navigateToDetail(farmers[index]),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: _canAdd
          ? FloatingActionButton(
              onPressed: _navigateToAddFarmer,
              tooltip: 'Add Farmer',
              child: const Icon(Icons.person_add),
            )
          : null,
    );
  }

  Widget _buildSearchBar() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: TextField(
        controller: _searchController,
        style: const TextStyle(
          fontFamily: 'SpaceMono',
          fontSize: 14,
          color: AppColors.textPrimary,
        ),
        decoration: const InputDecoration(
          hintText: 'Search farmers...',
          hintStyle: TextStyle(
            fontFamily: 'SpaceMono',
            fontSize: 14,
            color: AppColors.textHint,
          ),
          prefixIcon: Icon(Icons.search, color: AppColors.textHint, size: 20),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
        onChanged: (value) {
          ref.read(farmersListProvider.notifier).setSearch(value);
        },
      ),
    );
  }

  bool get _hasActiveFilters =>
      _selectedStatus != null || _selectedCountry != null || _selectedGender != null;

  Widget _buildActiveFilterChips() {
    return Container(
      height: 40,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          if (_selectedStatus != null)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Chip(
                label: Text(_selectedStatus!),
                deleteIcon: const Icon(Icons.close, size: 16),
                onDeleted: () {
                  setState(() => _selectedStatus = null);
                  ref.read(farmersListProvider.notifier).setStatus(null);
                },
                backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                labelStyle: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 11,
                  color: AppColors.primary,
                ),
              ),
            ),
          if (_selectedCountry != null)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Chip(
                label: Text(_selectedCountry!),
                deleteIcon: const Icon(Icons.close, size: 16),
                onDeleted: () {
                  setState(() => _selectedCountry = null);
                  ref.read(farmersListProvider.notifier).setCountry(null);
                },
                backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                labelStyle: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 11,
                  color: AppColors.primary,
                ),
              ),
            ),
          if (_selectedGender != null)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Chip(
                label: Text(_selectedGender!),
                deleteIcon: const Icon(Icons.close, size: 16),
                onDeleted: () {
                  setState(() => _selectedGender = null);
                  ref.read(farmersListProvider.notifier).setGender(null);
                },
                backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                labelStyle: const TextStyle(
                  fontFamily: 'SpaceMono',
                  fontSize: 11,
                  color: AppColors.primary,
                ),
              ),
            ),
          ActionChip(
            label: const Text('Clear All'),
            onPressed: () {
              setState(() {
                _selectedStatus = null;
                _selectedCountry = null;
                _selectedGender = null;
              });
              ref.read(farmersListProvider.notifier).clearFilters();
            },
            labelStyle: const TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 11,
              color: AppColors.danger,
            ),
          ),
        ],
      ),
    );
  }

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Filter Farmers',
                      style: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  'Certification Status',
                  style: TextStyle(
                    fontFamily: 'SpaceMono',
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: [
                    'Certified',
                    'Uncertified',
                  ].map((status) {
                    final isSelected = (_selectedStatus == 'certified' && status == 'Certified') ||
                        (_selectedStatus == 'uncertified' && status == 'Uncertified');
                    return ChoiceChip(
                      label: Text(status),
                      selected: isSelected,
                      onSelected: (selected) {
                        setModalState(() {
                          _selectedStatus = selected
                              ? (status == 'Certified' ? 'certified' : 'uncertified')
                              : null;
                        });
                      },
                      selectedColor: AppColors.primary.withValues(alpha: 0.15),
                      labelStyle: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 12,
                        color: isSelected ? AppColors.primary : AppColors.textSecondary,
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Country',
                  style: TextStyle(
                    fontFamily: 'SpaceMono',
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedCountry,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: AppColors.surface,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    hintText: 'Select country',
                    hintStyle: const TextStyle(
                      fontFamily: 'SpaceMono',
                      fontSize: 12,
                      color: AppColors.textHint,
                    ),
                  ),
                  items: AppConstants.coffeeProducingCountries
                      .map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontFamily: 'SpaceMono', fontSize: 12))))
                      .toList(),
                  onChanged: (value) {
                    setModalState(() => _selectedCountry = value);
                  },
                ),
                const SizedBox(height: 20),
                const Text(
                  'Gender',
                  style: TextStyle(
                    fontFamily: 'SpaceMono',
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: AppConstants.genderOptions.map((gender) {
                    final isSelected = _selectedGender == gender;
                    return ChoiceChip(
                      label: Text(gender),
                      selected: isSelected,
                      onSelected: (selected) {
                        setModalState(() {
                          _selectedGender = selected ? gender : null;
                        });
                      },
                      selectedColor: AppColors.primary.withValues(alpha: 0.15),
                      labelStyle: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 12,
                        color: isSelected ? AppColors.primary : AppColors.textSecondary,
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      ref.read(farmersListProvider.notifier).setStatus(_selectedStatus);
                      ref.read(farmersListProvider.notifier).setCountry(_selectedCountry);
                      ref.read(farmersListProvider.notifier).setGender(_selectedGender);
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      'Apply Filters',
                      style: TextStyle(
                        fontFamily: 'SpaceMono',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(60),
              ),
              child: const Icon(
                Icons.agriculture_outlined,
                size: 56,
                color: AppColors.textHint,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'No Farmers Found',
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Start by adding your first farmer\nor adjust your search filters.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 13,
                color: AppColors.textHint,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            if (_canAdd)
              ElevatedButton.icon(
                onPressed: _navigateToAddFarmer,
                icon: const Icon(Icons.person_add, size: 18),
                label: const Text('Add Farmer'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(Object error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 56, color: AppColors.danger),
            const SizedBox(height: 16),
            const Text(
              'Something went wrong',
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 12,
                color: AppColors.textHint,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => ref.read(farmersListProvider.notifier).loadFarmers(refresh: true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
