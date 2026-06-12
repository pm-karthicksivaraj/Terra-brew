import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../data/models/farmland_model.dart';
import '../../data/repositories/farmland_repository.dart';
import '../widgets/farmland_card.dart';
import 'farmland_detail_screen.dart';
import 'farmland_form_screen.dart';

class FarmLandsListScreen extends ConsumerStatefulWidget {
  const FarmLandsListScreen({super.key});

  @override
  ConsumerState<FarmLandsListScreen> createState() => _FarmLandsListScreenState();
}

class _FarmLandsListScreenState extends ConsumerState<FarmLandsListScreen> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  String? _selectedSoilType;
  bool _showFilters = false;

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
      ref.read(farmlandsListProvider.notifier).loadMore();
    }
  }

  void _navigateToDetail(FarmLandModel farmland) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => FarmLandDetailScreen(farmlandId: farmland.id),
      ),
    ).then((_) => ref.read(farmlandsListProvider.notifier).loadFarmLands(refresh: true));
  }

  void _navigateToAddFarmland() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const FarmLandFormScreen(),
      ),
    ).then((_) => ref.read(farmlandsListProvider.notifier).loadFarmLands(refresh: true));
  }

  @override
  Widget build(BuildContext context) {
    final farmlandsState = ref.watch(farmlandsListProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Farm Lands'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => setState(() => _showFilters = !_showFilters),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          if (_showFilters) _buildFilterSection(),
          Expanded(
            child: farmlandsState.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              error: (error, _) => _buildErrorState(error),
              data: (farmlands) {
                if (farmlands.isEmpty) {
                  return _buildEmptyState();
                }
                return RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () => ref.read(farmlandsListProvider.notifier).loadFarmLands(refresh: true),
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.only(top: 8, bottom: 80),
                    itemCount: farmlands.length + (ref.read(farmlandsListProvider.notifier).hasMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == farmlands.length) {
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
                      return FarmLandCard(
                        farmland: farmlands[index],
                        onTap: () => _navigateToDetail(farmlands[index]),
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
              onPressed: _navigateToAddFarmland,
              tooltip: 'Add Farm Land',
              child: const Icon(Icons.add_location_alt),
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
          hintText: 'Search farm lands...',
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
          ref.read(farmlandsListProvider.notifier).setSearch(value);
        },
      ),
    );
  }

  Widget _buildFilterSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Soil Type',
            style: TextStyle(
              fontFamily: 'SpaceMono',
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildSoilFilterChip('All', null),
                ...AppConstants.soilTypes.map((type) => _buildSoilFilterChip(type, type)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () {
                  setState(() => _selectedSoilType = null);
                  ref.read(farmlandsListProvider.notifier).clearFilters();
                },
                child: const Text('Clear Filters'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSoilFilterChip(String label, String? value) {
    final isSelected = _selectedSoilType == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() => _selectedSoilType = selected ? value : null);
          ref.read(farmlandsListProvider.notifier).setSoilType(selected ? value : null);
        },
        selectedColor: AppColors.primary.withValues(alpha: 0.15),
        labelStyle: TextStyle(
          fontFamily: 'SpaceMono',
          fontSize: 11,
          color: isSelected ? AppColors.primary : AppColors.textSecondary,
        ),
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
                Icons.landscape_outlined,
                size: 56,
                color: AppColors.textHint,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'No Farm Lands Found',
              style: TextStyle(
                fontFamily: 'SpaceMono',
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Start by adding your first farm land\nor adjust your search filters.',
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
                onPressed: _navigateToAddFarmland,
                icon: const Icon(Icons.add_location_alt, size: 18),
                label: const Text('Add Farm Land'),
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
              onPressed: () => ref.read(farmlandsListProvider.notifier).loadFarmLands(refresh: true),
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
