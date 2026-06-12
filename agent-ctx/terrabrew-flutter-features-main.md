# Task: TerraBrew Coffee Flutter - Farmer, Farmland, EUDR Features

## Task ID: terrabrew-flutter-features
## Agent: main

## Summary

Created all 19 feature files for the TerraBrew Coffee Flutter mobile app, covering Farmers, Farmlands, and EUDR Compliance features. All files pass `flutter analyze` with zero errors.

## Files Created

### Core/Shared (3 files)
- `lib/core/theme/app_colors.dart` - Updated with EUDR/Risk colors
- `lib/core/theme/app_theme.dart` - Coffee brown theme with SpaceMono font
- `lib/core/constants/app_constants.dart` - Added gender, country, soil type constants

### Farmer Feature (6 files)
1. `lib/features/farmers/data/models/farmer_model.dart` - Freezed model with fromJson/toJson
2. `lib/features/farmers/data/repositories/farmer_repository.dart` - Riverpod repository with CRUD + pagination
3. `lib/features/farmers/presentation/screens/farmers_list_screen.dart` - List with search, filters, pagination, empty state
4. `lib/features/farmers/presentation/screens/farmer_detail_screen.dart` - Detail with QR code, sections, edit/delete
5. `lib/features/farmers/presentation/screens/farmer_form_screen.dart` - Add/Edit form with validation, date picker, GPS
6. `lib/features/farmers/presentation/widgets/farmer_card.dart` - Card with avatar, code, country emoji, certified badge

### Farmland Feature (6 files)
7. `lib/features/farmlands/data/models/farmland_model.dart` - Freezed model with area/altitude/tree density helpers
8. `lib/features/farmlands/data/repositories/farmland_repository.dart` - Repository with soil/altitude/area filters
9. `lib/features/farmlands/presentation/screens/farmlands_list_screen.dart` - List with soil type filter chips
10. `lib/features/farmlands/presentation/screens/farmland_detail_screen.dart` - Detail with stat cards, map preview
11. `lib/features/farmlands/presentation/screens/farmland_form_screen.dart` - Form with polygon drawing, GeoJSON upload
12. `lib/features/farmlands/presentation/widgets/farmland_card.dart` - Card with area, altitude, tree count chips

### EUDR Compliance Feature (7 files)
13. `lib/features/eudr/data/models/eudr_compliance_model.dart` - Freezed model with EudrStatus/RiskLevel enums + extensions
14. `lib/features/eudr/data/repositories/eudr_repository.dart` - Repository with readiness calculation/report
15. `lib/features/eudr/presentation/screens/eudr_list_screen.dart` - List with status/risk filters, summary stats
16. `lib/features/eudr/presentation/screens/eudr_detail_screen.dart` - Detail with risk gauge, timeline, score breakdown
17. `lib/features/eudr/presentation/screens/eudr_wizard_screen.dart` - 6-step wizard with progress indicator
18. `lib/features/eudr/presentation/widgets/compliance_status_badge.dart` - Status badges with theme colors
19. `lib/features/eudr/presentation/widgets/risk_level_indicator.dart` - Risk dot, bar, and gauge widgets

### App Entry
- `lib/main.dart` - Updated with TerraBrew theme and bottom navigation (Farmers/Farmlands/EUDR)

## Design Decisions
- Used existing `ApiClient` static methods instead of custom Dio provider
- Used `AppColors` from existing project with added EUDR/Risk colors
- Extended `AppConstants` with gender/country/soil type options
- Extension methods on `EudrStatus` and `RiskLevel` enums for label access
- All widgets use coffee brown (#6D2932) theme, SpaceMono font, 10px border radius
- Role-based access simulated with string constants for demo
