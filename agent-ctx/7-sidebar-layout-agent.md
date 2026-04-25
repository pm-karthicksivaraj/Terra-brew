# Task 7: AppSidebar + Tenant Dashboard Layout

## Agent: sidebar-layout-agent

## Work Log

### 1. Created `/src/components/layout/app-sidebar.tsx`
- Collapsible sidebar navigation component for the tenant dashboard
- **Navigation structure**: 5 groups (Core, Farm Management, Supply Chain, Compliance & Trade, System) with 19 total nav items
- Each nav item has bilingual labels (VI/EN), href, and Lucide icon
- **Desktop behavior**: Fixed sidebar with smooth collapse/expand animation using framer-motion (`motion.aside` with `animate={{ width }}`)
- **Mobile behavior**: Renders as a `Sheet` (drawer) component from shadcn/ui, slides from left
- **Active state**: Uses `usePathname()` from next/navigation, highlights current route with `bg-sidebar-accent`
- **Collapsed mode**: Icon-only with tooltips on hover for each nav item
- **Tenant header**: Shows tenant name (Coffee icon + name) and user role at top
- **Language toggle**: VI/EN toggle button at bottom of sidebar
- **Smooth transitions**: framer-motion `AnimatePresence` for text fade in/out on collapse/expand
- All shadcn/ui components used: Button, ScrollArea, Separator, Tooltip, Sheet

### 2. Created `/src/components/layout/dashboard-shell.tsx`
- Wrapper layout combining AppSidebar with main content area
- **Top header bar**: Sticky, glass-morphism (`bg-white/80 backdrop-blur-xl`)
  - Hamburger button (mobile only, `lg:hidden`) to open sidebar drawer
  - Breadcrumb navigation derived from pathname using BREADCRUMB_MAP with bilingual labels
  - Language toggle (compact VI/EN button)
  - User dropdown with avatar, name, role badge, and sign-out option
- **Main content**: Flex column with proper padding (`px-4 md:px-6 lg:px-8 py-6`)
- **Footer**: Sticky footer with copyright and branding
- **Sidebar offset**: Uses `useIsDesktop` custom hook (matchMedia listener) to compute `marginLeft` that matches sidebar width (64px collapsed / 256px expanded, 0 on mobile)
- **Collapse state**: Persisted to localStorage under key `sidebar-collapsed`
- **CSS transition**: Smooth `transition-[margin-left] duration-300` on main area

### 3. Updated `/src/app/dashboard/page.tsx`
- Wrapped entire content in `<DashboardShell>` component
- Removed standalone header/nav (Coffee icon, tenant name, navigation tabs, language toggle, sign-out button)
- Removed `min-h-screen bg-coffee-50/50` wrapper div (now handled by DashboardShell)
- Loading state also wrapped in DashboardShell
- All dashboard content (KPIs, charts, activity feed) remains unchanged

### 4. Updated `/src/app/farmers/page.tsx`
- Wrapped entire content in `<DashboardShell>` component
- Removed standalone header/nav (Coffee icon, tenant name, language toggle, back-to-dashboard button, sign-out button)
- Removed `min-h-screen bg-coffee-50/50` wrapper div
- Loading state also wrapped in DashboardShell
- All farmers content (search, table, pagination, dialog) remains unchanged

## Lint Results
- All lint errors resolved
- Key challenges: `react-hooks/set-state-in-effect` rule required avoiding `setMobileOpen(false)` in a `useEffect` — solved by relying on `onNavClick` callback in AppSidebar instead of pathname-based effect
- `react-hooks/refs` rule required avoiding ref access during render — removed ref-based pathname tracking

## Design Notes
- Coffee-themed colors: sidebar uses `sidebar-*` CSS variables which are mapped to coffee brown/amber tones in globals.css
- Space Mono font applied throughout via inline style
- Bilingual support (VI/EN) on all navigation labels and UI text
- Responsive: desktop sidebar (fixed, collapsible) + mobile drawer (Sheet from left)
- Smooth animations: framer-motion for sidebar width transition and text fade in/out
