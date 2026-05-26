import { create } from 'zustand'

export type ViewName =
  | 'login'
  | 'dashboard'
  | 'farmers'
  | 'farmer-form'
  | 'farmer-detail'
  | 'farmlands'
  | 'farmland-form'
  | 'farmland-detail'
  | 'cultivations'
  | 'cultivation-form'
  | 'nurseries'
  | 'nursery-form'
  | 'land-preparations'
  | 'land-prep-form'
  | 'crop-monitorings'
  | 'crop-monitoring-form'
  | 'fertilizer-apps'
  | 'fertilizer-app-form'
  | 'pest-disease-mgmts'
  | 'pest-disease-mgmt-form'
  | 'harvest-traceabilities'
  | 'harvest-trace-form'
  | 'collection-centres'
  | 'collection-centre-form'
  | 'procurement-records'
  | 'procurement-record-form'
  | 'procurement-transports'
  | 'procurement-transport-form'
  | 'processing-job-orders'
  | 'processing-job-order-form'
  | 'ps-cleaning-washing'
  | 'ps-depulping-fermentation'
  | 'ps-drying-hulling'
  | 'ps-grading-sorting'
  | 'ps-roasting-blending'
  | 'ps-grinding-packaging'
  | 'ps-quality-control'
  | 'coffee-inspections'
  | 'coffee-inspection-form'
  | 'cert-assessments'
  | 'cert-assessment-form'
  | 'smart-contracts'
  | 'smart-contract-form'
  | 'marketplace'
  | 'marketplace-form'
  | 'qr-scan'
  | 'qr-label'
  | 'trace-journey'
  | 'batches'
  | 'admin-reports'
  | 'credit-score'
  | 'eudr-compliance'
  | 'eudr-deforestation'
  | 'eudr-dds'
  | 'eudr-traces'
  | 'export-docs'
  | 'export-doc-form'
  | 'shipments'
  | 'shipment-form'
  | 'buyers'
  | 'buyer-form'
  | 'trading-contracts'
  | 'trading-contract-form'

export interface UserItem {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  tenantId: string
  tenantName?: string
  tenantSlug?: string
  tenantCountry?: string
  tenantCurrency?: string
}

export interface DashboardStats {
  totalFarmers: number
  totalFarmLands: number
  totalCultivations: number
  activeCertifications: number
  pendingInspections: number
  totalBatches: number
  avgCreditScore: number
  certifiedFarmers: number
  farmersPerProvince: { province: string; count: number }[]
  cultivationsByCrop: { crop: string; count: number }[]
  harvestTrends: { month: string; count: number }[]
  recentActivities: { id: string; type: string; description: string; date: string }[]
}

interface AppState {
  currentView: ViewName
  currentUser: UserItem | null
  selectedRecord: any | null
  sidebarOpen: boolean
  isLoading: boolean
  dashboardStats: DashboardStats | null

  setCurrentView: (view: ViewName) => void
  setCurrentUser: (user: UserItem | null) => void
  setSelectedRecord: (record: any | null) => void
  setSidebarOpen: (open: boolean) => void
  setIsLoading: (loading: boolean) => void
  setDashboardStats: (stats: DashboardStats | null) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'login',
  currentUser: null,
  selectedRecord: null,
  sidebarOpen: false,
  isLoading: false,
  dashboardStats: null,

  setCurrentView: (view) => set({ currentView: view }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setSelectedRecord: (record) => set({ selectedRecord: record }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  logout: () =>
    set({
      currentUser: null,
      selectedRecord: null,
      currentView: 'login',
      dashboardStats: null,
    }),
}))
