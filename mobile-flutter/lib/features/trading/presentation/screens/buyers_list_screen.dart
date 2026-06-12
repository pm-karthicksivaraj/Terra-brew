import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/buyer_model.dart';
import '../../data/repositories/trading_repository.dart';

class BuyersListScreen extends ConsumerStatefulWidget {
  const BuyersListScreen({super.key});

  @override
  ConsumerState<BuyersListScreen> createState() => _BuyersListScreenState();
}

class _BuyersListScreenState extends ConsumerState<BuyersListScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  BuyerType? _typeFilter;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final buyersAsync = ref.watch(buyersProvider({
      'type': _typeFilter,
      'search': _searchQuery.isEmpty ? null : _searchQuery,
    }));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text(
          'Buyers',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
      ),
      body: Column(
        children: [
          // Search bar
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.surface,
            child: TextField(
              controller: _searchController,
              onChanged: (v) => setState(() => _searchQuery = v),
              style: const TextStyle(fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Search buyers...',
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
          // Filter chips
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _FilterChip(
                  label: 'All',
                  isSelected: _typeFilter == null,
                  onSelected: () => setState(() => _typeFilter = null),
                ),
                ...BuyerType.values.map(
                  (type) => _FilterChip(
                    label: _typeLabel(type),
                    isSelected: _typeFilter == type,
                    onSelected: () => setState(
                      () => _typeFilter = _typeFilter == type ? null : type,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Buyers list
          Expanded(
            child: buyersAsync.when(
              data: (buyers) {
                if (buyers.isEmpty) {
                  return _buildEmptyState();
                }
                return RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () async => ref.invalidate(buyersProvider),
                  child: ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: buyers.length,
                    itemBuilder: (context, index) =>
                        _BuyerCard(buyer: buyers[index]),
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
        onPressed: _showAddBuyerDialog,
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.person_add_outlined, color: Colors.white),
      ),
    );
  }

  String _typeLabel(BuyerType t) {
    switch (t) {
      case BuyerType.roaster:
        return 'Roaster';
      case BuyerType.importer:
        return 'Importer';
      case BuyerType.trader:
        return 'Trader';
      case BuyerType.distributor:
        return 'Distributor';
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.people_outline, size: 64, color: AppColors.textTertiary),
            const SizedBox(height: 16),
            const Text(
              'No buyers found',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              _searchQuery.isNotEmpty || _typeFilter != null
                  ? 'Try adjusting your filters'
                  : 'Add your first buyer',
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
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
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }

  void _showAddBuyerDialog() {
    final companyNameCtl = TextEditingController();
    final contactCtl = TextEditingController();
    final countryCtl = TextEditingController();
    final eoriCtl = TextEditingController();
    BuyerType selectedType = BuyerType.roaster;
    bool euRegistered = false;
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
                    'Add Buyer',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: companyNameCtl,
                    decoration: _inputDecoration('Company Name', 'Acme Coffee Co.'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: contactCtl,
                    decoration: _inputDecoration('Contact Person', 'John Doe'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: countryCtl,
                    decoration: _inputDecoration('Country', 'Germany'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<BuyerType>(
                    value: selectedType,
                    decoration: _inputDecoration('Buyer Type', ''),
                    items: BuyerType.values
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
                  TextFormField(
                    controller: eoriCtl,
                    decoration: _inputDecoration('EORI Number', 'DE123456789'),
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    title: const Text('EU Registered'),
                    value: euRegistered,
                    activeColor: AppColors.primary,
                    contentPadding: EdgeInsets.zero,
                    onChanged: (v) => setModalState(() => euRegistered = v),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: isLoading
                          ? null
                          : () async {
                              if (companyNameCtl.text.isEmpty) return;
                              setModalState(() => isLoading = true);
                              try {
                                await ref
                                    .read(tradingRepositoryProvider)
                                    .createBuyer({
                                  'companyName': companyNameCtl.text,
                                  'contactPerson': contactCtl.text,
                                  'country': countryCtl.text,
                                  'buyerType': selectedType.name,
                                  'euRegistration': euRegistered,
                                  'eoriNumber': eoriCtl.text,
                                  'buyerCode': 'BYR-${DateTime.now().millisecondsSinceEpoch}',
                                });
                                if (mounted) {
                                  Navigator.pop(context);
                                  ref.invalidate(buyersProvider);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Buyer added successfully'),
                                      backgroundColor: AppColors.success,
                                    ),
                                  );
                                }
                              } catch (e) {
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(e.toString()),
                                      backgroundColor: AppColors.danger,
                                    ),
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
                          : const Text('Add Buyer',
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
      labelStyle: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
      hintStyle: const TextStyle(fontSize: 13, color: AppColors.textTertiary),
      filled: true,
      fillColor: AppColors.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
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

class _BuyerCard extends StatelessWidget {
  final BuyerModel buyer;

  const _BuyerCard({required this.buyer});

  @override
  Widget build(BuildContext context) {
    final typeColor = _getTypeColor(buyer.buyerType);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: AppColors.borderLight),
      ),
      child: InkWell(
        onTap: () {
          _showBuyerDetail(context);
        },
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              // Avatar
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: typeColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    buyer.companyName.substring(0, 1).toUpperCase(),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: typeColor,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      buyer.companyName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        if (buyer.contactPerson != null) ...[
                          Text(
                            buyer.contactPerson!,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
                        Icon(Icons.location_on_outlined,
                            size: 12, color: AppColors.textTertiary),
                        const SizedBox(width: 2),
                        Text(
                          buyer.displayCountry,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // Type badge
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: typeColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      buyer.buyerTypeLabel,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: typeColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  // EU registration indicator
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        buyer.isEuRegistered ? Icons.check_circle : Icons.cancel,
                        size: 12,
                        color: buyer.isEuRegistered
                            ? AppColors.success
                            : AppColors.textTertiary,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        buyer.isEuRegistered ? 'EU Reg.' : 'Not Reg.',
                        style: TextStyle(
                          fontSize: 10,
                          color: buyer.isEuRegistered
                              ? AppColors.success
                              : AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getTypeColor(BuyerType type) {
    switch (type) {
      case BuyerType.roaster:
        return AppColors.primary;
      case BuyerType.importer:
        return AppColors.info;
      case BuyerType.trader:
        return AppColors.warning;
      case BuyerType.distributor:
        return const Color(0xFF8B5CF6);
    }
  }

  void _showBuyerDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
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
                Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: _getTypeColor(buyer.buyerType).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: Text(
                          buyer.companyName.substring(0, 1).toUpperCase(),
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            color: _getTypeColor(buyer.buyerType),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            buyer.companyName,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${buyer.buyerCode} · ${buyer.buyerTypeLabel}',
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                _detailRow('Contact', buyer.contactPerson ?? '-'),
                _detailRow('Email', buyer.email ?? '-'),
                _detailRow('Phone', buyer.phone ?? '-'),
                _detailRow('Country', buyer.displayCountry),
                _detailRow('EORI', buyer.eoriNumber ?? '-'),
                _detailRow('EU Registration', buyer.isEuRegistered ? 'Yes' : 'No'),
                if (buyer.address != null)
                  _detailRow('Address', buyer.address!),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textTertiary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ],
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
          fontSize: 12,
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
