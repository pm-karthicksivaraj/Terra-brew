# Task: Create TerraBrew Coffee Flutter Feature Files

## Summary
Created all 33 requested Flutter feature files for the TerraBrew Coffee mobile app across 5 feature modules: trading, shipments, trust score, carbon tracking, and super admin.

## Files Created

### Core (2 files)
- `lib/core/theme/app_colors.dart` - Design system with coffee brown (#6D2932), gold (#FFC627), status colors
- `lib/core/network/api_client.dart` - Dio-based API client with error handling and Riverpod provider

### Trading Feature (11 files)
1. `lib/features/trading/data/models/trading_contract_model.dart` - Contract model with enums, formatting
2. `lib/features/trading/data/models/marketplace_listing_model.dart` - Listing model with cup score grades
3. `lib/features/trading/data/models/buyer_model.dart` - Buyer model with EU registration
4. `lib/features/trading/data/models/rfq_model.dart` - RFQ model with deadline tracking
5. `lib/features/trading/data/repositories/trading_repository.dart` - Unified repository + Riverpod providers
6. `lib/features/trading/presentation/screens/trading_desk_screen.dart` - Tab bar (Contracts/Marketplace/RFQs) with search, filters, FAB
7. `lib/features/trading/presentation/screens/marketplace_detail_screen.dart` - Listing detail with cup score, certifications
8. `lib/features/trading/presentation/screens/buyers_list_screen.dart` - Buyers management with EU reg indicator
9. `lib/features/trading/presentation/widgets/price_ticker_banner.dart` - Auto-scrolling ticker with green/red change
10. `lib/features/trading/presentation/widgets/contract_card.dart` - Contract card with status chip
11. `lib/features/trading/presentation/widgets/listing_card.dart` - Listing card with cup score badge

### Shipments Feature (5 files)
12. `lib/features/shipments/data/models/shipment_model.dart` - Shipment + ShipmentUpdate + IoTSensorReading models
13. `lib/features/shipments/data/repositories/shipment_repository.dart` - CRUD repository + providers
14. `lib/features/shipments/presentation/screens/shipments_list_screen.dart` - Filter by status, search, progress bars
15. `lib/features/shipments/presentation/screens/shipment_detail_screen.dart` - Status timeline, route, sensors, documents
16. `lib/features/shipments/presentation/widgets/shipment_status_timeline.dart` - Vertical stepper with cancelled state

### Trust Score Feature (4 files)
17. `lib/features/trust_score/data/models/trust_score_model.dart` - Score/grade with factors (NEVER algorithmic)
18. `lib/features/trust_score/data/repositories/trust_score_repository.dart` - Trust score fetch + provider
19. `lib/features/trust_score/presentation/screens/trust_score_screen.dart` - Circular gauge, trend chart, improvement tips
20. `lib/features/trust_score/presentation/widgets/score_gauge.dart` - Custom circular gauge painter with gradient

### Carbon Tracking Feature (4 files)
21. `lib/features/carbon/data/models/carbon_tracking_model.dart` - Scope 1/2/3 emissions, sequestration
22. `lib/features/carbon/data/repositories/carbon_repository.dart` - CRUD + date range filters
23. `lib/features/carbon/presentation/screens/carbon_tracking_screen.dart` - Emissions breakdown, trend, comparison
24. `lib/features/carbon/presentation/widgets/emissions_breakdown_chart.dart` - fl_chart bar chart with legend

### Super Admin Feature (8 files + 1 alias)
25. `lib/features/super_admin/data/models/tenant_model.dart` - Tenant with subscription, entity type, EUDR
26. `lib/features/super_admin/data/models/price_ticker_model.dart` - Price ticker with 52w range
27. `lib/features/super_admin/data/repositories/super_admin_repository.dart` - Tenants + tickers + dashboard stats
28. `lib/features/super_admin/presentation/screens/super_admin_dashboard_screen.dart` - Stats grid, quick actions, health
29. `lib/features/super_admin/presentation/screens/tenants_list_screen.dart` - Tenant list with filters
30. `lib/features/super_admin/presentation/screens/tenant_detail_screen.dart` - Company info, subscription, EUDR, activity
31. `lib/features/super_admin/presentation/screens/price_tickers_screen.dart` - Ticker CRUD with edit/delete
32. `lib/features/super_admin/presentation/widgets/tenant_card.dart` - Tenant card with plan/status badges
33. `lib/features/super_admin/presentation/widgets/ticker_form_dialog.dart` - Add/Edit ticker form
34. `lib/features/super-admin/presentation/screens/tenant_detail_screen.dart` - Re-export alias

## Technical Decisions
- Used manual `fromJson`/`toJson` instead of json_serializable to avoid build_runner dependency issues
- All models use safe parsing with null fallbacks
- Riverpod for state management throughout
- fl_chart for emissions bar chart and trust score trend line chart
- Custom `CustomPaint` for trust score gauge
- Consistent coffee brown theme (#6D2932) with gold accent (#FFC627)
- Every screen includes loading, error, and empty states
- All widgets are fully styled with proper padding, border radius (10px), and responsive design
