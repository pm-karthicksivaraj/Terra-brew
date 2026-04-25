// Terra Brew Coffee Traceability Platform — Color Palette
// Inspired by coffee beans, roasted tones, and emerald farm fields

export const Colors = {
  // Primary — Rich coffee brown
  primary: '#6B4226',
  primaryLight: '#8B5A1E',
  primaryDark: '#4A2E18',

  // Secondary — Warm caramel
  secondary: '#D4A574',
  secondaryLight: '#E8C9A0',
  secondaryDark: '#B8864E',

  // Backgrounds
  background: '#FEFCE8',
  backgroundDark: '#1A1209',
  surface: '#FFFFFF',
  surfaceVariant: '#FFF8E7',

  // Text
  text: '#3C2415',
  textLight: '#8B7355',
  textInverse: '#FFFFFF',
  textMuted: '#A89880',

  // Status
  success: '#166534',
  successLight: '#DCFCE7',
  warning: '#92400E',
  warningLight: '#FEF3C7',
  error: '#991B1B',
  errorLight: '#FEE2E2',
  info: '#1E40AF',
  infoLight: '#DBEAFE',

  // Accent — Emerald green (farm/nature)
  accent: '#4A7C59',
  accentLight: '#6BA37A',
  accentDark: '#2F5A3C',

  // Borders & Dividers
  border: '#E5D5C0',
  borderLight: '#F0E8D8',
  divider: '#F5EFE3',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
};

// Typography scale
export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  h4: { fontSize: 18, fontWeight: '500' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
};

// Spacing constants
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Border radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Shadow presets
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Stage status colors for traceability
export const StageColors = {
  pending: Colors.warning,
  in_progress: Colors.info,
  completed: Colors.success,
  verified: Colors.accent,
  failed: Colors.error,
};
