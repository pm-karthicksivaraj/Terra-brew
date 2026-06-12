import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/trading_contract_model.dart';
import '../../data/models/marketplace_listing_model.dart';
import '../../data/models/rfq_model.dart';
import '../../data/repositories/trading_repository.dart';
import '../widgets/price_ticker_banner.dart';
import '../widgets/contract_card.dart';
import '../widgets/listing_card.dart';
import 'marketplace_detail_screen.dart';
import 'buyers_list_screen.dart';

class TradingDeskScreen extends ConsumerStatefulWidget {
  const TradingDeskScreen({super.key});

  @override
  ConsumerState<TradingDeskScreen> createState() => _TradingDeskScreenState();
}

class _TradingDeskScreenState extends ConsumerState<TradingDeskScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();
  String _searchQuery = '';
  ContractStatus? _contractStatusFilter;
  ListingStatus? _listingStatusFilter;
  RFQStatus? _rfqStatusFilter;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tickersAsync = ref.watch(priceTickersProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text(
          'Trading Desk',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.people_outline),
            tooltip: 'Buyers',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => const BuyersListScreen()),
              );
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.gold,
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          unselectedLabelStyle:
              const TextStyle(fontWeight: FontWeight.w400, fontSize: 13),
          tabs: const [
            Tab(text: 'Contracts'),
            Tab(text: 'Marketplace'),
            Tab(text: 'RFQs'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Price ticker banner
          tickersAsync.when(
            data: (tickers) => PriceTickerBanner(tickers: tickers),
            loading: () => Container(
              height: 40,
              color: AppColors.primary,
              child: const Center(
                child: SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white54,
                  ),
                ),
              ),
            ),
            error: (_, __) => Container(
              height: 40,
              color: AppColors.primary,
              child: const Center(
                child: Text(
                  'Price data unavailable',
                  style: TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ),
            ),
          ),
          // Search bar
          _buildSearchBar(),
          // Tab content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _ContractsTab(
                  searchQuery: _searchQuery,
                  statusFilter: _contractStatusFilter,
                  onStatusFilterChanged: (v) =>
                      setState(() => _contractStatusFilter = v),
                ),
                _MarketplaceTab(
                  searchQuery: _searchQuery,
                  statusFilter: _listingStatusFilter,
                  onStatusFilterChanged: (v) =>
                      setState(() => _listingStatusFilter = v),
                ),
                _RFQsTab(
                  searchQuery: _searchQuery,
                  statusFilter: _rfqStatusFilter,
                  onStatusFilterChanged: (v) =>
                      setState(() => _rfqStatusFilter = v),
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDialog,
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      color: AppColors.surface,
      child: TextField(
        controller: _searchController,
        onChanged: (v) => setState(() => _searchQuery = v),
        style: const TextStyle(fontSize: 14),
        decoration: InputDecoration(
          hintText: 'Search contracts, listings, RFQs...',
          hintStyle: const TextStyle(color: AppColors.textTertiary, fontSize: 14),
          prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textTertiary),
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
    );
  }

  void _showCreateDialog() {
    final tabIndex = _tabController.index;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
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
                Text(
                  tabIndex == 0
                      ? 'New Contract'
                      : tabIndex == 1
                          ? 'New Listing'
                          : 'New RFQ',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 20),
                if (tabIndex == 0) _buildContractForm(),
                if (tabIndex == 1) _buildListingForm(),
                if (tabIndex == 2) _buildRFQForm(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContractForm() {
    return _SimpleCreateForm(
      fields: [
        _FormFieldData(label: 'Contract Number', hint: 'CTR-2024-001'),
        _FormFieldData(label: 'Quantity (kg)', hint: '1000', keyboard: TextInputType.number),
        _FormFieldData(label: 'Price per kg', hint: '4.50', keyboard: TextInputType.number),
      ],
      onSubmit: (values) async {
        try {
          final qty = double.tryParse(values[1]) ?? 0;
          final price = double.tryParse(values[2]) ?? 0;
          await ref.read(tradingRepositoryProvider).createContract({
            'contractNumber': values[0],
            'contractType': 'spot',
            'quantityKg': qty,
            'pricePerKg': price,
            'totalValue': qty * price,
            'status': 'draft',
          });
          if (mounted) {
            Navigator.pop(context);
            ref.invalidate(contractsProvider);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Contract created successfully'),
                backgroundColor: AppColors.success,
              ),
            );
          }
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger),
            );
          }
        }
      },
    );
  }

  Widget _buildListingForm() {
    return _SimpleCreateForm(
      fields: [
        _FormFieldData(label: 'Title', hint: 'Ethiopian Yirgacheffe Lot #12'),
        _FormFieldData(label: 'Coffee Type', hint: 'Arabica'),
        _FormFieldData(label: 'Quantity (kg)', hint: '500', keyboard: TextInputType.number),
        _FormFieldData(label: 'Price per kg', hint: '5.20', keyboard: TextInputType.number),
        _FormFieldData(label: 'Cup Score', hint: '84.5', keyboard: TextInputType.number),
      ],
      onSubmit: (values) async {
        try {
          await ref.read(tradingRepositoryProvider).createListing({
            'title': values[0],
            'coffeeType': values[1],
            'quantityKg': double.tryParse(values[2]) ?? 0,
            'pricePerKg': double.tryParse(values[3]) ?? 0,
            'cupScore': double.tryParse(values[4]),
            'listingStatus': 'draft',
            'certifications': [],
          });
          if (mounted) {
            Navigator.pop(context);
            ref.invalidate(marketplaceListingsProvider);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Listing created successfully'),
                backgroundColor: AppColors.success,
              ),
            );
          }
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger),
            );
          }
        }
      },
    );
  }

  Widget _buildRFQForm() {
    return _SimpleCreateForm(
      fields: [
        _FormFieldData(label: 'Title', hint: 'Specialty Arabica Request'),
        _FormFieldData(label: 'Commodity', hint: 'Green Coffee Arabica'),
        _FormFieldData(label: 'Quantity (kg)', hint: '2000', keyboard: TextInputType.number),
        _FormFieldData(label: 'Target Price/kg', hint: '4.80', keyboard: TextInputType.number),
        _FormFieldData(label: 'Incoterms', hint: 'FOB, CIF'),
      ],
      onSubmit: (values) async {
        try {
          await ref.read(tradingRepositoryProvider).createRFQ({
            'title': values[0],
            'commodity': values[1],
            'quantityKg': double.tryParse(values[2]) ?? 0,
            'targetPricePerKg': double.tryParse(values[3]),
            'incoterms': values[4],
            'status': 'open',
          });
          if (mounted) {
            Navigator.pop(context);
            ref.invalidate(rfqsProvider);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('RFQ created successfully'),
                backgroundColor: AppColors.success,
              ),
            );
          }
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger),
            );
          }
        }
      },
    );
  }
}

