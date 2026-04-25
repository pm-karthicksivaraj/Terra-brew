/**
 * App-wide constants for Terra Brew Mobile.
 */

export const APP_NAME = 'Terra Brew'
export const APP_VERSION = '1.0.0'

// API Configuration
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000'  // Android emulator
  : 'https://terrabrew.app'  // Production

// Colors — Dark theme matching the web platform
export const Colors = {
  primary: '#D4A853',       // Coffee gold
  primaryDark: '#B8922F',
  primaryLight: '#E8C97A',
  background: '#0A0A0A',
  surface: '#141414',
  surfaceLight: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  accent: '#8B5CF6',
  // Status colors
  verified: '#22C55E',
  pending: '#F59E0B',
  rejected: '#EF4444',
  active: '#22C55E',
  inactive: '#666666',
}

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

// Typography
export const Typography = {
  fontFamily: 'SpaceMono',
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  h4: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  mono: { fontSize: 13, fontWeight: '400' as const },
} as const

// Sync configuration
export const SYNC_CONFIG = {
  MAX_RETRIES: 5,
  RETRY_BASE_DELAY: 1000,    // 1 second
  RETRY_MAX_DELAY: 30000,    // 30 seconds
  SYNC_INTERVAL: 60000,      // 1 minute
  MAX_PENDING_CHANGES: 1000,
  BATCH_SIZE: 50,
  STALE_DATA_THRESHOLD: 300000, // 5 minutes
} as const

// NFC Configuration
export const NFC_CONFIG = {
  SCAN_TIMEOUT: 30000,       // 30 seconds
  NDEF_RECORD_TYPE: 'urn:nfc:ext:terrabrew.app:trace',
} as const

// Entity display names (Vietnamese)
export const ENTITY_LABELS: Record<string, string> = {
  Farmer: 'Nông dân',
  FarmLand: 'Đất nông nghiệp',
  Cultivation: 'Canh tác',
  HarvestTraceability: 'Thu hoạch',
  ProcurementRecord: 'Thu mua',
  ProcessingJobOrder: 'Chế biến',
  CoffeeInspection: 'Kiểm định',
  CertAssessment: 'Chứng nhận',
  SmartContract: 'Hợp đồng',
  MarketplaceListing: 'Gian hàng',
} as const

// Processing stages
export const PROCESSING_STAGES = [
  { value: 'receiving', label: 'Nhận hạt' },
  { value: 'sorting', label: 'Phân loại' },
  { value: 'pulping', label: 'Bóc vỏ' },
  { value: 'fermentation', label: 'Lên men' },
  { value: 'washing', label: 'Rửa' },
  { value: 'drying', label: 'Sấy khô' },
  { value: 'hulling', label: 'Tách vỏ lụa' },
  { value: 'grading', label: 'Phân hạng' },
  { value: 'roasting', label: 'Rang xay' },
  { value: 'packaging', label: 'Đóng gói' },
] as const

// Harvest methods
export const HARVEST_METHODS = [
  { value: 'Selective Picking', label: 'Thu hoạch chọn lọc' },
  { value: 'Strip Picking', label: 'Thu hoạch toàn bộ' },
  { value: 'Mechanical', label: 'Cơ giới' },
] as const

// Payment statuses
export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'partial', label: 'Thanh toán một phần' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'overdue', label: 'Quá hạn' },
] as const

// Coffee varieties
export const COFFEE_VARIETIES = [
  { value: 'Arabica', label: 'Arabica' },
  { value: 'Robusta', label: 'Robusta' },
  { value: 'Liberica', label: 'Liberica' },
  { value: 'Excelsa', label: 'Excelsa' },
  { value: 'Catimor', label: 'Catimor' },
  { value: 'Bourbon', label: 'Bourbon' },
  { value: 'Typica', label: 'Typica' },
] as const

// Processing methods
export const PROCESSING_METHODS = [
  { value: 'Washed', label: 'Rửa (Washed)' },
  { value: 'Natural', label: 'Tự nhiên (Natural)' },
  { value: 'Honey', label: 'Mật ong (Honey)' },
  { value: 'Wet Hulled', label: 'Ướt (Wet Hulled)' },
] as const
