# Task: TerraBrew Coffee Flutter Mobile App - Shared Widgets, Layouts, Routing, QR, Map

## Summary
Created all 23 files for the TerraBrew Coffee Flutter mobile app with complete, production-ready code.

## Files Created

### Core (3 files)
1. `lib/core/theme/app_theme.dart` - Complete design system: AppColors, AppSpacing, AppRadius, AppFontSize, AppDuration, AppTheme with light theme
2. `lib/core/providers/auth_provider.dart` - Riverpod auth state, UserRole/EntityType enums, RBAC module definitions (32 modules), permissions per role
3. `lib/core/routing/app_router.dart` - GoRouter with all routes, ShellRoute for bottom nav, placeholder screens for unbuilt features
4. `lib/core/routing/route_guards.dart` - Auth guard, RBAC guard, super admin guard, combined redirect logic

### Shared Layouts (2 files)
5. `lib/shared/layouts/main_layout.dart` - Bottom nav shell with 5 tabs, RBAC tab filtering, badge indicators, animated transitions
6. `lib/shared/layouts/app_scaffold.dart` - Reusable scaffold with app bar, FAB, loading overlay

### Shared Widgets (11 files)
7. `lib/shared/widgets/app_button.dart` - Primary/secondary/ghost/danger variants, 3 sizes, loading state, icons, full-width
8. `lib/shared/widgets/app_text_field.dart` - Standard/dropdown/date-picker/multiline variants, coffee brown focus border, obscure toggle
9. `lib/shared/widgets/app_card.dart` - Elevated/flat variants, header/body/footer, press animation, coffee brown border on press
10. `lib/shared/widgets/app_chip.dart` - Filter/status chips, 6 color variants, selected/unselected states, icon support
11. `lib/shared/widgets/loading_widget.dart` - FullScreen, ListItem shimmer, Card shimmer, Button inline spinner
12. `lib/shared/widgets/empty_state_widget.dart` - Icon, title, description, optional action button
13. `lib/shared/widgets/error_widget.dart` - Error icon, message, retry button
14. `lib/shared/widgets/status_badge.dart` - Configurable colors, 3 sizes, icon support, fromStatus() convenience method
15. `lib/shared/widgets/search_bar_widget.dart` - Debounced search, clear button, filter toggle, coffee brown accent
16. `lib/shared/widgets/filter_bottom_sheet.dart` - Dynamic filter groups, multi-select chips, date range picker, apply/reset
17. `lib/shared/widgets/pagination_widget.dart` - Infinite scroll, load more indicator, scroll controller, error/retry states
18. `lib/shared/widgets/user_avatar.dart` - Initials fallback, image URL, coffee brown bg, 3 sizes, online indicator
19. `lib/shared/widgets/notification_bell.dart` - Badge count with Riverpod provider, danger red badge

### QR Verify Feature (2 files)
20. `lib/features/qr_verify/presentation/screens/qr_scan_screen.dart` - Camera view, scan overlay, flash toggle, gallery import, result display, navigation by QR type
21. `lib/features/qr_verify/presentation/screens/qr_result_screen.dart` - Verified/not verified status, entity details, hash verification, blockchain anchor, actions

### Map Feature (4 files)
22. `lib/features/map/presentation/screens/map_screen.dart` - flutter_map + OpenStreetMap, layer toggle, GPS button, drawing mode, search bar
23. `lib/features/map/presentation/widgets/farm_polygon_layer.dart` - GeoJSON polygons, color-coded compliance, tap popup with farm info
24. `lib/features/map/presentation/widgets/polygon_editor.dart` - Tap to add vertices, drag to adjust, delete vertex, Haversine area calc, GeoJSON export
25. `lib/features/map/presentation/widgets/location_picker.dart` - Long press to place marker, coordinates display, confirm button

### Root
26. `lib/main.dart` - Updated with ProviderScope, GoRouter, AppTheme

## Design System Applied
- Primary Coffee Brown: #6D2932 throughout
- Gold accent: #FFC627 for highlights
- SpaceMono font family
- 10px border radius standard
- All semantic colors (success, danger, warning, info)