// ─── Contracts Tab ───

class _ContractsTab extends ConsumerWidget {
  final String searchQuery;
  final ContractStatus? statusFilter;
  final ValueChanged<ContractStatus?> onStatusFilterChanged;

  const _ContractsTab({
    required this.searchQuery,
    required this.statusFilter,
    required this.onStatusFilterChanged,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contractsAsync = ref.watch(contractsProvider({
      'status': statusFilter,
      'search': searchQuery.isEmpty ? null : searchQuery,
    }));

    return Column(
      children: [
        _buildFilterChips(),
        Expanded(
          child: contractsAsync.when(
            data: (contracts) {
              if (contracts.isEmpty) {
                return _buildEmptyState(
                  icon: Icons.description_outlined,
                  title: 'No contracts found',
                  subtitle: searchQuery.isNotEmpty || statusFilter != null
                      ? 'Try adjusting your filters'
                      : 'Create your first trading contract',
                );
              }
              return RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async =>
                    ref.invalidate(contractsProvider),
                child: ListView.builder(
                  padding: const EdgeInsets.only(top: 8, bottom: 80),
                  itemCount: contracts.length,
                  itemBuilder: (context, index) {
                    return ContractCard(contract: contracts[index]);
                  },
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
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _FilterChip<ContractStatus>(
            label: 'All',
            isSelected: statusFilter == null,
            onSelected: () => onStatusFilterChanged(null),
          ),
          ...ContractStatus.values.map(
            (status) => _FilterChip<ContractStatus>(
              label: _statusLabel(status),
              isSelected: statusFilter == status,
              onSelected: () => onStatusFilterChanged(
                statusFilter == status ? null : status,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _statusLabel(ContractStatus s) {
    switch (s) {
      case ContractStatus.draft: return 'Draft';
      case ContractStatus.pending: return 'Pending';
      case ContractStatus.active: return 'Active';
      case ContractStatus.completed: return 'Completed';
      case ContractStatus.cancelled: return 'Cancelled';
      case ContractStatus.expired: return 'Expired';
    }
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 64, color: AppColors.textTertiary),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              textAlign: TextAlign.center,
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
            Text(
              'Something went wrong',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Marketplace Tab ───

class _MarketplaceTab extends ConsumerWidget {
  final String searchQuery;
  final ListingStatus? statusFilter;
  final ValueChanged<ListingStatus?> onStatusFilterChanged;

  const _MarketplaceTab({
    required this.searchQuery,
    required this.statusFilter,
    required this.onStatusFilterChanged,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listingsAsync = ref.watch(marketplaceListingsProvider({
      'status': statusFilter,
      'search': searchQuery.isEmpty ? null : searchQuery,
    }));

    return Column(
      children: [
        _buildFilterChips(),
        Expanded(
          child: listingsAsync.when(
            data: (listings) {
              if (listings.isEmpty) {
                return _buildEmptyState(
                  icon: Icons.storefront_outlined,
                  title: 'No listings found',
                  subtitle: searchQuery.isNotEmpty || statusFilter != null
                      ? 'Try adjusting your filters'
                      : 'Create your first marketplace listing',
                );
              }
              return RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async =>
                    ref.invalidate(marketplaceListingsProvider),
                child: ListView.builder(
                  padding: const EdgeInsets.only(top: 8, bottom: 80),
                  itemCount: listings.length,
                  itemBuilder: (context, index) {
                    return ListingCard(
                      listing: listings[index],
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => MarketplaceDetailScreen(
                              listing: listings[index],
                            ),
                          ),
                        );
                      },
                    );
                  },
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
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _FilterChip<ListingStatus>(
            label: 'All',
            isSelected: statusFilter == null,
            onSelected: () => onStatusFilterChanged(null),
          ),
          ...ListingStatus.values.map(
            (status) => _FilterChip<ListingStatus>(
              label: _statusLabel(status),
              isSelected: statusFilter == status,
              onSelected: () => onStatusFilterChanged(
                statusFilter == status ? null : status,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _statusLabel(ListingStatus s) {
    switch (s) {
      case ListingStatus.draft: return 'Draft';
      case ListingStatus.published: return 'Published';
      case ListingStatus.reserved: return 'Reserved';
      case ListingStatus.sold: return 'Sold';
      case ListingStatus.expired: return 'Expired';
      case ListingStatus.closed: return 'Closed';
    }
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 64, color: AppColors.textTertiary),
            const SizedBox(height: 16),
            Text(title,
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            const SizedBox(height: 6),
            Text(subtitle,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
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
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            const SizedBox(height: 4),
            Text(message,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}

// ─── RFQs Tab ───

class _RFQsTab extends ConsumerWidget {
  final String searchQuery;
  final RFQStatus? statusFilter;
  final ValueChanged<RFQStatus?> onStatusFilterChanged;

  const _RFQsTab({
    required this.searchQuery,
    required this.statusFilter,
    required this.onStatusFilterChanged,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rfqsAsync = ref.watch(rfqsProvider({
      'status': statusFilter,
      'search': searchQuery.isEmpty ? null : searchQuery,
    }));

    return Column(
      children: [
        _buildFilterChips(),
        Expanded(
          child: rfqsAsync.when(
            data: (rfqs) {
              if (rfqs.isEmpty) {
                return _buildEmptyState(
                  icon: Icons.request_quote_outlined,
                  title: 'No RFQs found',
                  subtitle: searchQuery.isNotEmpty || statusFilter != null
                      ? 'Try adjusting your filters'
                      : 'Create your first request for quotation',
                );
              }
              return RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async => ref.invalidate(rfqsProvider),
                child: ListView.builder(
                  padding: const EdgeInsets.only(top: 8, bottom: 80),
                  itemCount: rfqs.length,
                  itemBuilder: (context, index) => _RFQCard(rfq: rfqs[index]),
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
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _FilterChip<RFQStatus>(
            label: 'All',
            isSelected: statusFilter == null,
            onSelected: () => onStatusFilterChanged(null),
          ),
          ...RFQStatus.values.map(
            (status) => _FilterChip<RFQStatus>(
              label: _statusLabel(status),
              isSelected: statusFilter == status,
              onSelected: () => onStatusFilterChanged(
                statusFilter == status ? null : status,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _statusLabel(RFQStatus s) {
    switch (s) {
      case RFQStatus.open: return 'Open';
      case RFQStatus.inReview: return 'In Review';
      case RFQStatus.accepted: return 'Accepted';
      case RFQStatus.rejected: return 'Rejected';
      case RFQStatus.expired: return 'Expired';
      case RFQStatus.cancelled: return 'Cancelled';
      case RFQStatus.closed: return 'Closed';
    }
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 64, color: AppColors.textTertiary),
            const SizedBox(height: 16),
            Text(title,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            const SizedBox(height: 6),
            Text(subtitle,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
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
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            const SizedBox(height: 4),
            Text(message,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}

// ─── RFQ Card ───

class _RFQCard extends StatelessWidget {
  final RFQModel rfq;

  const _RFQCard({required this.rfq});

  @override
  Widget build(BuildContext context) {
    final statusColor = AppColors.statusColor(rfq.status.name);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: AppColors.borderLight),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    rfq.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    rfq.statusLabel,
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              rfq.rfqId,
              style: const TextStyle(fontSize: 12, color: AppColors.textTertiary),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _rfqInfo(Icons.coffee_outlined, rfq.commodity),
                const SizedBox(width: 12),
                _rfqInfo(Icons.scale_outlined, rfq.formattedQuantity),
                const SizedBox(width: 12),
                _rfqInfo(Icons.attach_money, rfq.formattedTargetPrice),
              ],
            ),
            if (rfq.incoterms != null) ...[
              const SizedBox(height: 6),
              Row(
                children: [
                  _rfqInfo(Icons.local_shipping_outlined, rfq.incoterms!),
                ],
              ),
            ],
            if (rfq.deadline != null) ...[
              const SizedBox(height: 6),
              Row(
                children: [
                  Icon(
                    rfq.isExpired
                        ? Icons.error_outline
                        : rfq.isDeadlineSoon
                            ? Icons.warning_amber
                            : Icons.schedule,
                    size: 13,
                    color: rfq.isExpired
                        ? AppColors.danger
                        : rfq.isDeadlineSoon
                            ? AppColors.warning
                            : AppColors.textTertiary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Deadline: ${_formatDate(rfq.deadline!)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: rfq.isExpired
                          ? AppColors.danger
                          : rfq.isDeadlineSoon
                              ? AppColors.warning
                              : AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _rfqInfo(IconData icon, String value) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: AppColors.textTertiary),
        const SizedBox(width: 3),
        Text(value,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
      ],
    );
  }

  String _formatDate(DateTime d) {
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
  }
}

// ─── Shared Widgets ───

class _FilterChip<T> extends StatelessWidget {
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

class _FormFieldData {
  final String label;
  final String hint;
  final TextInputType keyboard;

  const _FormFieldData({
    required this.label,
    required this.hint,
    this.keyboard = TextInputType.text,
  });
}

class _SimpleCreateForm extends StatefulWidget {
  final List<_FormFieldData> fields;
  final Future<void> Function(List<String> values) onSubmit;

  const _SimpleCreateForm({
    required this.fields,
    required this.onSubmit,
  });

  @override
  State<_SimpleCreateForm> createState() => _SimpleCreateFormState();
}

class _SimpleCreateFormState extends State<_SimpleCreateForm> {
  final _formKey = GlobalKey<FormState>();
  final _controllers = <TextEditingController>[];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _controllers.addAll(
      widget.fields.map((_) => TextEditingController()),
    );
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          ...List.generate(widget.fields.length, (i) {
            final field = widget.fields[i];
            return Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: TextFormField(
                controller: _controllers[i],
                keyboardType: field.keyboard,
                validator: (v) =>
                    v == null || v.isEmpty ? '${field.label} is required' : null,
                decoration: InputDecoration(
                  labelText: field.label,
                  hintText: field.hint,
                  labelStyle: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  hintStyle: const TextStyle(fontSize: 13, color: AppColors.textTertiary),
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
                ),
              ),
            );
          }),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: _isLoading
                  ? null
                  : () async {
                      if (!_formKey.currentState!.validate()) return;
                      setState(() => _isLoading = true);
                      try {
                        await widget.onSubmit(
                          _controllers.map((c) => c.text).toList(),
                        );
                      } finally {
                        if (mounted) setState(() => _isLoading = false);
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
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
                  : const Text(
                      'Create',
                      style:
                          TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
