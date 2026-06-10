import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/tenant_model.dart';
import '../../data/repositories/super_admin_repository.dart';
import '../widgets/tenant_card.dart';
import 'tenant_detail_screen.dart';

class TenantsListScreen extends ConsumerStatefulWidget {
  const TenantsListScreen({super.key});

  @override
  ConsumerState<TenantsListScreen> createState() => _TenantsListScreenState();
}

class _TenantsListScreenState extends ConsumerState<TenantsListScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  EntityType? _typeFilter;
  SubscriptionPlan? _planFilter;
  SubscriptionStatus? _statusFilter;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tenantsAsync = ref.watch(tenantsProvider({
      'search': _searchQuery.isEmpty ? null : _searchQuery,
      'entityType': _typeFilter,
      'plan': _planFilter,
      'status': _statusFilter,
    }));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text(
          'Tenants',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
      ),
      body: Column(
        children: [
          // Search
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.surface,
            child: TextField(
              controller: _searchController,
              onChanged: (v) => setState(() => _searchQuery = v),
              style: const TextStyle(fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Search tenants...',
                hintStyle: const TextStyle(
                    color: AppColors.textTertiary, fontSize: 14),
                prefixIcon: const Icon(Icons.search,
                    size: 20, color: AppColors.textTertiary),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.background,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          // Filters
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _FilterChip(
                  label: 'All',
                  isSelected: _typeFilter == null &&
                      _planFilter == null &&
                      _statusFilter == null,
                  onSelected: () => setState(() {
                    _typeFilter = null;
                    _planFilter = null;
                    _statusFilter = null;
                  }),
                ),
                ...EntityType.values.map(
                  (type) => _FilterChip(
                    label: _typeLabel(type),
                    isSelected: _typeFilter == type,
                    onSelected: () => setState(
                      () => _typeFilter = _typeFilter == type ? null : type,
                    ),
                  ),
                ),
                ...SubscriptionPlan.values.map(
                  (plan) => _FilterChip(
                    label: _planLabel(plan),
                    isSelected: _planFilter == plan,
                    onSelected: () => setState(
                      () => _planFilter = _planFilter == plan ? null : plan,
                    ),
                  ),
                ),
                ...SubscriptionStatus.values.map(
                  (status) => _FilterChip(
                    label: _statusLabel(status),
                    isSelected: _statusFilter == status,
                    onSelected: () => setState(
                      () => _statusFilter =
                          _statusFilter == status ? null : status,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Tenants list
          Expanded(
            child: tenantsAsync.when(
              data: (tenants) {
                if (tenants.isEmpty) {
                  return _buildEmptyState();
                }
                return RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () async => ref.invalidate(tenantsProvider),
                  child: ListView.builder(
                    padding: const EdgeInsets.only(top: 4, bottom: 80),
                    itemCount: tenants.length,
                    itemBuilder: (context, index) => TenantCard(
                      tenant: tenants[index],
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => TenantDetailScreen(
                            tenant: tenants[index],
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              error: (err, _) => _buildErrorState(err.toString()),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddTenantDialog,
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  String _typeLabel(EntityType t) {
    switch (t) {
      case EntityType.farm:
        return 'Farm';
      case EntityType.cooperative:
        return 'Co-op';
      case EntityType.exporter:
        return 'Exporter';
      case EntityType.importer:
        return 'Importer';
      case EntityType.roaster:
        return 'Roaster';
      case EntityType.trader:
        return 'Trader';
    }
  }

  String _planLabel(SubscriptionPlan p) {
    switch (p) {
      case SubscriptionPlan.starter:
        return 'Starter';
      case SubscriptionPlan.professional:
        return 'Pro';
      case SubscriptionPlan.enterprise:
        return 'Enterprise';
    }
  }

  String _statusLabel(SubscriptionStatus s) {
    switch (s) {
      case SubscriptionStatus.active:
        return 'Active';
      case SubscriptionStatus.trial:
        return 'Trial';
      case SubscriptionStatus.suspended:
        return 'Suspended';
      case SubscriptionStatus.cancelled:
        return 'Cancelled';
      case SubscriptionStatus.expired:
        return 'Expired';
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.business_outlined,
                size: 64, color: AppColors.textTertiary),
            const SizedBox(height: 16),
            const Text(
              'No tenants found',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Add your first tenant',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.danger),
            const SizedBox(height: 12),
            const Text('Something went wrong',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary)),
            const SizedBox(height: 4),
            Text(message,
                textAlign: TextAlign.center,
                style:
                    const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }

  void _showAddTenantDialog() {
    final nameCtl = TextEditingController();
    final slugCtl = TextEditingController();
    final legalCtl = TextEditingController();
    final countryCtl = TextEditingController();
    EntityType selectedType = EntityType.farm;
    SubscriptionPlan selectedPlan = SubscriptionPlan.starter;
    bool eudrCompliant = false;
    bool isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          decoration: const BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
          ),
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Add Tenant',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: nameCtl,
                    decoration: _inputDecoration('Name', 'Coffee Farm ABC'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: slugCtl,
                    decoration: _inputDecoration('Slug', 'coffee-farm-abc'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: legalCtl,
                    decoration:
                        _inputDecoration('Legal Name', 'ABC Coffee Ltd.'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: countryCtl,
                    decoration: _inputDecoration('Country', 'Colombia'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<EntityType>(
                    value: selectedType,
                    decoration: _inputDecoration('Entity Type', ''),
                    items: EntityType.values
                        .map((t) => DropdownMenuItem(
                              value: t,
                              child: Text(_typeLabel(t)),
                            ))
                        .toList(),
                    onChanged: (v) {
                      if (v != null) setModalState(() => selectedType = v);
                    },
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<SubscriptionPlan>(
                    value: selectedPlan,
                    decoration: _inputDecoration('Plan', ''),
                    items: SubscriptionPlan.values
                        .map((p) => DropdownMenuItem(
                              value: p,
                              child: Text(_planLabel(p)),
                            ))
                        .toList(),
                    onChanged: (v) {
                      if (v != null) setModalState(() => selectedPlan = v);
                    },
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    title: const Text('EUDR Compliant'),
                    value: eudrCompliant,
                    activeColor: AppColors.primary,
                    contentPadding: EdgeInsets.zero,
                    onChanged: (v) => setModalState(() => eudrCompliant = v),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: isLoading
                          ? null
                          : () async {
                              if (nameCtl.text.isEmpty) return;
                              setModalState(() => isLoading = true);
                              try {
                                await ref
                                    .read(superAdminRepositoryProvider)
                                    .createTenant({
                                  'name': nameCtl.text,
                                  'slug': slugCtl.text,
                                  'legalName': legalCtl.text,
                                  'country': countryCtl.text,
                                  'entityType': selectedType.name,
                                  'plan': selectedPlan.name,
                                  'subscriptionStatus': 'trial',
                                  'eudrCompliant': eudrCompliant,
                                });
                                if (mounted) {
                                  Navigator.pop(context);
                                  ref.invalidate(tenantsProvider);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Tenant added successfully'),
                                      backgroundColor: AppColors.success,
                                    ),
                                  );
                                }
                              } catch (e) {
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                        content: Text(e.toString()),
                                        backgroundColor: AppColors.danger),
                                  );
                                }
                              } finally {
                                setModalState(() => isLoading = false);
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Add Tenant',
                              style: TextStyle(
                                  fontWeight: FontWeight.w600, fontSize: 15)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, String hint) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      labelStyle:
          const TextStyle(fontSize: 13, color: AppColors.textSecondary),
      hintStyle:
          const TextStyle(fontSize: 13, color: AppColors.textTertiary),
      filled: true,
      fillColor: AppColors.surface,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onSelected;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => onSelected(),
        labelStyle: TextStyle(
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
          color: isSelected ? Colors.white : AppColors.textSecondary,
        ),
        selectedColor: AppColors.primary,
        backgroundColor: AppColors.background,
        side: BorderSide(
          color: isSelected ? AppColors.primary : AppColors.border,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        visualDensity: VisualDensity.compact,
        padding: const EdgeInsets.symmetric(horizontal: 4),
      ),
    );
  }
}
